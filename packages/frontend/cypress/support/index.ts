import '@percy/cypress';

import './commands';

type ScreenshotOpts = {
  name?: Parameters<typeof cy.percySnapshot>[0];
  opts?: Parameters<typeof cy.percySnapshot>[1];
  fallbackOpts?: Cypress.ScreenshotOptions;
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      waitForNetworkIdle(
        opts?: Partial<{
          thresholdMs: number;
          maxThresholdMs: number;
          checkInterval: number;
          debug: boolean;
        }>
      ): void;
      takeScreenshot(opts?: ScreenshotOpts): void;
    }
  }
}
