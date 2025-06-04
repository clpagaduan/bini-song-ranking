import { Box, Button, Heading, Text, VStack, Image } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <VStack spacing={8} align="center" textAlign="center">
      <Image
        src="/bini-logo.png"
        alt="BINI Logo"
        boxSize="200px"
        objectFit="contain"
      />
      <Heading as="h1" size="2xl" color="bini.500">
        Welcome to BINI Song Ranking
      </Heading>
      <Text fontSize="xl" maxW="container.md">
        Discover your favorite BINI songs through fun battles! Compare songs head-to-head
        and create your personal ranking of BINI's discography.
      </Text>
      <Box>
        <Button
          size="lg"
          colorScheme="bini"
          onClick={() => navigate('/battle')}
        >
          Start Ranking
        </Button>
      </Box>
      <Text fontSize="md" color="gray.600">
        Features preview snippets from Spotify and lets you share your results!
      </Text>
    </VStack>
  );
};

export default Home; 