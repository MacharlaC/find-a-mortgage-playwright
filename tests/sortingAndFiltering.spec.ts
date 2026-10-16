import { test, expect } from '../fixtures/pageFixtures';
import { searchResultData } from '../test-data/searchResultData';

test.describe.configure({ timeout: 180000 });


  test('sorts results by initial interest rate', async ({ sortingAndFilteringPage }) => {
      await sortingAndFilteringPage.search(searchResultData);
      await sortingAndFilteringPage.sortByInitialInterestRate();
      await sortingAndFilteringPage.expectAscending(sortingAndFilteringPage.initialRates);
});

test('sorts results by initial monthly cost', async ({ sortingAndFilteringPage }) => {
  await sortingAndFilteringPage.search(searchResultData);
  await sortingAndFilteringPage.sortByInitialMonthlyCost();
  await sortingAndFilteringPage.expectAscending(sortingAndFilteringPage.initialMonthlyPayments);
});

  test('filters results to a 2 year fixed term', async ({ sortingAndFilteringPage }) => {
    await sortingAndFilteringPage.search(searchResultData);
    await sortingAndFilteringPage.filterByFixedTerm();
    await sortingAndFilteringPage.expectBetween(sortingAndFilteringPage.initialTerms, 24, 35);
  });

  



