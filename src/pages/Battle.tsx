import React, { useState, useEffect } from 'react';
import { Box, Button, Heading, Text, Stack, Grid, Progress, Image, useToast, Spinner } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { songs, type Song } from '../data/songs';
import { getTrackDetails } from '../utils/spotify';

// Generate pairs using an optimized tournament format
const generateAllPairs = (songList: Song[]): Array<[Song, Song]> => {
  const pairs: Array<[Song, Song]> = [];
  const shuffledSongs = [...songList].sort(() => Math.random() - 0.5);
  
  // First round: Sequential pairing (everyone plays their neighbors)
  for (let i = 0; i < shuffledSongs.length - 1; i += 2) {
    pairs.push([shuffledSongs[i], shuffledSongs[i + 1]]);
  }
  
  // Second round: Pair with songs 2 positions away
  for (let i = 0; i < shuffledSongs.length - 2; i += 1) {
    pairs.push([shuffledSongs[i], shuffledSongs[i + 2]]);
  }
  
  // Third round: Random sampling (each song gets 2 more random battles)
  shuffledSongs.forEach((song, i) => {
    let battlesAdded = 0;
    while (battlesAdded < 2) {
      const randomIndex = Math.floor(Math.random() * shuffledSongs.length);
      if (randomIndex !== i && !pairs.some(pair => 
        (pair[0].id === song.id && pair[1].id === shuffledSongs[randomIndex].id) ||
        (pair[1].id === song.id && pair[0].id === shuffledSongs[randomIndex].id)
      )) {
        pairs.push([song, shuffledSongs[randomIndex]]);
        battlesAdded++;
      }
    }
  });

  return pairs;
};

interface SongCardProps {
  song: Song;
  onClick: () => void;
}

