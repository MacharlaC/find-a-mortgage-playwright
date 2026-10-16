import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

type MortgageSearchData = {
  propertyValue: string;
  mortgageTerm: string;
  deposit: string;
  incomeOffAllApplicants: string;
};

export class FindAMortgagePage extends BasePage {

  readonly propertyValue: Locator;
  readonly mortgageTerm: Locator;
  readonly deposit: Locator;
  readonly incomeOffAllApplicants: Locator;
  readonly getResultsButton: Locator;
  readonly cookieBanner: Locator;
  readonly monthlyPayments: Locator;
  readonly loadingSpinner: Locator;
 

  constructor(page: Page) {
    super(page);
    this.propertyValue = this.page.getByRole('textbox', { name: 'Property value' });
    this.mortgageTerm = this.page.getByRole('spinbutton', { name: 'Mortgage Term' });
    this.deposit = this.page.getByRole('textbox', { name: 'Deposit' });
    this.incomeOffAllApplicants = this.page.getByRole('textbox', { name: 'Income of all applicants' });
    this.getResultsButton = this.page.getByRole('button', { name: 'Get results' });
    this.cookieBanner = this.page.getByRole('button', { name: 'Accept All' });
    this.monthlyPayments = this.page.getByText('Monthly payments').first();
    this.loadingSpinner = this.page.getByRole('heading', { name: 'Submitting your request...' });

  }

  async openFindAMortgagePage() {
    await this.page.goto('');
  }

  async waitForResults(): Promise<void> {
    await expect(this.loadingSpinner).toBeVisible();
    await expect(this.loadingSpinner).toBeHidden({ timeout: 60000 });
  }

  async search(data: MortgageSearchData): Promise<void> {
    await this.openFindAMortgagePage();
    await this.cookieBanner.click({ timeout: 3000 }).catch(() => {});
  
    await this.fill(this.propertyValue, data.propertyValue);
    await this.fill(this.mortgageTerm, data.mortgageTerm);
    await this.fill(this.deposit, data.deposit);
    await this.fill(this.incomeOffAllApplicants, data.incomeOffAllApplicants);
    await this.clickElement(this.getResultsButton);
    await this.waitForResults();
  }
  
}
