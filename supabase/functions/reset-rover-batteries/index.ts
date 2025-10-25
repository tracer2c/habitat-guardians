import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Resetting all rover batteries to 100%...');

    // Update all rovers to have 100% battery and idle status
    const { data, error } = await supabaseClient
      .from('rover_status')
      .update({ 
        battery_level: 100,
        status: 'idle',
        current_task_id: null,
        location_x: 0,
        location_y: 0
      })
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Update all records

    if (error) {
      console.error('Error resetting rovers:', error);
      throw error;
    }

    console.log('Successfully reset rover batteries:', data);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'All rovers reset to 100% battery',
        data 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in reset-rover-batteries function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
