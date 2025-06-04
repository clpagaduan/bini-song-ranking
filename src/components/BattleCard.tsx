import React from 'react';
import { Box, VStack, Image, Text, Heading, Icon } from '@chakra-ui/react';
import { FaPlay } from 'react-icons/fa';
import { Song } from '../data/songs';

interface BattleCardProps {
  song: Song;
  isSelected: boolean;
  isLoading: boolean;
  handleClick: () => void;
}

const BattleCard = ({ song, isSelected, isLoading, handleClick }: BattleCardProps) => {
  return (
    <Box
      position="relative"
      width={["100%", "350px"]}
      minHeight={["400px", "450px"]}
      borderRadius="lg"
      overflow="hidden"
      cursor={isLoading ? "not-allowed" : "pointer"}
      onClick={handleClick}
      transition="transform 0.2s"
      _hover={!isLoading ? { transform: "scale(1.02)" } : undefined}
    >
      <VStack
        spacing={4}
        align="center"
        p={4}
        bg={isSelected ? "rgba(49, 151, 149, 0.2)" : "gray.800"}
        height="100%"
        border="2px solid"
        borderColor={isSelected ? "teal.500" : "transparent"}
        borderRadius="lg"
      >
        <Box
          position="relative"
          width="100%"
          paddingBottom="100%"
          borderRadius="md"
          overflow="hidden"
        >
          <Image
            src={song.imageUrl || '/default-album.png'}
            alt={`${song.title} album art`}
            position="absolute"
            top={0}
            left={0}
            width="100%"
            height="100%"
            objectFit="cover"
          />
          {song.spotifyId && (
            <Box
              position="absolute"
              top="50%"
              left="50%"
              transform="translate(-50%, -50%)"
              bg="rgba(0, 0, 0, 0.7)"
              borderRadius="full"
              p={3}
              cursor="pointer"
              onClick={(e) => {
                e.stopPropagation();
                // Your play button logic here
              }}
            >
              <Icon as={FaPlay} boxSize={6} color="white" />
            </Box>
          )}
        </Box>
        <VStack spacing={2} align="center" flex={1}>
          <Heading
            size="md"
            textAlign="center"
            color="white"
            noOfLines={2}
          >
            {song.title}
          </Heading>
          <Text
            fontSize="sm"
            color="gray.400"
            textAlign="center"
            noOfLines={1}
          >
            {song.album} ({song.year})
          </Text>
        </VStack>
      </VStack>
    </Box>
  );
};

export default BattleCard; 