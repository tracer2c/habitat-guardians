import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { currentReading, alerts } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const systemPrompt = `You are an AI mission planner for Mars habitat operations. Based on current environmental conditions and alerts, generate appropriate missions for rovers and crew. Consider:
- Environmental hazards requiring immediate attention
- Routine maintenance schedules
- Scientific opportunities
- Resource management
- Crisis prevention

Generate 2-4 missions that are specific, actionable, and prioritized correctly.`;

    const userPrompt = `Current Habitat Status:
- Temperature: ${currentReading?.temperature}°C
- Oxygen: ${currentReading?.oxygen}%
- Power: ${currentReading?.power}%
- Humidity: ${currentReading?.humidity}%
- Stability: ${currentReading?.stabilityScore}
${currentReading?.is_crisis ? `- CRISIS: ${currentReading?.crisis_type}` : ''}

Active Alerts:
${alerts?.slice(0, 5).map((a: any) => `- [${a.severity}] ${a.message}`).join('\n') || 'None'}

Generate appropriate missions.`;

    const body: any = {
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      tools: [{
        type: 'function',
        function: {
          name: 'generate_missions',
          description: 'Generate Mars habitat missions based on current conditions',
          parameters: {
            type: 'object',
            properties: {
              missions: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    description: { type: 'string' },
                    priority: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
                    category: { type: 'string', enum: ['rover', 'habitat', 'science', 'maintenance'] },
                    assigned_to: { type: 'string' },
                    estimated_duration: { type: 'number' }
                  },
                  required: ['title', 'description', 'priority', 'category', 'estimated_duration']
                }
              }
            },
            required: ['missions']
          }
        }
      }],
      tool_choice: { type: 'function', function: { name: 'generate_missions' } }
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
      throw new Error('No missions generated');
    }

    const missions = JSON.parse(toolCall.function.arguments).missions;

    // Insert missions into database
    const { data: insertedMissions, error: insertError } = await supabase
      .from('mars_missions')
      .insert(missions.map((m: any) => ({
        ...m,
        status: 'pending'
      })))
      .select();

    if (insertError) {
      console.error('Error inserting missions:', insertError);
      throw insertError;
    }

    return new Response(JSON.stringify({ 
      missions: insertedMissions,
      count: insertedMissions?.length || 0
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating missions:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      missions: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
