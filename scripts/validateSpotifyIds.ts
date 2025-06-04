import fetch from 'node-fetch';
import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Song {
  id: string;
  title: string;
  album: string;
  year: number;
  releaseYear?: number;
  spotifyId: string;
  imageUrl?: string;
  previewUrl?: string;
}

interface InvalidTrack {
  title: string;
  oldId: string;
  newId: string;
}

interface SpotifyTrack {
  name: string;
  id: string;
}

interface SpotifySearchResponse {
  tracks: {
    items: SpotifyTrack[];
  };
}

async function getSpotifyToken(): Promise<string> {
  const clientId = process.env.VITE_SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.VITE_SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Missing Spotify credentials');
  }

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64')
    },
    body: 'grant_type=client_credentials'
  });

  if (!response.ok) {
    throw new Error(`Failed to get Spotify token: ${response.status}`);
  }

  const data = await response.json() as { access_token: string };
  return data.access_token;
}

async function validateTrackId(trackId: string): Promise<boolean> {
  try {
    const token = await getSpotifyToken();
    const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error(`Invalid track ID ${trackId}: ${response.status}`);
      return false;
    }

    const track = (await response.json()) as SpotifyTrack;
    console.log(`Valid track: ${track.name} (${trackId})`);
    return true;
  } catch (error) {
    console.error(`Error validating track ${trackId}:`, error);
    return false;
  }
}

async function searchTrack(query: string): Promise<string | null> {
  try {
    const token = await getSpotifyToken();
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=1`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      console.error(`Search failed for "${query}": ${response.status}`);
      return null;
    }

    const data = (await response.json()) as SpotifySearchResponse;
    const track = data.tracks?.items[0];
    
    if (!track) {
      console.log(`No results found for "${query}"`);
      return null;
    }

    console.log(`Found track: ${track.name} (${track.id})`);
    return track.id;
  } catch (error) {
    console.error(`Error searching for "${query}":`, error);
    return null;
  }
}

async function validateAndUpdateIds() {
  console.log('Starting Spotify track ID validation...');
  
  // Read the songs data file
  const songsFile = await fs.readFile(path.join(__dirname, '../src/data/songs.ts'), 'utf-8');
  
  // Extract the songs array using regex
  const songsMatch = songsFile.match(/export const songs: Song\[\] = \[([\s\S]*?)\];/);
  if (!songsMatch) {
    throw new Error('Could not find songs array in file');
  }
  
  // Parse the songs array
  const songsText = `[${songsMatch[1]}]`;
  const songs = eval(songsText) as Song[];
  
  const invalidTracks: InvalidTrack[] = [];
  
  for (const song of songs) {
    console.log(`\nChecking "${song.title}"...`);
    const isValid = await validateTrackId(song.spotifyId);
    
    if (!isValid) {
      console.log(`Looking up correct ID for "${song.title}"...`);
      const newId = await searchTrack(`${song.title} artist:BINI`);
      
      if (newId) {
        console.log(`Found new ID for "${song.title}": ${newId}`);
        invalidTracks.push({
          title: song.title,
          oldId: song.spotifyId,
          newId
        });
      } else {
        console.log(`Could not find a replacement ID for "${song.title}"`);
      }
    }
    
    // Add a small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  if (invalidTracks.length > 0) {
    console.log('\nInvalid tracks found:');
    console.table(invalidTracks);
    
    // Update the songs file with new IDs
    let updatedSongsFile = songsFile;
    for (const track of invalidTracks) {
      const regex = new RegExp(`(spotifyId: ["'])${track.oldId}(["'])`);
      updatedSongsFile = updatedSongsFile.replace(regex, `$1${track.newId}$2`);
    }
    
    await fs.writeFile(path.join(__dirname, '../src/data/songs.ts'), updatedSongsFile);
    console.log('\nUpdated songs.ts with new Spotify IDs');
  } else {
    console.log('\nAll track IDs are valid!');
  }
}

validateAndUpdateIds().catch(console.error); 