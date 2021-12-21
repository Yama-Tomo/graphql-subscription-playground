import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  styles: {
    global: {
      'html, body, #__next': {
        height: '100%',
      },
      '#__next': {
        display: 'flex',
        flexDirection: 'column',
      },
      '*': {
        boxSizing: 'border-box',
      },
    },
  },
  fonts: {
    body: 'Inter,sans-serif',
    heading: 'Inter,sans-serif',
  },
  colors: {
    hover: {
      '50': '#F4F4F0',
      '100': '#E1DFD6',
      '200': '#CDCBBC',
      '300': '#BAB6A1',
      '400': '#A6A287',
      '500': '#938D6C',
      '600': '#757157',
      '700': '#585541',
      '800': '#3B392B',
      '900': '#1D1C16',
    },
  },
});

export { theme };
