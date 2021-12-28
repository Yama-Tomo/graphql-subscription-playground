Cypress.Commands.add('takeScreenshot', function (opts) {
  const { name, opts: percyOpts, fallbackOpts } = opts || {};

  if (Cypress.env('NO_PERCY_SCREENSHOT')) {
    if (name) {
      cy.screenshot(name, fallbackOpts);
    } else {
      cy.screenshot(fallbackOpts);
    }
  } else {
    cy.percySnapshot(name, percyOpts);
  }
});
