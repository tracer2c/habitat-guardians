import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Creating test rover log entry...');

    const { data, error } = await supabaseClient
      .from('system_events')
      .insert([{
        mode: 'mars',
        title: 'rover_activity',
        message: `[TEST] Real-time log test at ${new Date().toISOString()}`,
        event_type: 'rover_activity',
        severity: 'info',
        metadata: {
          test: true,
          rover_name: 'Test Rover',
          timestamp: new Date().toISOString()
        }
      }])
      .select();

    if (error) {
      console.error('Error creating log:', error);
      throw error;
    }

    console.log('Test log created:', data);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Test log entry created',
        data 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in test-rover-log function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
