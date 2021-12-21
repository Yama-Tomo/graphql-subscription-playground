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
});

export { theme };
