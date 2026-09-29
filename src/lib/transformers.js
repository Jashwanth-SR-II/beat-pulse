export function jamendoTrackToDb(track) {
  return {
    id: String(track.id),
    title: track.name,
    artist: track.artist_name,
    album: track.album_name || null,
    duration: track.duration,
    artwork_url: track.image,
    audio_url: track.audio,
    genre_tags: track.musicinfo?.tags?.genres || [],
  }
}

export function jamendoTrackToUi(track) {
  // Support both raw Jamendo shape and already-transformed shapes
  const isRaw = track.name !== undefined
  if (isRaw) {
    return {
      id: String(track.id),
      title: track.name,
      artist: track.artist_name,
      album: track.album_name || 'Single',
      duration: track.duration,
      artwork: track.image,
      audio: track.audio,
      genre_tags: track.musicinfo?.tags?.genres || [],
      color: '#00FF66',
    }
  }
  // Already in UI shape
  return track
}