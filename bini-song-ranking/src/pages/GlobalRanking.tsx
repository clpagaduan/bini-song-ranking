import React from 'react';
import { Stack, Heading, Text, Box, Grid, GridItem } from '@chakra-ui/react';

const GlobalRanking = () => {
  return (
    <Stack direction="column" align="center" textAlign="center" gap={8}>
      <Heading as="h1" size="xl" color="bini.500">
        Global Song Rankings
      </Heading>
      <Text fontSize="lg" maxW="container.md">
        See how BINI's songs rank according to all fans!
      </Text>
      <Box w="full" maxW="container.lg" overflowX="auto">
        <Stack direction="column" gap={4}>
          <Grid templateColumns="repeat(3, 1fr)" gap={4} p={4} bg="gray.50" fontWeight="bold">
            <GridItem>Rank</GridItem>
            <GridItem>Song</GridItem>
            <GridItem textAlign="right">Score</GridItem>
          </Grid>
          <Grid templateColumns="repeat(3, 1fr)" gap={4} p={4} bg="white">
            <GridItem>1</GridItem>
            <GridItem>No Song Yet</GridItem>
            <GridItem textAlign="right">0</GridItem>
          </Grid>
          <Grid templateColumns="repeat(3, 1fr)" gap={4} p={4} bg="white">
            <GridItem>2</GridItem>
            <GridItem>No Song Yet</GridItem>
            <GridItem textAlign="right">0</GridItem>
          </Grid>
          <Grid templateColumns="repeat(3, 1fr)" gap={4} p={4} bg="white">
            <GridItem>3</GridItem>
            <GridItem>No Song Yet</GridItem>
            <GridItem textAlign="right">0</GridItem>
          </Grid>
        </Stack>
      </Box>
    </Stack>
  );
};

export default GlobalRanking; 