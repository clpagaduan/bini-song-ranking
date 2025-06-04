import React from 'react';
import { Box, Heading, List, ListItem, Text, Stack, Image, Spinner } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { songs } from '../data/songs';
import { getTrackDetails } from '../utils/spotify';

const Results = () => {
  const [rankings, setRankings] = React.useState<typeof songs>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [songImages, setSongImages] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    const storedRankings = localStorage.getItem('songRankingResults');
    if (storedRankings) {
      setRankings(JSON.parse(storedRankings));
    }
    setIsLoading(false);
  }, []);

  // Fetch album artwork for each song
  React.useEffect(() => {
    const fetchAlbumArt = async () => {
      const images: Record<string, string> = {};
      for (const song of rankings) {
        try {
          const details = await getTrackDetails(song.spotifyId);
          images[song.id] = details.imageUrl;
        } catch (error) {
          console.error(`Error fetching album art for ${song.title}:`, error);
        }
      }
      setSongImages(images);
    };

    if (rankings.length > 0) {
      fetchAlbumArt();
    }
  }, [rankings]);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="100vh">
        <Spinner size="xl" color="teal.500" />
      </Box>
    );
  }

  return (
    <Box p={2} maxW="container.md" mx="auto">
      <Stack spacing={3}>
        <Heading as="h1" size="lg" color="teal.500" textAlign="center" mb={2}>
          Your BINI Song Ranking
        </Heading>

        <List spacing={2}>
          {rankings.map((song, index) => (
            <ListItem
              key={song.id}
              p={2}
              borderWidth="1px"
              borderRadius="md"
              _hover={{ bg: 'gray.700' }}
            >
              <Stack direction="row" spacing={2} align="center">
                <Box
                  width="40px"
                  height="40px"
                  bg="gray.700"
                  borderRadius="sm"
                  overflow="hidden"
                  flexShrink={0}
                >
                  {songImages[song.id] ? (
                    <Image
                      src={songImages[song.id]}
                      alt={song.title}
                      width="100%"
                      height="100%"
                      objectFit="cover"
                    />
                  ) : (
                    <Box
                      width="100%"
                      height="100%"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Spinner size="sm" color="teal.500" />
                    </Box>
                  )}
                </Box>
                <Stack flex={1} spacing={0}>
                  <Text fontSize="sm" fontWeight="bold" noOfLines={1}>
                    {index + 1}. {song.title}
                  </Text>
                  <Text fontSize="sm" color="gray.600" noOfLines={1}>
                    {song.album}
                  </Text>
                </Stack>
              </Stack>
            </ListItem>
          ))}
        </List>

        <Box textAlign="center" mt={2}>
          <Text 
            as={Link} 
            to="/" 
            color="teal.500" 
            fontSize="sm"
            _hover={{ textDecoration: 'underline' }}
          >
            Start New Ranking
          </Text>
        </Box>
      </Stack>
    </Box>
  );
};

export default Results; 