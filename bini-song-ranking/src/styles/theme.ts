import { createSystem, defaultConfig } from '@chakra-ui/react';

export const system = createSystem(defaultConfig, {
  globalCss: {
    'html, body': {
      margin: 0,
      padding: 0,
      minHeight: '100vh',
      backgroundColor: 'gray.50',
      color: 'gray.800',
    },
    '#root': {
      minHeight: '100vh',
    },
  },
  theme: {
    tokens: {
      colors: {
        bini: {
          50: { value: '#E6F7F7' },
          100: { value: '#B3E6E6' },
          200: { value: '#80D6D6' },
          300: { value: '#4DC5C5' },
          400: { value: '#26B5B5' },
          500: { value: '#009999' }, // Primary teal
          600: { value: '#007A7A' },
          700: { value: '#005C5C' },
          800: { value: '#003D3D' },
          900: { value: '#001F1F' },
        },
        accent: {
          purple: { value: '#6B46C1' },
          pink: { value: '#D53F8C' },
        },
      },
      fonts: {
        heading: { value: '"Poppins", sans-serif' },
        body: { value: '"Inter", sans-serif' },
      },
    },
    semanticTokens: {
      colors: {
        bini: {
          solid: { value: '{colors.bini.500}' },
          contrast: { value: '{colors.bini.100}' },
          fg: { value: '{colors.bini.700}' },
          muted: { value: '{colors.bini.100}' },
          subtle: { value: '{colors.bini.200}' },
          emphasized: { value: '{colors.bini.300}' },
          focusRing: { value: '{colors.bini.500}' },
        },
      },
    },
    recipes: {
      button: {
        className: 'button',
        base: {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          userSelect: 'none',
          transitionProperty: 'common',
          transitionDuration: 'normal',
          bg: '{colors.bini.500}',
          color: 'white',
          _hover: {
            bg: '{colors.bini.600}',
          },
        },
        variants: {
          variant: {
            outline: {
              border: '1px solid',
              borderColor: '{colors.bini.500}',
              color: '{colors.bini.500}',
              bg: 'transparent',
              _hover: {
                bg: '{colors.bini.50}',
              },
            },
          },
        },
      },
    },
  },
}); 