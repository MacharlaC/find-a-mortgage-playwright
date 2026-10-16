import { test, expect } from '../fixtures/pageFixtures';
import { searchResultData } from '../test-data/searchResultData';


test('first page UI count matches API count', async ({ apiValidationPage }) => {
  test.setTimeout(120000);
  const apiCountPromise = apiValidationPage.getApiCount();
  await apiValidationPage.search(searchResultData);
  const uiCount = await apiValidationPage.getUiCount();
  const apiCount = await apiCountPromise;
  expect(uiCount).toBe(apiCount);
 
})

test('total products from every page UI count matches API count', async ({ apiValidationPage }) => {
  test.setTimeout(240000);
  const apiTotal = await apiValidationPage.getApiTotalCount(searchResultData);
  const uiTotal = await apiValidationPage.getUiTotalCount();
  console.log('API total', apiTotal);
  console.log('UI total', uiTotal);     
  expect(uiTotal).toBe(apiTotal);
})

