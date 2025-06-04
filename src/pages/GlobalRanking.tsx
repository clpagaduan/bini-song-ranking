import React, { useEffect, useState } from 'react';
import { Box, Heading, Text, VStack, List, ListItem, Spinner, useToast } from '@chakra-ui/react';
import { getGlobalRankings } from '../services/api';
import { songs } from '../data/songs';

interface GlobalRanking {
  songId: string;
  wins: number;
  battles: number;
  winRate: number;
}

const GlobalRanking = () => {
  const [rankings, setRankings] = useState<GlobalRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        const data = await getGlobalRankings();
        setRankings(data);
      } catch (error) {
        console.error('Error fetching rankings:', error);
        toast({
          title: 'Error loading rankings',
          description: 'Failed to load global rankings. Please try again later.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRankings();
  }, [toast]);

  if (loading) {
    return (
      <Box textAlign="center" py={20}>
        <Spinner size="xl" color="bini.500" />
        <Text mt={4}>Loading global rankings...</Text>
      </Box>
    );
  }

  return (
    <VStack spacing={8} align="stretch">
      <Heading color="bini.700" textAlign="center">
        Global BINI Song Rankings
      </Heading>
      <Text textAlign="center" color="gray.600">
        Based on {rankings.reduce((acc, r) => acc + r.battles, 0)} total battles
      </Text>

      <List spacing={4}>
        {rankings.map((ranking, index) => {
          const song = songs.find(s => s.id === ranking.songId);
          if (!song) return null;

          return (
            <ListItem
              key={ranking.songId}
              p={4}
              bg="white"
              borderRadius="lg"
              boxShadow="sm"
              display="flex"
              alignItems="center"
            >
              <Text fontSize="2xl" fontWeight="bold" color="bini.500" mr={4}>
                #{index + 1}
              </Text>
              <Box flex="1">
                <Text fontSize="xl" fontWeight="semibold">
                  {song.title}
                </Text>
                <Text color="gray.600">
                  {song.album} ({song.year})
                </Text>
              </Box>
              <Box textAlign="right">
                <Text color="bini.600" fontWeight="bold">
                  {(ranking.winRate * 100).toFixed(1)}% win rate
                </Text>
                <Text fontSize="sm" color="gray.500">
                  {ranking.wins} wins in {ranking.battles} battles
                </Text>
              </Box>
            </ListItem>
          );
        })}
      </List>
    </VStack>
  );
};

export default GlobalRanking; 