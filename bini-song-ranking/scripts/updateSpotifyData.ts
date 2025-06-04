import { songs, type Song } from '../src/data/songs';
import { updateSongWithSpotifyData } from '../src/utils/spotify';
import * as fs from 'fs/promises';
import * as path from 'path';

async function updateSongs() {
  const updatedSongs: Song[] = [];
  
  for (const song of songs) {
    console.log(`Fetching data for: ${song.title}`);
    const spotifyData = await updateSongWithSpotifyData(song.title);
    
    updatedSongs.push({
      ...song,
      ...spotifyData,
    });
    
    // Add a small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  const songsFileContent = `export interface Song {
  id: string;
  title: string;
  album: string;
  releaseYear: number;
  featuring?: string;
  spotifyId?: string;
  previewUrl?: string;
  imageUrl?: string;
}

export const songs: Song[] = ${JSON.stringify(updatedSongs, null, 2)};
`;

  await fs.writeFile(
    path.join(__dirname, '../src/data/songs.ts'),
    songsFileContent
  );
  
  console.log('Songs updated successfully!');
}

updateSongs().catch(console.error); 