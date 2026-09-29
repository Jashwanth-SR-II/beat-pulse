import { supabase } from './supabaseClient'

// All Jamendo calls go through the Edge Function proxy
export async function fetchTracks({
  limit = 20,
  tags = null,
  search = null,
  order = 'popularity_total',
  offset = 0
} = {}) {
  const { data, error } = await supabase.functions.invoke('jamendo-proxy', {
    body: {
      endpoint: 'tracks',
      params: {
        limit,
        order,
        offset,
        ...(tags && { tags }),
        ...(search && { search }),
        include: 'musicinfo',
        audioformat: 'mp32'
      }
    }
  })

  if (error) throw new Error(error.message)
  return data.results || []
}

export async function fetchTrackById(id) {
  const { data, error } = await supabase.functions.invoke('jamendo-proxy', {
    body: {
      endpoint: 'tracks',
      params: { id, include: 'musicinfo' }
    }
  })
  if (error) throw new Error(error.message)
  return data.results?.[0] || null
}

export async function fetchArtists({ limit = 10, order = 'popularity_total' } = {}) {
  const { data, error } = await supabase.functions.invoke('jamendo-proxy', {
    body: {
      endpoint: 'artists',
      params: {
        limit,
        order,
        hasimage: 'true',
      },
    },
  })

  if (error) throw new Error(error.message)
  return data.results || []
}

export async function searchArtistByName(name) {
  const { data, error } = await supabase.functions.invoke('jamendo-proxy', {
    body: {
      endpoint: 'artists',
      params: {
        namesearch: name,
        limit: 1,
        hasimage: 'true',
      },
    },
  })
  if (error) throw new Error(error.message)
  return data.results?.[0] || null
}

export async function fetchArtistTracks(artistName, limit = 20) {
  const { data, error } = await supabase.functions.invoke('jamendo-proxy', {
    body: {
      endpoint: 'tracks',
      params: {
        artist_name: artistName,
        limit,
        include: 'musicinfo',
        audioformat: 'mp32',
        order: 'popularity_total',
      },
    },
  })
  if (error) throw new Error(error.message)
  return data.results || []
}