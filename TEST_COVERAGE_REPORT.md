# Assignment coverage report


**Application:** https://www.mortgageadvicebureau.com/find-a-mortgage/

**Command:**

```powershell
npx playwright test tests/findAMortgage.spec.ts tests/sortingAndFiltering.spec.ts tests/apiValidation.spec.ts --project=chromium --workers=1
```

**Result:** 6 passed (2.8 minutes) on 16 October 2026. The every-page count printed API total 37 and UI total 37.

`tests/example.spec.ts` is the Playwright sample and is not assignment coverage.

## Verdict

The running tests cover search and result display, sorting, the 2-year fixed-term filter, the first-page UI and API count, and the total UI and API count across every results page.

Sorting is covered by two tests: initial interest rate and initial monthly cost. Both select a sort option, wait for the results to reload, and assert the visible values are in ascending order. That is enough to prove sorting. A third sort, such as product fee, would repeat the same check on another column.

**Repayment / Interest Only** filtering does not work on the page, so that filter was left out of the automation.

## Coverage

| Assignment area | Running test | What it asserts | Status |
| --- | --- | --- | --- |
| Search and result display | `search returns mortgage results` | After the shared search, **Monthly payments** is visible and the first `Product N:` heading is visible | Covered |
| Sorting | `sorts results by initial interest rate` and `sorts results by initial monthly cost` | Each test sets `#sortBy`, then asserts the visible rates or monthly payments are in ascending order | Covered |
| Filter by 2-year fixed term | `filters results to a 2 year fixed term` | Fixed term is `24`, and every visible initial term is between 24 and 35 months | Covered |
| Repayment / Interest Only filter | None | This filter does not work on the page, so it was left out of the automation | Not covered |
| First-page UI count matches API count | `first page UI count matches API count` | `getUiCount()` equals `getApiCount()` for page 1 | Covered |
| Total UI count matches API count | `total products from every page UI count matches API count` | `getApiTotalCount()` sums `results.length` from each results response. `getUiTotalCount()` sums the product headings on every page from the screen only. The test asserts the two totals are equal | Covered |

## Shared search data

Every running test uses `test-data/searchResultData.ts`:

| Field | Value |
| --- | --- |
| Property value | 250000 |
| Mortgage term | 25 |
| Deposit | 50000 |
| Income of all applicants | 60000 |

## How the count tests match the assignment

The results page does not show a total-count label, and the results response has no `totalCount`. The count is the number of products.

- The first-page test starts `getApiCount()` before the search. The UI count is the number of headings matching `Product N:`. The API count is `resultsViewModel.results.length`. `isResultsResponse()` keeps a response only when the URL includes `/umbraco/surface/quickquoteresults/getresults`, the status is 200, `pageNumber` is 1, and `propertyValue` is 250000. The test asserts the two counts are equal.
- `getApiTotalCount()` searches, reads `totalPages` from the page-1 response, clicks each later page, and adds `results.length`. Each response must pass the same URL, status 200, page number, and property value check.
- `getUiTotalCount()` does not read the results response. It counts the pagination buttons, then loops from page 1 to the last page. Page 1 waits for the **Product 1** heading, page 2 for **Product 11**, page 3 for **Product 21**, and so on. If that heading is not visible, it clicks that page and waits up to 30 seconds for the heading, then adds the number of `Product N:` headings.
- The total test prints both totals and asserts they are equal. The latest API validation run printed API total 37 and UI total 37.

## Gaps

- **Repayment / Interest Only.** This filter does not work on the page, so it was left out of the automation. The 2-year fixed-term filter is the one that is asserted.

