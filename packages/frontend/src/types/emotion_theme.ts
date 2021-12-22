import { Theme as ChakraUITheme, ThemeTypings } from '@chakra-ui/react';

type SplitDotProperty<T extends string> = T extends `${infer Key}.${infer SubKey}`
  ? { key: Key; subKey: SubKey }
  : { key: T; subKey: never };

type ToNormalizeNestedColors = {
  [P in ThemeTypings['colors']]: never extends SplitDotProperty<P> ? SplitDotProperty<P> : P;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GroupByKeys<T extends { key: string; subKey: any }> = {
  [K in T['key']]: Extract<T, { key: K }>['subKey'] extends never
    ? string
    : Record<Extract<T, { key: K }>['subKey'], string>;
};

type ValueOf<T> = T[keyof T];

type OverrideThemeValues<FIELDS extends keyof ThemeTypings> = Omit<ChakraUITheme, FIELDS> & {
  [P in FIELDS]: P extends 'colors'
    ? GroupByKeys<ValueOf<ToNormalizeNestedColors>>
    : Record<ThemeTypings[P] & string, string>;
};

type CustomChakraUITheme = OverrideThemeValues<
  | 'borders'
  | 'breakpoints'
  | 'colors'
  | 'fonts'
  | 'fontSizes'
  | 'fontWeights'
  | 'letterSpacings'
  | 'lineHeights'
  | 'radii'
  | 'shadows'
  | 'sizes'
  | 'space'
>;

export type { CustomChakraUITheme };
