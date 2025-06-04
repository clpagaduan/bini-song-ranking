import axios from 'axios';
import { Song } from '../data/songs';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface BattleResult {
  winner: Song;
  loser: Song;
}

interface GlobalRanking {
  songId: string;
  wins: number;
  battles: number;
  winRate: number;
}

export const submitBattleResults = async (results: BattleResult[]) => {
  try {
    const response = await axios.post(`${API_URL}/api/rankings/batch`, { results });
    return response.data;
  } catch (error) {
    console.error('Error submitting battle results:', error);
    throw error;
  }
};

export const getGlobalRankings = async (): Promise<GlobalRanking[]> => {
  try {
    const response = await axios.get(`${API_URL}/api/rankings`);
    return response.data;
  } catch (error) {
    console.error('Error fetching global rankings:', error);
    throw error;
  }
}; 