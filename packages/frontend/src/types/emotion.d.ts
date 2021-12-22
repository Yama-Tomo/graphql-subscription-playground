import '@emotion/react';

import { CustomChakraUITheme } from '@/types/emotion_theme';

declare module '@emotion/react' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface Theme extends CustomChakraUITheme {}
}
