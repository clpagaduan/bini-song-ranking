/// <reference types="vite/client" />

import SpotifyWebApi from 'spotify-web-api-node';
import { songs } from '../data/songs';
import { getAccessToken } from './auth';

const REDIRECT_URI = 'http://localhost:3000/callback';
const SCOPES = [
  'streaming',
  'user-read-email',
  'user-read-private',
  'user-read-playback-state',
  'user-modify-playback-state'
];

const getCredentials = () => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return {
      clientId: import.meta.env.VITE_SPOTIFY_CLIENT_ID,
      clientSecret: import.meta.env.VITE_SPOTIFY_CLIENT_SECRET
    };
  }
  return {
    clientId: process.env.SPOTIFY_CLIENT_ID || '',
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET || ''
  };
};

const spotifyApi = new SpotifyWebApi({
  ...getCredentials(),
  redirectUri: REDIRECT_URI
});

export const getAuthUrl = () => {
  const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    scope: SCOPES.join(' '),
    state: 'state'
  });
  return `https://accounts.spotify.com/authorize?${params.toString()}`;
};

export const handleAuthCallback = async (code: string) => {
  try {
    const data = await spotifyApi.authorizationCodeGrant(code);
    spotifyApi.setAccessToken(data.body.access_token);
    spotifyApi.setRefreshToken(data.body.refresh_token);
    localStorage.setItem('spotify_access_token', data.body.access_token);
    localStorage.setItem('spotify_refresh_token', data.body.refresh_token);
    localStorage.setItem('spotify_token_expiry', (Date.now() + data.body.expires_in * 1000).toString());
    return data.body.access_token;
  } catch (error) {
    console.error('Error handling auth callback:', error);
    throw error;
  }
};

export const refreshAccessToken = async () => {
  try {
    const refreshToken = localStorage.getItem('spotify_refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    spotifyApi.setRefreshToken(refreshToken);
    const data = await spotifyApi.refreshAccessToken();
    spotifyApi.setAccessToken(data.body.access_token);
    localStorage.setItem('spotify_access_token', data.body.access_token);
    localStorage.setItem('spotify_token_expiry', (Date.now() + data.body.expires_in * 1000).toString());
    return data.body.access_token;
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw error;
  }
};

// Add Spotify Player type
declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    Spotify: {
      Player: new (options: any) => any;
    };
  }
}

let player: any = null;
let isPremiumUser = false;

export const checkPremiumStatus = async (): Promise<boolean> => {
  try {
    const token = localStorage.getItem('spotify_access_token');
    if (!token) return false;

    const response = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) return false;

    const data = await response.json();
    isPremiumUser = data.product === 'premium';
    return isPremiumUser;
  } catch (error) {
    console.error('Error checking premium status:', error);
    return false;
  }
};

export const initializePlayer = async (token: string): Promise<void> => {
  try {
    // Check if user has premium
    isPremiumUser = await checkPremiumStatus();
    console.log('User has premium:', isPremiumUser);

    if (!isPremiumUser) {
      console.log('Free account detected, using preview URLs for playback');
      return;
    }

    // Only initialize Web Playback SDK for premium users
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      script.async = true;

      document.body.appendChild(script);

      window.onSpotifyWebPlaybackSDKReady = () => {
        player = new window.Spotify.Player({
          name: 'BINI Song Ranking Player',
          getOAuthToken: (cb: (token: string) => void) => {
            cb(token);
          },
          volume: 0.5
        });

        player.addListener('ready', ({ device_id }: { device_id: string }) => {
          console.log('Ready with Device ID', device_id);
          resolve();
        });

        player.addListener('not_ready', ({ device_id }: { device_id: string }) => {
          console.log('Device ID has gone offline', device_id);
        });

        player.addListener('initialization_error', ({ message }: { message: string }) => {
          console.error('Failed to initialize', message);
          reject(new Error(message));
        });

        player.addListener('authentication_error', ({ message }: { message: string }) => {
          console.error('Failed to authenticate', message);
          reject(new Error(message));
        });

        player.addListener('account_error', ({ message }: { message: string }) => {
          console.error('Failed to validate Spotify account', message);
          reject(new Error(message));
        });

        player.connect();
      };
    });
  } catch (error) {
    console.error('Error initializing player:', error);
    throw error;
  }
};

