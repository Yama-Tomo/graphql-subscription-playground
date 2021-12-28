// https://github.com/cypress-io/cypress/issues/1773#issuecomment-813812612
Cypress.Commands.add('waitForNetworkIdle', function (opts) {
  let waitTime = 0;
  let totalWaitTime = 0;
  let prevRequestCount: undefined | number = undefined;

  const maxThresholdMs = opts?.maxThresholdMs || 10000;
  const thresholdMs = opts?.thresholdMs || 500;
  const checkInterval = opts?.checkInterval || 50;
  const debug = !!opts?.debug;

  const checkIdle = () =>
    cy.window({ log: debug }).then((win) => {
      if (totalWaitTime >= maxThresholdMs) {
        return;
      }

      const currentRequests = win.performance
        .getEntriesByType('resource')
        .filter((r) => (r as any).initiatorType === 'fetch');
      const currentRequestCount = currentRequests.length;

      if (debug) {
        cy.log('request stats', currentRequests, waitTime);
      }

      const isNetworkIdle = prevRequestCount === currentRequestCount && waitTime > thresholdMs;
      if (isNetworkIdle) {
        return;
      }

      if (prevRequestCount !== currentRequestCount) {
        waitTime = 0;
        prevRequestCount = currentRequestCount;
      }

      totalWaitTime += checkInterval;
      waitTime += checkInterval;
      cy.wait(checkInterval, { log: debug });
      cy.then(checkIdle);
    });

  cy.then(checkIdle);
});
