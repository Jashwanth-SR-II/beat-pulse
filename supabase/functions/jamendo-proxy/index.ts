import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const JAMENDO_BASE = 'https://api.jamendo.com/v3.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { endpoint, params } = await req.json()
    const clientId = Deno.env.get('JAMENDO_CLIENT_ID')

    if (!clientId) {
      throw new Error('JAMENDO_CLIENT_ID not configured')
    }

    // Build Jamendo URL
    const query = new URLSearchParams({
      client_id: clientId,
      format: 'json',
      ...params
    })

    const url = `${JAMENDO_BASE}/${endpoint}/?${query}`
    const response = await fetch(url)
    const data = await response.json()

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})