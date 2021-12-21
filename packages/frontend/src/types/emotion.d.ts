import { Theme as ChakraUITheme } from '@chakra-ui/react';
import '@emotion/react';

declare module '@emotion/react' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface Theme extends ChakraUITheme {}
}
