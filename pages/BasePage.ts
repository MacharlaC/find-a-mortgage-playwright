import { expect, Locator, Page } from '@playwright/test';

export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async fill(locator: Locator, value: string): Promise<void> {
    await expect(locator).toBeEnabled();
    await locator.fill(value);
  }

  async clickElement(locator: Locator): Promise<void> {
    await expect(locator).toBeEnabled();
    await locator.click();
  }
}
