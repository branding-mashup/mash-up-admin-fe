import '@emotion/react';

declare module '@emotion/react' {
  export interface Theme {
    font: import('@/styles/fonts').FontTheme;
  }
}
