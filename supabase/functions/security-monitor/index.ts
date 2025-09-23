import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SecurityEvent {
  event_type: 'rate_limit_exceeded' | 'invalid_file_upload' | 'suspicious_activity' | 'authentication_failure';
  user_id?: string;
  ip_address?: string;
  details: Record<string, any>;
  severity: 'low' | 'medium' | 'high';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const event: SecurityEvent = await req.json();
    
    // Validate event structure
    if (!event.event_type || !event.details || !event.severity) {
      return new Response('Invalid event structure', { 
        status: 400, 
        headers: corsHeaders 
      });
    }

    // Log security event to database (you'd need to create a security_events table)
    console.log(`Security Event [${event.severity.toUpperCase()}]: ${event.event_type}`, {
      user_id: event.user_id,
      ip_address: event.ip_address,
      details: event.details,
      timestamp: new Date().toISOString()
    });

    // For high severity events, you could integrate with external monitoring
    if (event.severity === 'high') {
      console.warn(`HIGH SEVERITY SECURITY EVENT: ${event.event_type}`, event.details);
      
      // Here you could integrate with services like:
      // - Slack notifications
      // - Email alerts
      // - Discord webhooks
      // - External security monitoring systems
    }

    // Example: Track rate limiting violations
    if (event.event_type === 'rate_limit_exceeded') {
      // Could implement automatic IP blocking or user suspension
      console.log(`Rate limit exceeded for user ${event.user_id || 'anonymous'} from IP ${event.ip_address}`);
    }

    // Example: Track suspicious file uploads
    if (event.event_type === 'invalid_file_upload') {
      console.log(`Suspicious file upload attempt:`, event.details);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Security event logged',
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Security monitoring error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});