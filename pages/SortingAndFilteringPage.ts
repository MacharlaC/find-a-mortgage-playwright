import { expect, Locator, Page } from '@playwright/test';
import { FindAMortgagePage } from './FindAMortgagePage';

export class SortingAndFilteringPage extends FindAMortgagePage {
  readonly sortBy: Locator;
  readonly fixedTerm: Locator;
  readonly initialRates: Locator;
  readonly initialTerms: Locator;
  readonly initialMonthlyPayments: Locator;
  readonly productFees: Locator;

  constructor(page: Page) {
    super(page);
    this.sortBy = this.page.locator('#sortBy');
    this.fixedTerm = this.page.getByLabel('Fixed term');
    this.initialRates = this.page.locator('.js-product-result-initialRate');
    this.initialTerms = this.page.locator('.js-product-result-initialTerm');
    this.initialMonthlyPayments = this.page.locator('.js-product-result-initialMonthlyPayment');
    this.productFees = this.page.locator('.js-product-result-productFee');
    
  }

  private async selectAndWait(control: Locator, value: string): Promise<void> {
    await expect(control).toBeVisible();
    await control.selectOption(value);
    await this.waitForResults();
    await expect(control).toHaveValue(value);
  }
  async sortByInitialInterestRate(): Promise<void> {
    await this.selectAndWait(this.sortBy, '3');
  }
  
  async sortByInitialMonthlyCost(): Promise<void> {
    await this.selectAndWait(this.sortBy, '3');
    await this.selectAndWait(this.sortBy, '0');
  }
  
  async filterByFixedTerm(): Promise<void> {
    await this.selectAndWait(this.fixedTerm, '24');
  }

  private async toNumbers(locator: Locator): Promise<number[]> {
    const values = await locator.allTextContents();
    return values
      .map(value => value.replace(/[^0-9.]/g, ''))
      .filter(value => value !== '')
      .map(value => Number(value));
  }

  async expectAscending(locator: Locator): Promise<void> {
    const numbers = await this.toNumbers(locator);
    expect(numbers.length).toBeGreaterThan(1);
    for (let i = 1; i < numbers.length; i++) {
      expect(numbers[i]).toBeGreaterThanOrEqual(numbers[i - 1]);
    }
  }

  async expectBetween(locator: Locator, minimum: number, maximum: number): Promise<void> {
    const numbers = await this.toNumbers(locator);
    expect(numbers.length).toBeGreaterThan(0);
    for (const number of numbers) {
      expect(number).toBeGreaterThanOrEqual(minimum);
      expect(number).toBeLessThanOrEqual(maximum);
    }
  }
}