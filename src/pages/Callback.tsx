import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleAuthCallback } from '../utils/spotify';
import { Box, Spinner, Text } from '@chakra-ui/react';

const Callback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuth = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        
        if (!code) {
          throw new Error('No code provided in callback');
        }

        await handleAuthCallback(code);
        navigate('/battle');
      } catch (error) {
        console.error('Error handling Spotify callback:', error);
        navigate('/');
      }
    };

    handleAuth();
  }, [navigate]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="100vh"
      gap={4}
    >
      <Spinner size="xl" color="teal.500" />
      <Text>Connecting to Spotify...</Text>
    </Box>
  );
};

export default Callback; 