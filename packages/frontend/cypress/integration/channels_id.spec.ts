import { setUserId } from '@/libs/user';
import { latestMessagesQuery } from '@/test_utils/mocks';

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

  it('メッセージが存在しない場合は何も表示しないこと', () => {
    cy.window().then((win) => {
      if (!win._msw) {
        return;
      }

      win._msw.use(latestMessagesQuery(0));

      cy.get('a').contains('ch1').click();

      // インジケータがトグルされるかのテスト
      cy.contains('Loading');
      cy.contains('Loading').should('not.exist');

      cy.takeScreenshot();
    });
  });
});
