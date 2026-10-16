import { test, expect } from '../fixtures/pageFixtures';
import { searchResultData } from '../test-data/searchResultData';

test('search returns mortgage results', async ({ findAMortgagePage }) => {
  await findAMortgagePage.search(searchResultData);

  await expect(findAMortgagePage.monthlyPayments).toBeVisible();
  await expect(findAMortgagePage.page.getByRole('heading', { name: /^Product \d+:/ }).first()).toBeVisible();
});
