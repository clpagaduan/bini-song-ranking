import React, { useEffect, useState } from 'react';
import { Stack, Heading, Text, Box, Button } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import type { Song } from '../data/songs';

const Results = () => {
  const [winners, setWinners] = useState<Song[]>([]);

  useEffect(() => {
    const storedResults = localStorage.getItem('songRankingResults');
    if (storedResults) {
      setWinners(JSON.parse(storedResults));
    }
  }, []);

  if (winners.length === 0) {
    return (
      <Stack direction="column" align="center" textAlign="center" gap={8}>
        <Heading as="h1" size="xl" color="bini.500">
          No Results Yet
        </Heading>
        <Text fontSize="lg" maxW="container.md">
          Complete the song battle first to see your rankings!
        </Text>
        <Link to="/battle">
          <Button colorPalette="bini">
            Start Battle
          </Button>
        </Link>
      </Stack>
    );
  }

  return (
    <Stack direction="column" align="center" textAlign="center" gap={8}>
      <Heading as="h1" size="xl" color="bini.500">
        Your BINI Song Ranking
      </Heading>
      <Text fontSize="lg" maxW="container.md">
        Here's how you ranked BINI's songs!
      </Text>
      <Box w="full" maxW="container.md">
        <Stack direction="column" gap={4}>
          {winners.map((song, index) => (
            <Box
              key={song.id}
              p={4}
              bg="white"
              borderRadius="md"
              boxShadow="sm"
              display="flex"
              alignItems="center"
            >
              <Text fontSize="2xl" fontWeight="bold" color="bini.500" mr={4}>
                #{index + 1}
              </Text>
              <Box>
                <Text fontSize="lg" fontWeight="bold">
                  {song.title}
                </Text>
                <Text fontSize="sm" color="gray.600">
                  {song.album} ({song.releaseYear})
                  {song.featuring && ` feat. ${song.featuring}`}
                </Text>
              </Box>
            </Box>
          ))}
        </Stack>
      </Box>
      <Link to="/battle">
        <Button colorPalette="bini">
          Start New Battle
        </Button>
      </Link>
    </Stack>
  );
};

export default Results; 