export const playTrack = async (trackId: string): Promise<void> => {
  try {
    // Get track details first
    const track = await getTrackDetails(trackId);
    
    // Try to play using preview URL if available
    if (track.previewUrl) {
      const audio = new Audio(track.previewUrl);
      audio.volume = 0.5;
      await audio.play();
      // Store the audio element for later pause/stop
      (window as any).currentAudio = audio;
      return;
    }

    // If no preview URL, check if user is premium
    const isPremium = await checkPremiumStatus();
    
    if (!isPremium) {
      // If not premium and no preview URL, show login prompt
      const shouldLogin = window.confirm(
        'This track requires Spotify Premium to play. Would you like to log in to Spotify?'
      );
      
      if (shouldLogin) {
        window.location.href = getAuthUrl();
      } else {
        throw new Error('This track requires Spotify Premium to play');
      }
      return;
    }

    // User is premium, try premium playback
    if (track.isPlayable) {
      const token = localStorage.getItem('spotify_access_token');
      if (!token) {
        throw new Error('Not authenticated with Spotify');
      }

      const response = await fetch(`https://api.spotify.com/v1/me/player/play`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uris: [`spotify:track:${trackId}`]
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to play track: ${error}`);
      }
    } else {
      throw new Error('This track is not available for playback');
    }
  } catch (error) {
    console.error('Error playing track:', error);
    throw error;
  }
};

export const pausePlayback = async (): Promise<void> => {
  if (!isPremiumUser) {
    // For free users, pause the HTML5 Audio element
    const audio = (window as any).currentAudio;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    return;
  }

  // For premium users, use the Web Playback SDK
  if (!player) {
    throw new Error('Player not initialized');
  }

  try {
    await player.pause();
  } catch (error) {
    console.error('Error pausing playback:', error);
    throw error;
  }
};

// Update getSpotifyToken to include necessary scopes
export const getSpotifyToken = async (): Promise<string> => {
  try {
    const accessToken = localStorage.getItem('spotify_access_token');
    const tokenExpiry = localStorage.getItem('spotify_token_expiry');

    if (accessToken && tokenExpiry && Date.now() < parseInt(tokenExpiry)) {
      console.log('Using existing access token');
      return accessToken;
    }

    if (localStorage.getItem('spotify_refresh_token')) {
      console.log('Refreshing access token');
      return await refreshAccessToken();
    }

    // Redirect to Spotify authorization with necessary scopes
    const scopes = [
      'streaming',
      'user-read-email',
      'user-read-private',
      'user-read-playback-state',
      'user-modify-playback-state'
    ];

    const authUrl = `https://accounts.spotify.com/authorize?client_id=${getCredentials().clientId}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(scopes.join(' '))}`;
    window.location.href = authUrl;
    return '';
  } catch (error) {
    console.error('Error getting Spotify token:', error);
    throw error;
  }
};

interface TrackDetails {
  imageUrl: string;
  previewUrl: string | null;
  isPlayable: boolean;
}

export const getTrackDetails = async (trackId: string): Promise<TrackDetails> => {
  const accessToken = await getAccessToken();
  
  if (!accessToken) {
    throw new Error('No access token available');
  }

  const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch track details: ${response.statusText}`);
  }

  const data = await response.json();
  
  // Get the largest available image
  const imageUrl = data.album.images[0]?.url;
  if (!imageUrl) {
    throw new Error('No album artwork available');
  }

  return {
    imageUrl,
    previewUrl: data.preview_url,
    isPlayable: data.is_playable !== false
  };
};

export const searchTrack = async (query: string) => {
  await getSpotifyToken();
  const searchResults = await spotifyApi.searchTracks(query);
  const track = searchResults.body.tracks?.items[0];
  if (!track) return null;
  return {
    id: track.id,
    previewUrl: track.preview_url,
    imageUrl: track.album.images[0]?.url
  };
};

export const getSongDetails = async (spotifyId: string) => {
  await getSpotifyToken();
  const track = await spotifyApi.getTrack(spotifyId);
  return {
    previewUrl: track.body.preview_url,
    imageUrl: track.body.album.images[0]?.url
  };
};

export const getMultipleSongDetails = async (spotifyIds: string[]) => {
  await getSpotifyToken();
  const tracks = await spotifyApi.getTracks(spotifyIds);
  return tracks.body.tracks.map(track => ({
    id: track.id,
    previewUrl: track.preview_url,
    imageUrl: track.album.images[0]?.url
  }));
};

export const testPreviewAvailability = async () => {
  try {
    // Test with a known popular track that usually has a preview
    const testTrackId = '11dFghVXANMlKmJXsNCbNl'; // "Cut To The Feeling" by Carly Rae Jepsen
    console.log('Testing preview availability with a known track...');
    const token = await getSpotifyToken();
    
    const response = await fetch(`https://api.spotify.com/v1/tracks/${testTrackId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch test track: ${response.status}`);
    }

    const track = await response.json();
    console.log('Test track preview availability:', {
      name: track.name,
      artist: track.artists[0].name,
      previewUrl: track.preview_url,
      isPlayable: track.is_playable,
      availableMarkets: track.available_markets
    });

    // Now test one of our BINI tracks
    const biniTrackId = songs[0].spotifyId;
    const biniResponse = await fetch(`https://api.spotify.com/v1/tracks/${biniTrackId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!biniResponse.ok) {
      throw new Error(`Failed to fetch BINI track: ${biniResponse.status}`);
    }

    const biniTrack = await biniResponse.json();
    console.log('BINI track preview availability:', {
      name: biniTrack.name,
      artist: biniTrack.artists[0].name,
      previewUrl: biniTrack.preview_url,
      isPlayable: biniTrack.is_playable,
      availableMarkets: biniTrack.available_markets
    });
  } catch (error) {
    console.error('Error testing preview availability:', error);
  }
}; 