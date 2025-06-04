import React from 'react';
import { Box, Container, Stack } from '@chakra-ui/react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <Box minH="100vh" bg="gray.50">
      <Container maxW="container.xl" py={8}>
        <Stack direction="column" gap={8}>
          {children}
        </Stack>
      </Container>
    </Box>
  );
};

export default Layout; 