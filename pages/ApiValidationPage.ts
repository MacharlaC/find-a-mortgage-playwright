import { expect, Locator, Page, Response } from '@playwright/test';
import { FindAMortgagePage } from './FindAMortgagePage';
import { searchResultData as searchResultData } from '../test-data/searchResultData';


export class ApiValidationPage extends FindAMortgagePage {
  readonly products: Locator;

  constructor(page: Page) {
    super(page);
    this.products = this.page.getByRole('heading', { name: /^Product \d+:/ });
  }

  async getUiCount(): Promise<number>{
  await expect(this.products.first()).toBeVisible();
  return await this.products.count();
 }
 

 async getApiCount(): Promise<number> {
    const response = await this.page.waitForResponse((response) =>
      this.isResultsResponse(response, 1, searchResultData.propertyValue));
    const body = await response.json();
    return body.resultsViewModel.results.length;
  }

  //--getApiTotalCount
  async getApiTotalCount(data: Parameters<FindAMortgagePage['search']>[0]): Promise<number> {
    const firstResponse = this.page.waitForResponse((response) =>
      this.isResultsResponse(response, 1, data.propertyValue));

    await this.search(data);
    const firstBody = await (await firstResponse).json() as ResultsBody;
    const totalPages = firstBody.formModel?.totalPages ?? 1;
    let total = firstBody.resultsViewModel?.results?.length ?? 0;

    for (let pageNumber = 2; pageNumber <= totalPages; pageNumber++) {
      const pageButton = this.page.locator(`li.js-pagination-item[title="Results page: ${pageNumber}"]`);
      await expect(pageButton).toBeVisible();
      const responsePromise = this.page.waitForResponse((response) =>
        this.isResultsResponse(response, pageNumber, data.propertyValue));
      await pageButton.click();
      const body = await (await responsePromise).json() as ResultsBody;
      total += body.resultsViewModel?.results?.length ?? 0;
    }

    return total;
  }

  //--getUiTotalCount
  async getUiTotalCount(): Promise<number> {
    const pageButtons = this.page.locator('li.js-pagination-item');
    await expect(pageButtons.first()).toBeVisible();
    const totalPages = await pageButtons.count();
    let total = 0;

    for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
      const firstProduct = (pageNumber - 1) * 10 + 1;
      const firstHeading = this.page.getByRole('heading', { name: new RegExp(`^Product ${firstProduct}:`) });

      if (!(await firstHeading.isVisible())) {
        const pageButton = this.page.locator(`li.js-pagination-item[title="Results page: ${pageNumber}"]`);
        await expect(pageButton).toBeVisible();
        await pageButton.click();
        await expect(firstHeading).toBeVisible({ timeout: 30000 });
      }

      total += await this.products.count();
    }

    return total;
  }

  private async isResultsResponse(response: Response, pageNumber: number, propertyValue: string): Promise<boolean> {
    if (!response.url().includes('/umbraco/surface/quickquoteresults/getresults') || response.status() !== 200) {
      return false;
    }
    try {
      const body = await response.json() as ResultsBody;
      return body.formModel?.pageNumber === pageNumber
        && body.formModel?.propertyValue === Number(propertyValue);
    } catch {
      return false;
    }
  }
}

type ResultsBody = {
  formModel?: {
    pageNumber?: number;
    totalPages?: number;
    propertyValue?: number;
  };
  resultsViewModel?: {
    results?: unknown[];
  };
};