const SongCard: React.FC<SongCardProps> = ({ song, onClick }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const toast = useToast();

  // Fetch album artwork
  useEffect(() => {
    const fetchAlbumArt = async () => {
      try {
        const details = await getTrackDetails(song.spotifyId);
        setImageUrl(details.imageUrl);
      } catch (error) {
        console.error('Error fetching album art:', error);
        setError('Failed to load album art');
        toast({
          title: 'Error loading album art',
          description: error instanceof Error ? error.message : 'Could not load album artwork',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlbumArt();
  }, [song.spotifyId, toast]);

  return (
    <Box
      p={2}
      borderWidth="1px"
      borderRadius="lg"
      cursor="pointer"
      onClick={onClick}
      transition="all 0.2s"
      position="relative"
      _hover={{
        transform: 'scale(1.02)',
        borderColor: 'teal.500',
      }}
      height="100%"
      display="flex"
      flexDirection="column"
    >
      <Stack spacing={2} align="center" flex={1}>
        <Box
          width="100%"
          paddingBottom="100%"
          bg="gray.700"
          borderRadius="md"
          position="relative"
          overflow="hidden"
        >
          {isLoading ? (
            <Box
              position="absolute"
              top="0"
              left="0"
              right="0"
              bottom="0"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Spinner color="teal.500" />
            </Box>
          ) : (
            <Image
              src={imageUrl || undefined}
              alt={song.title}
              position="absolute"
              top="0"
              left="0"
              width="100%"
              height="100%"
              objectFit="cover"
              fallback={
                <Box
                  position="absolute"
                  top="0"
                  left="0"
                  right="0"
                  bottom="0"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text color="gray.500">{error || 'No image available'}</Text>
                </Box>
              }
            />
          )}
        </Box>
        <Heading size="md" textAlign="center" noOfLines={1}>{song.title}</Heading>
        <Text color="gray.500" fontSize="sm" textAlign="center" noOfLines={1}>
          {song.album}
        </Text>
      </Stack>
    </Box>
  );
};

const Battle = () => {
  const navigate = useNavigate();
  const [currentBattle, setCurrentBattle] = useState(0);
  const [battlePairs] = useState(() => generateAllPairs(songs));
  const [winners, setWinners] = useState<string[]>([]);
  const [songScores, setSongScores] = useState<Record<string, { wins: number; battles: number }>>(() => {
    const scores: Record<string, { wins: number; battles: number }> = {};
    songs.forEach(song => {
      scores[song.id] = { wins: 0, battles: 0 };
    });
    return scores;
  });

  const handleSongSelect = (selectedSong: Song) => {
    // Update both songs' battle counts and the winner's win count
    const newScores = { ...songScores };
    const [song1, song2] = battlePairs[currentBattle];
    
    newScores[song1.id].battles++;
    newScores[song2.id].battles++;
    newScores[selectedSong.id].wins++;
    
    setSongScores(newScores);
    
    if (currentBattle + 1 >= battlePairs.length) {
      // Calculate final rankings based on win percentage
      const finalRankings = songs.sort((a, b) => {
        const aScore = newScores[a.id].wins / newScores[a.id].battles || 0;
        const bScore = newScores[b.id].wins / newScores[b.id].battles || 0;
        return bScore - aScore;
      });
      
      localStorage.setItem('songRankingResults', JSON.stringify(finalRankings));
      navigate('/results');
    } else {
      setCurrentBattle(prev => prev + 1);
    }
  };

  const handleBothLiked = () => {
    // Update both songs' battle counts and win counts
    const newScores = { ...songScores };
    const [song1, song2] = battlePairs[currentBattle];
    
    newScores[song1.id].battles++;
    newScores[song2.id].battles++;
    newScores[song1.id].wins++;
    newScores[song2.id].wins++;
    
    setSongScores(newScores);
    
    if (currentBattle + 1 >= battlePairs.length) {
      const finalRankings = songs.sort((a, b) => {
        const aScore = newScores[a.id].wins / newScores[a.id].battles || 0;
        const bScore = newScores[b.id].wins / newScores[b.id].battles || 0;
        return bScore - aScore;
      });
      localStorage.setItem('songRankingResults', JSON.stringify(finalRankings));
      navigate('/results');
    } else {
      setCurrentBattle(prev => prev + 1);
    }
  };

  const handleNoOpinion = () => {
    // Update both songs' battle counts without updating wins
    const newScores = { ...songScores };
    const [song1, song2] = battlePairs[currentBattle];
    
    newScores[song1.id].battles++;
    newScores[song2.id].battles++;
    
    setSongScores(newScores);
    
    if (currentBattle + 1 >= battlePairs.length) {
      const finalRankings = songs.sort((a, b) => {
        const aScore = newScores[a.id].wins / newScores[a.id].battles || 0;
        const bScore = newScores[b.id].wins / newScores[b.id].battles || 0;
        return bScore - aScore;
      });
      localStorage.setItem('songRankingResults', JSON.stringify(finalRankings));
      navigate('/results');
    } else {
      setCurrentBattle(prev => prev + 1);
    }
  };

  const totalBattles = battlePairs.length;
  const progress = (currentBattle / totalBattles) * 100;
  const currentPair = battlePairs[currentBattle];

  return (
    <Stack spacing={4} alignItems="center" p={2}>
      <Heading as="h1" size="xl" color="teal.500">
        Song Battle
      </Heading>
      <Text fontSize="lg" color="gray.300" textAlign="center" maxW="container.md">
        Choose your favorite song between the two options!
      </Text>
      <Grid 
        templateColumns="repeat(2, 1fr)" 
        gap={2} 
        w="full" 
        maxW="container.lg"
      >
        <SongCard
          song={currentPair[0]}
          onClick={() => handleSongSelect(currentPair[0])}
        />
        <SongCard
          song={currentPair[1]}
          onClick={() => handleSongSelect(currentPair[1])}
        />
      </Grid>
      <Stack direction="row" spacing={2} w="full" maxW="container.lg" justify="center">
        <Button
          colorScheme="teal"
          onClick={() => handleBothLiked()}
          size="md"
        >
          I Like Both
        </Button>
        <Button
          variant="ghost"
          onClick={() => handleNoOpinion()}
          size="md"
        >
          No Opinion
        </Button>
      </Stack>
      <Box w="full" maxW="container.lg">
        <Progress
          value={progress}
          size="sm"
          colorScheme="teal"
          borderRadius="full"
          mb={2}
        />
        <Text fontSize="sm" color="gray.500" textAlign="center">
          {Math.round(progress)}% Complete
        </Text>
      </Box>
    </Stack>
  );
};

export default Battle; 