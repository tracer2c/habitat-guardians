import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mode, currentReading, alerts, predictions } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = mode === 'mars'
      ? `You are an AI assistant for a Mars habitat environmental control system. Analyze the current environmental conditions, alerts, and predictions to provide 3-5 actionable recommendations for habitat operations. Focus on:
- Life support systems (oxygen, temperature, pressure)
- Power management
- Crisis prevention
- Crew safety
- Equipment maintenance

Be specific and prioritize based on severity.`
      : `You are an AI assistant for a real-time weather monitoring system at NASA centers. Analyze the current weather conditions, alerts, and predictions to provide 3-5 actionable recommendations for weather preparedness. Focus on:
- Outdoor operations safety
- Equipment protection
- Staff safety
- Launch window considerations
- Preventive measures

Be specific and practical.`;

    const userPrompt = `Current Status:
- Mode: ${mode}
- Temperature: ${currentReading?.temperature}°C
- ${mode === 'mars' ? 'Oxygen' : 'Air Quality'}: ${currentReading?.oxygen}${mode === 'mars' ? '%' : ' AQI'}
- Humidity: ${currentReading?.humidity}%
- ${mode === 'mars' ? 'Power' : 'Pressure'}: ${mode === 'mars' ? currentReading?.power + '%' : currentReading?.pressure + ' hPa'}
- Stability Score: ${currentReading?.stabilityScore}
${currentReading?.is_crisis ? `- CRISIS MODE: ${currentReading?.crisis_type}` : ''}

Recent Alerts (${alerts?.length || 0}):
${alerts?.slice(0, 3).map((a: any) => `- [${a.severity}] ${a.message}`).join('\n') || 'None'}

Predictions:
${predictions?.slice(0, 3).map((p: any) => `- ${p.metric}: ${p.alert} (confidence: ${p.confidence}%)`).join('\n') || 'None'}

Provide 3-5 actionable recommendations.`;

    const body: any = {
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      tools: [{
        type: 'function',
        function: {
          name: 'provide_recommendations',
          description: 'Return 3-5 actionable recommendations based on environmental analysis',
          parameters: {
            type: 'object',
            properties: {
              recommendations: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    action: { type: 'string' },
                    priority: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
                    category: { type: 'string', enum: ['immediate', 'preventive', 'monitoring'] },
                    impact: { type: 'string' },
                    timeframe: { type: 'string' }
                  },
                  required: ['action', 'priority', 'category', 'impact', 'timeframe']
                }
              }
            },
            required: ['recommendations']
          }
        }
      }],
      tool_choice: { type: 'function', function: { name: 'provide_recommendations' } }
    };

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error('No recommendations generated');
    }

    const recommendations = JSON.parse(toolCall.function.arguments).recommendations;

    return new Response(JSON.stringify({ recommendations }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating recommendations:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      recommendations: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
