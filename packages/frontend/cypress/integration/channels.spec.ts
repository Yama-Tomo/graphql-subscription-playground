import { setUserId } from '@/libs/user';

import { env } from '../env';

describe('/channels', () => {
  beforeEach(() => {
    setUserId('test');

    cy.visit(`${env.BASE_URL}/channels`);
    cy.get('body').invoke('attr', 'style', 'caret-color: transparent');
    cy.waitForNetworkIdle();
  });

  it('チャンネル一覧が表示されること', () => {
    cy.contains('ch1');
    cy.takeScreenshot();
  });

  it('チャンネル新規作成モーダルが立ち上がること', () => {
    cy.get(`[aria-label="invite user"]`).click();
    cy.contains('create channel');
    cy.wait(200);
    cy.takeScreenshot();
  });

  it('チャンネル編集モーダルが立ち上がること', () => {
    cy.get(`[aria-label="ch1-options"]`).click();
    cy.contains('edit');
    cy.wait(200);
    cy.takeScreenshot();
  });

  it('DM新規作成モーダルが立ち上がること', () => {
    cy.get(`[aria-label="add direct message"]`).click();
    cy.contains('create DM channel');
    cy.wait(200);
    cy.takeScreenshot();
  });
});
