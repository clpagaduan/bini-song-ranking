import React, { useState, useEffect, useRef } from 'react';
import { Box, Button, Heading, Text, Stack, Grid, Image, Spinner, Progress } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { songs, type Song } from '../data/songs';
import { FaPlay, FaPause } from 'react-icons/fa';
import { searchTrack } from '../utils/spotify';

// Generate all possible unique pairs of songs
const generateAllPairs = (songList: Song[]): Array<[Song, Song]> => {
  const pairs: Array<[Song, Song]> = [];
  for (let i = 0; i < songList.length; i++) {
    for (let j = i + 1; j < songList.length; j++) {
      pairs.push([songList[i], songList[j]]);
    }
  }
  return pairs.sort(() => Math.random() - 0.5);
};

const SongCard = ({ song, onClick }: { song: Song; onClick: () => void }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [songData, setSongData] = useState(song);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Reset state when song changes
  useEffect(() => {
    setSongData(song);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, [song]);

  useEffect(() => {
    const fetchSpotifyData = async () => {
      setIsLoading(true);
      try {
        const trackData = await searchTrack(`${song.title} artist:BINI`);
        if (trackData) {
          setSongData(prev => ({
            ...prev,
            previewUrl: trackData.preview_url || undefined,
            imageUrl: trackData.album.images[0]?.url
          }));
        }
      } catch (error) {
        console.error('Error fetching Spotify data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSpotifyData();
  }, [song.title]);

  const handlePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  return (
    <Button
      height="300px"
      width="full"
      variant="outline"
      colorScheme="teal"
      onClick={onClick}
      display="flex"
      flexDirection="column"
      gap={2}
      p={4}
      position="relative"
      overflow="hidden"
      backgroundColor="gray.900"
      _hover={{ backgroundColor: "gray.800" }}
    >
      <Box position="relative" width="150px" height="150px" margin="0 auto">
        {isLoading ? (
          <Box
            width="100%"
            height="100%"
            display="flex"
            alignItems="center"
            justifyContent="center"
            bg="gray.800"
            borderRadius="md"
          >
            <Spinner color="teal.500" />
          </Box>
        ) : songData.imageUrl ? (
          <Box position="relative">
            <Image
              src={songData.imageUrl}
              alt={songData.title}
              width="150px"
              height="150px"
              objectFit="cover"
              borderRadius="md"
            />
            {songData.previewUrl && (
              <>
                <audio
                  ref={audioRef}
                  src={songData.previewUrl}
                  onEnded={() => setIsPlaying(false)}
                />
                <Box
                  position="absolute"
                  top={0}
                  left={0}
                  right={0}
                  bottom={0}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  backgroundColor={isPlaying ? "rgba(0, 0, 0, 0.5)" : "transparent"}
                  transition="background-color 0.2s"
                  borderRadius="md"
                  _hover={{
                    backgroundColor: "rgba(0, 0, 0, 0.5)"
                  }}
                >
                  <Button
                    onClick={handlePlayPause}
                    colorScheme="teal"
                    rounded="full"
                    size="lg"
                    width="50px"
                    height="50px"
                    minWidth="50px"
                    padding={0}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    backgroundColor="rgba(255, 255, 255, 0.9)"
                    opacity={isPlaying ? 1 : 0}
                    _hover={{
                      backgroundColor: "white",
                      transform: "scale(1.1)",
                      opacity: 1
                    }}
                    transition="all 0.2s"
                  >
                    {isPlaying ? (
                      <FaPause size="20px" />
                    ) : (
                      <FaPlay size="20px" style={{ marginLeft: "3px" }} />
                    )}
                  </Button>
                </Box>
              </>
            )}
          </Box>
        ) : (
          <Box
            width="100%"
            height="100%"
            display="flex"
            alignItems="center"
            justifyContent="center"
            bg="gray.800"
            borderRadius="md"
          >
            <Text color="gray.500">No image available</Text>
          </Box>
        )}
      </Box>
      <Box width="100%">
        <Text
          fontSize="xl"
          fontWeight="bold"
          overflow="hidden"
          textOverflow="ellipsis"
          whiteSpace="nowrap"
          color="white"
        >
          {songData.title}
        </Text>
        <Text
          fontSize="sm"
          color="gray.400"
          overflow="hidden"
          textOverflow="ellipsis"
          whiteSpace="nowrap"
        >
          {songData.album} ({songData.releaseYear})
          {songData.featuring && ` feat. ${songData.featuring}`}
        </Text>
      </Box>
    </Button>
  );
};

const Battle = () => {
  const navigate = useNavigate();
  const [currentBattle, setCurrentBattle] = useState(0);
  const [battlePairs] = useState(() => generateAllPairs(songs));
  const [winners, setWinners] = useState<string[]>([]);

  const handleSongSelect = (selectedSong: Song) => {
    const newWinners = [...winners, selectedSong.id];
    setWinners(newWinners);
    
    if (currentBattle + 1 >= battlePairs.length) {
      const finalRankings = songs.sort((a, b) => {
        const aWins = newWinners.filter(id => id === a.id).length;
        const bWins = newWinners.filter(id => id === b.id).length;
        return bWins - aWins;
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
    <Stack gap={8} alignItems="center" p={4}>
      <Heading as="h1" size="xl" color="teal.500">
        Song Battle
      </Heading>
      <Text fontSize="lg" color="gray.300" textAlign="center" maxW="container.md">
        Choose your favorite song between the two options!
      </Text>
      <Grid templateColumns="repeat(2, 1fr)" gap={8} w="full" maxW="container.lg">
        <SongCard
          song={currentPair[0]}
          onClick={() => handleSongSelect(currentPair[0])}
        />
        <SongCard
          song={currentPair[1]}
          onClick={() => handleSongSelect(currentPair[1])}
        />
      </Grid>
      <Box w="full" maxW="container.lg">
        <Box
          w="full"
          h="2"
          bg="gray.700"
          borderRadius="full"
          overflow="hidden"
          mb={2}
        >
          <Box
            h="full"
            w={`${progress}%`}
            bg="teal.500"
            transition="width 0.2s"
          />
        </Box>
        <Text fontSize="sm" color="gray.500" textAlign="center">
          Battle {currentBattle + 1} of {totalBattles}
        </Text>
      </Box>
    </Stack>
  );
};

export default Battle; 