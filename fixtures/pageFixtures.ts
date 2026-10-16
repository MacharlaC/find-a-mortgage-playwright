import {test as base} from '@playwright/test';
import {BasePage} from '../pages/BasePage';
import {FindAMortgagePage} from '../pages/FindAMortgagePage';
import {SortingAndFilteringPage} from '../pages/SortingAndFilteringPage';
import {ApiValidationPage} from '../pages/ApiValidationPage';

type PageFixtures = {
    basePage: BasePage;
    findAMortgagePage: FindAMortgagePage;
    sortingAndFilteringPage: SortingAndFilteringPage;
    apiValidationPage: ApiValidationPage;
}
 export const test = base.extend<PageFixtures>({
    basePage: async ({page}, use) => {
        await use(new BasePage(page));
    },
    findAMortgagePage: async ({page}, use) => {
        await use(new FindAMortgagePage(page));
    },  
    sortingAndFilteringPage: async ({page}, use) => {
        await use(new SortingAndFilteringPage(page));
    },
    apiValidationPage: async ({page}, use) => {
        await use(new ApiValidationPage(page));
    },
});

export {expect} from '@playwright/test';