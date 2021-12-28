const envKeys = ['BASE_URL', 'NO_PERCY_SCREENSHOT'] as const;

const env = envKeys.reduce((result, key) => {
  return { ...result, [key]: Cypress.env(key) ? String(Cypress.env(key)) : '' };
}, {} as Record<typeof envKeys[number], string>);

export { env };
