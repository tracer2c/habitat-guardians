import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const { mode, currentReading, recentAlerts } = await req.json();
    
    if (!mode || !currentReading) {
      throw new Error('Missing required parameters: mode and currentReading');
    }

    console.log(`Generating advisory for ${mode} mode`, {
      temperature: currentReading.temperature,
      stabilityScore: currentReading.stabilityScore,
      alertCount: recentAlerts?.length || 0
    });

    // Build context for AI
    const alertsSummary = recentAlerts && recentAlerts.length > 0
      ? recentAlerts.map((a: any) => `${a.severity.toUpperCase()}: ${a.message}`).join('\n')
      : 'No recent alerts';

    const systemPrompt = mode === 'mars'
      ? `You are an AI assistant for a Mars habitat life support system. Provide concise, actionable recommendations based on current environmental readings and alerts. Focus on critical issues first. Keep responses under 150 words.`
      : `You are an AI weather advisor providing real-time recommendations based on current weather conditions. Give practical advice for the current weather. Keep responses under 150 words.`;

    const userPrompt = mode === 'mars'
      ? `Current Mars Habitat Status:
- Temperature: ${currentReading.temperature}°C (optimal: 18-24°C)
- Oxygen: ${currentReading.oxygen}% (optimal: 19.5-23%)
- Power: ${currentReading.power}% (optimal: >60%)
- Humidity: ${currentReading.humidity}% (optimal: 30-60%)
- Pressure: ${currentReading.pressure} Pa
- Radiation: ${currentReading.radiation} Sv/h
- Stability Score: ${currentReading.stabilityScore}/100
- Crisis Status: ${currentReading.is_crisis ? `ACTIVE - ${currentReading.crisis_type}` : 'Normal'}

Recent Alerts:
${alertsSummary}

Provide specific recommendations to optimize the habitat environment. If there's a crisis, prioritize that. Otherwise, suggest improvements for any parameters outside optimal ranges.`
      : `Current Weather Conditions:
- Temperature: ${currentReading.temperature}°C
- Air Quality Index: ${currentReading.oxygen}
- Humidity: ${currentReading.humidity}%
- Pressure: ${currentReading.pressure} hPa
- CO2 Level: ${currentReading.co2_level} ppm
- Weather Score: ${currentReading.stabilityScore}/100

Recent Weather Alerts:
${alertsSummary}

Provide practical recommendations for the current weather conditions. Include advice on outdoor activities, health considerations, and any precautions to take.`;

    // Call Lovable AI Gateway
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI Gateway error:', errorText);
      throw new Error(`AI Gateway error: ${aiResponse.status} - ${errorText}`);
    }

    const aiData = await aiResponse.json();
    const recommendation = aiData.choices[0]?.message?.content;

    if (!recommendation) {
      throw new Error('No recommendation generated from AI');
    }

    console.log('Generated advisory:', recommendation.substring(0, 100) + '...');

    // Determine priority level based on stability score and alerts
    let priority: 'low' | 'medium' | 'high' = 'low';
    const criticalAlerts = recentAlerts?.filter((a: any) => a.severity === 'critical') || [];
    
    if (currentReading.is_crisis || criticalAlerts.length > 0) {
      priority = 'high';
    } else if (currentReading.stabilityScore < 60) {
      priority = 'medium';
    } else if (currentReading.stabilityScore < 80) {
      priority = 'low';
    }

    const advisory = {
      title: currentReading.is_crisis 
        ? `🚨 Crisis Response Required`
        : priority === 'high'
        ? `⚠️ Immediate Attention Needed`
        : priority === 'medium'
        ? `📊 System Optimization Recommended`
        : `✅ Operations Normal`,
      message: recommendation,
      priority,
      timestamp: new Date().toISOString(),
    };

    return new Response(
      JSON.stringify({ success: true, advisory }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error generating advisory:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
