const CLIENT_ID = '61e3a32f70524ee5bb4afc952a34a3d1';
const CLIENT_SECRET = '0d25ca57fedd41ada4b3e3a93085b422';

interface SpotifyToken {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface SpotifyTrack {
  id: string;
  name: string;
  preview_url: string | null;
  album: {
    images: Array<{
      url: string;
      height: number;
      width: number;
    }>;
  };
}

async function getSpotifyToken(): Promise<string> {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: 'Basic ' + btoa(CLIENT_ID + ':' + CLIENT_SECRET),
    },
    body: 'grant_type=client_credentials',
  });

  const data: SpotifyToken = await response.json();
  return data.access_token;
}

export async function searchTrack(query: string): Promise<SpotifyTrack | null> {
  const token = await getSpotifyToken();
  
  const response = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=1`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();
  return data.tracks.items[0] || null;
}

export async function getTrackById(trackId: string): Promise<SpotifyTrack | null> {
  const token = await getSpotifyToken();
  
  const response = await fetch(
    `https://api.spotify.com/v1/tracks/${trackId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) return null;
  return await response.json();
}

export async function updateSongWithSpotifyData(title: string, artist: string = 'BINI'): Promise<{
  spotifyId?: string;
  previewUrl?: string;
  imageUrl?: string;
}> {
  try {
    const query = `${title} artist:${artist}`;
    const track = await searchTrack(query);
    
    if (!track) return {};
    
    return {
      spotifyId: track.id,
      previewUrl: track.preview_url || undefined,
      imageUrl: track.album.images[0]?.url,
    };
  } catch (error) {
    console.error(`Error fetching Spotify data for ${title}:`, error);
    return {};
  }
} 