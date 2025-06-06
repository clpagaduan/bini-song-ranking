import React from 'react';
import { Box, Container, Flex, Link as ChakraLink, Text, useColorModeValue } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const headerBg = useColorModeValue('bini.500', 'bini.600');
  const footerBg = useColorModeValue('gray.50', 'gray.900');
  const footerText = useColorModeValue('gray.600', 'gray.400');

  return (
    <Box minH="100vh" bg={bgColor}>
      <Box 
        as="nav" 
        bg={headerBg} 
        color="white" 
        height="60px"
        position="fixed"
        top={0}
        left={0}
        right={0}
        zIndex={1000}
        boxShadow="sm"
        display="flex"
        alignItems="center"
      >
        <Container maxW="container.xl">
          <Flex justify="center" align="center">
            <ChakraLink 
              as={RouterLink} 
              to="/" 
              fontSize={["lg", "xl"]} 
              fontWeight="bold"
              _hover={{ textDecoration: 'none', opacity: 0.9 }}
              transition="opacity 0.2s"
            >
              BINI Song Ranking
            </ChakraLink>
          </Flex>
        </Container>
      </Box>

      <Box pt="60px" flex="1">
        <Container 
          maxW="container.xl" 
          py={6}
          px={[4, 6, 8]}
        >
          {children}
        </Container>
      </Box>

      <Box 
        as="footer" 
        bg={footerBg} 
        py={4}
        borderTop="1px"
        borderColor="gray.200"
      >
        <Container maxW="container.xl">
          <Text 
            textAlign="center" 
            color={footerText}
            fontSize={["sm", "md"]}
          >
            © 2025 BINI Song Ranking. This is a fan-made project and is not affiliated with BINI, Star Music, or ABS-CBN.
            <a href="https://buymeacoffee.com/clpagaduan" target="_blank" rel="noopener noreferrer" style={{ color: 'teal', marginLeft: '8px' }}>
              Buy me a coffee ☕
            </a>
          </Text>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout; 
