import React, { useState, useRef } from 'react';
import { Box, Image, Text, VStack, Button, Skeleton, IconButton } from '@chakra-ui/react';
import { FaPlay, FaPause } from 'react-icons/fa';
import { Song } from '../../data/songs';

interface BattleCardProps {
  song: Song;
  onSelect: () => void;
  isSelected: boolean;
  isLoading: boolean;
}

const BattleCard = ({ song, onSelect, isSelected, isLoading }: BattleCardProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering card selection
    if (!song.previewUrl) return;

    if (!audioRef.current) {
      audioRef.current = new Audio(song.previewUrl);
      audioRef.current.addEventListener('ended', () => setIsPlaying(false));
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  // Cleanup audio on unmount
  React.useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return (
    <VStack
      spacing={4}
      p={6}
      bg="white"
      borderRadius="lg"
      boxShadow="md"
      border="2px solid"
      borderColor={isSelected ? 'bini.500' : 'transparent'}
      transition="all 0.2s"
      _hover={{ transform: 'translateY(-2px)' }}
      cursor={isLoading ? 'default' : 'pointer'}
      onClick={isLoading ? undefined : onSelect}
      opacity={isLoading ? 0.7 : 1}
      minW={["100%", "300px"]}
    >
      <Box position="relative">
        <Skeleton isLoaded={!isLoading} borderRadius="md">
          <Image
            src={song.imageUrl || '/default-album.png'}
            alt={song.title}
            boxSize="200px"
            objectFit="cover"
            borderRadius="md"
          />
        </Skeleton>
        {song.previewUrl && !isLoading && (
          <IconButton
            aria-label={isPlaying ? 'Pause' : 'Play'}
            icon={isPlaying ? <FaPause /> : <FaPlay />}
            position="absolute"
            bottom="2"
            right="2"
            colorScheme="bini"
            onClick={togglePlay}
            size="md"
            isRound
          />
        )}
      </Box>
      <Skeleton isLoaded={!isLoading}>
        <Text fontSize="xl" fontWeight="bold" color="bini.700">
          {song.title}
        </Text>
      </Skeleton>
      <Skeleton isLoaded={!isLoading}>
        <Text color="gray.600">
          {song.album} ({song.year})
        </Text>
      </Skeleton>
      <Button
        variant={isSelected ? 'solid' : 'outline'}
        colorScheme="bini"
        size="lg"
        width="full"
        isDisabled={isLoading}
      >
        {isSelected ? 'Selected' : 'Choose'}
      </Button>
    </VStack>
  );
};

export default BattleCard; 