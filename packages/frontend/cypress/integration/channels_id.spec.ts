import { setUserId } from '@/libs/user';

import { env } from '../env';

describe('/channels/[id]', () => {
  beforeEach(() => {
    setUserId('test');

    cy.visit(`${env.BASE_URL}/channels`);
    cy.waitForNetworkIdle();
  });

  it('メッセージ一覧が表示されること', () => {
    cy.get('a').contains('ch1').click();
    cy.waitForNetworkIdle();
    cy.contains('message-ch1-14');
    cy.takeScreenshot();
  });
});
