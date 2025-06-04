import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  colors: {
    bini: {
      50: '#E6F7F7',
      100: '#B3E6E6',
      200: '#80D6D6',
      300: '#4DC5C5',
      400: '#26B5B5',
      500: '#009999', // Primary teal
      600: '#007A7A',
      700: '#005C5C',
      800: '#003D3D',
      900: '#001F1F',
    },
    accent: {
      purple: '#6B46C1',
      pink: '#D53F8C',
    },
  },
  fonts: {
    heading: '"Poppins", sans-serif',
    body: '"Inter", sans-serif',
  },
  styles: {
    global: {
      body: {
        bg: 'gray.50',
        color: 'gray.800',
      },
    },
  },
  components: {
    Button: {
      variants: {
        solid: {
          bg: 'bini.500',
          color: 'white',
          _hover: {
            bg: 'bini.600',
          },
        },
        outline: {
          borderColor: 'bini.500',
          color: 'bini.500',
          _hover: {
            bg: 'bini.50',
          },
        },
      },
    },
  },
});

export default theme; 