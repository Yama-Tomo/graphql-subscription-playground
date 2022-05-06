import { setUserId } from '@/libs/user';
import { channelIdPageDocumentQuery } from '@/test_utils/mocks';

import { env } from '../env';

const visit = () => {
  setUserId('test');

  cy.visit(`${env.BASE_URL}/channels`);
  cy.waitForNetworkIdle();
};

describe('/channels/[id]', () => {
  it('メッセージ一覧が表示されること', () => {
    visit();
    cy.get('a').contains('ch1').click();
    cy.waitForNetworkIdle();
    cy.contains('message-ch1-14');
    cy.takeScreenshot();
  });

  it('メッセージが存在しない場合は何も表示しないこと', () => {
    visit();
    cy.window().then((win) => {
      if (!win._msw) {
        return;
      }

      win._msw.use(channelIdPageDocumentQuery(0));

      cy.get('a').contains('ch1').click();
      cy.contains('no message');

      cy.takeScreenshot();
    });
  });

  context('mobile', () => {
    beforeEach(() => {
      cy.viewport('iphone-6');
    });

    it('メニューを開くとチャンネル一覧が表示されること', () => {
      visit();
      cy.get('a').contains('ch1').click();
      cy.waitForNetworkIdle();

      cy.get(`[aria-label="open drawer"]`).click();
      cy.wait(800);
      cy.takeScreenshot();
    });
  });
});
