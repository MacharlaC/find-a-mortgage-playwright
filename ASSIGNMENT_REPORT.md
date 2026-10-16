# Mortgage Search Results — Automation Assignment Report

## Overview

This assignment automates the Search Results flow on the Mortgage Advice Bureau **Find a Mortgage** page.

**Application:** https://www.mortgageadvicebureau.com/find-a-mortgage/

**Stack:** Playwright + TypeScript + Page Object Model (POM)

The suite covers search and result display, sorting, filtering, and a UI-versus-API product count. Realistic mortgage criteria are stored outside the tests so the same data is reused by every scenario.

| Area | Status |
| --- | --- |
| Result display | Automation test created |
| Sorting | Automation testing created |
| Filtering | Automation testing created |
| Total count on the UI | Not displayed |
| Total product count | UI headings and API `results.length` are each summed across every page, then compared |

---

## 1. Search automation

**Files:** `tests/findAMortgage.spec.ts`, `pages/FindAMortgagePage.ts`, `test-data/searchResultData.ts`

The search test opens Find a Mortgage, clicks **Accept All** on the cookie consent banner when that button appears within 3 seconds, enters mortgage criteria, and submits **Get results**. The search continues when the cookie consent banner is not shown.

Search data:

| Field | Value |
| --- | --- |
| Property value | 250,000 |
| Mortgage term | 25 years |
| Deposit | 50,000 |
| Income of all applicants | 60,000 |

These values are a realistic residential case: a £250,000 property with a £50,000 deposit (80% loan-to-value) over 25 years, supported by £60,000 household income.

### Locator strategy

Controls are located by accessible role and name wherever the page exposes them:

- Property value, deposit, and income use `getByRole('textbox', { name })`
- Mortgage term uses `getByRole('spinbutton', { name: 'Mortgage Term' })`
- Submit uses `getByRole('button', { name: 'Get results' })`
- Cookie consent uses `getByRole('button', { name: 'Accept All' })`
- The loading indicator is the heading **Submitting your request...**

Role locators stay valid when styling or DOM structure changes, as long as the accessible name stays the same.

### Updating search criteria

`FindAMortgagePage.search()` fills every criteria field before it clicks **Get results**. `fill()` replaces the current value, so the same method both performs a first search and updates existing criteria. The data object is the only place those values are defined, so a new case is a data change rather than a copy of the test.

### Result display

After submit, the test waits until the **Submitting your request...** heading appears and then disappears. It then asserts that **Monthly payments** is visible and that the first `Product N:` heading is visible. Those checks confirm that a search returns rendered mortgage products, not only that the button was clicked.

---

## 2. Sorting and filtering automation

**Files:** `tests/sortingAndFiltering.spec.ts`, `pages/SortingAndFilteringPage.ts`

Sorting and filtering run only after the same search, so both start from a known result set.

### Sorting

Sorting automation is created. The sort control is `#sortBy`. `selectAndWait()` selects an option, waits for the loading heading to finish, and checks that the control holds the expected value. The test then reads the values shown on the product cards. The same method applies the fixed-term filter.

| Sort | Option value | Values checked |
| --- | --- | --- |
| Initial interest rate | `3` | `.js-product-result-initialRate` |
| Initial monthly cost | `0` | `.js-product-result-initialMonthlyPayment` |

These two sorts cover the sorting requirement. Each one changes `#sortBy`, waits for the results to reload, and checks that the visible values on the product cards are in ascending order. A further sort, such as product fee, would repeat that same check on another column.

Order is validated in code, not by looking at the dropdown alone. Visible text is parsed to numbers and each value is asserted to be greater than or equal to the previous one. Blank text is skipped before the comparison. Equal values are allowed, because two products can share a rate or payment. The monthly-cost sort first selects initial interest rate and then selects monthly cost, so the page actually re-sorts when monthly cost is already the default.

### Filtering

Filtering automation is created. The stable filter used in the suite is **Fixed term**, set to 24 months (2-year fixed). After the results reload, every visible initial term is parsed to a number and asserted to be between 24 and 35 months. That checks the filtered data itself. A check that only confirmed the dropdown value would pass even if the product list had not changed.

Fixed term is applied on top of the mortgage search criteria, so the scenario validates combined criteria (search data plus filter).

**Repayment / Interest Only** filtering does not work on the page, so that filter was left out of the automation.

---

## 3. UI versus API validation

**Files:** `tests/apiValidation.spec.ts`, `pages/ApiValidationPage.ts`

### What the UI shows

The results UI does **not** display a total count, because that element is not on the page. There is no label that can be compared with a backend `totalCount`.

What the UI does show is the current page of products. The UI count is the number of headings matching `Product N:` on the page that is open. A typical first page contains 10 products.

### What the API returns

Results are loaded from:

`/umbraco/surface/quickquoteresults/getresults`

`getApiCount()` and `getApiTotalCount()` capture that response with `page.waitForResponse`. `getUiTotalCount()` does not. A response is accepted by `isResultsResponse()` only when the URL includes `/umbraco/surface/quickquoteresults/getresults` and the status is 200. The body used by the API count has:

- `formModel.pageNumber` — which page this response belongs to
- `formModel.totalPages` — how many pages to walk
- `formModel.propertyValue` — used to ignore unrelated result calls
- `resultsViewModel.results` — the products on that page

A single `totalCount` for the whole result set is not available in this response. Reading `results.length` from the first page only would under-count, because later pages are requested separately.

### Validation strategy

Two tests compare the products on screen with the products in the results response.

**First page.** `getApiCount()` is started before **Get results** is clicked, so the page-1 response is not missed. After the results render, `getUiCount()` counts headings matching `Product N:`. The test asserts that count equals `resultsViewModel.results.length` for the response whose `pageNumber` is 1 and whose `propertyValue` is 250000.

**Every page.** `getApiTotalCount()` runs the search, reads `totalPages` from the page-1 body, then clicks each later pagination item (`li.js-pagination-item`). Each click waits for the response whose URL is the results endpoint, whose status is 200, and whose `pageNumber` and `propertyValue` match. It adds `results.length` from every page.

`getUiTotalCount()` then counts those pages from the screen only. It does not call `waitForResponse`. It counts the pagination buttons and loops from page 1 through the last page. The first heading on a page is `(pageNumber - 1) * 10 + 1`, so page 1 waits for **Product 1**, page 2 for **Product 11**, and page 3 for **Product 21**. When that heading is already visible, the headings are counted immediately. When it is not, the method clicks that page and waits up to 30 seconds for the heading before counting. The API method finishes on the last page, so the UI method opens page 1 again as the first step of this loop.

The test prints both totals, then asserts they are equal. The latest run of this test printed 37 for the API total and 37 for the UI total.

Pagination is part of the total. Reading page 1 only would under-count, because later pages are requested separately.

---

## 4. Framework and design

### Design pattern

The framework uses the **Page Object Model**, with a small inheritance chain and Playwright fixtures.

```
BasePage
  └── FindAMortgagePage          search, cookie handling, result wait
        ├── SortingAndFilteringPage    sort, filter, order and range checks
        └── ApiValidationPage          UI product count and paginated API count
```

- `BasePage` holds `fill()` and `clickElement()`. Both wait until the control is enabled before they act.
- `FindAMortgagePage` owns the search form and the wait for the **Submitting your request...** heading. `SortingAndFilteringPage` owns the sort and filter locators, `selectAndWait()`, and `toNumbers()`.
- Feature page objects add the locators and checks for that feature. The search test also checks that the first `Product N:` heading is visible.
- `fixtures/pageFixtures.ts` constructs the page objects and passes them into tests, so specs stay focused on behaviour.

### Locator strategy

| Kind of element | Approach |
| --- | --- |
| Form fields and buttons | Role and accessible name |
| Sort and fixed-term controls | `#sortBy`, and the fixed-term control by its label |
| Product figures | Result-card classes (`.js-product-result-*`) |
| Products on the page | Heading role plus `/^Product \d+:/` |
| Pagination | `title` on the page item, for example `Results page: 2` |

### Test data

`test-data/searchResultData.ts` exports one criteria object. Search, sort, filter, and API tests all import it. Adding another applicant profile means adding another object and passing it into `search()`, without duplicating the form steps.

`BASE_URL` comes from `.env` and is set as Playwright’s `baseURL`. Tests call `page.goto('')` rather than hard-coding the host.

### Scalability and maintainability

- A new check is a method on the relevant page object plus a short test. Selectors stay in one class.
- Assertions that parse numbers (`expectAscending`, `expectBetween`) can be reused for any new sort or numeric filter.
- `fullyParallel` is enabled. Projects are set up for Chromium, Firefox, and WebKit.
- GitHub Actions (`.github/workflows/playwright.yml`) installs browsers, runs the suite, and uploads the HTML report for 30 days.
- Timeouts are raised only for the long journeys: sorting and filtering use 180 seconds, the first-page count uses 120 seconds, and the every-page count uses 240 seconds. The framework default is unchanged.

### Trade-offs

- Walking every results page makes the API total accurate, and it is slower than reading one `totalCount` field. That cost is accepted because the response does not provide the total.
- **Repayment / Interest Only** filtering does not work on the page, so it was not automated so more than one filter is not covered. The automated filter is the fixed term.
- Sort checks read the current page. They prove order of the products on screen after the sort. They do not re-sort the full set across every page in one assertion.
---

## 5. Reporting and maintainability

### Failure reporting

Playwright’s **HTML reporter** is configured in `playwright.config.ts`. A failure records the test name, error, and a line-level stack that points at the page-object method (for example the missing `#displayedResultCount` wait). The report is opened with:

```bash
npx playwright show-report
```

On CI, `playwright-report/` is uploaded as a build artifact even when the job is cancelled, so the report survives the run.

`trace` is set to `on-first-retry`. A retried failure keeps a trace with actions, console, and network, which is the evidence used to decide whether the failure is a product defect, a timing issue, or a bad locator.

The total test writes the API total and the UI total to the console before `expect(uiTotal).toBe(apiTotal)`. The first-page test asserts `expect(uiCount).toBe(apiCount)`. A mismatch fails at that assertion.

### Logging, screenshots, and traces

| Evidence | When it is captured |
| --- | --- |
| HTML report | Every run |
| Console totals | Every-page count test, API total and UI total |
| Trace | First retry of a failed test |
| Error context | On failure, under `test-results/` |
| CI report artifact | After the GitHub Actions job |

Locally, `retries` is 0 so a failure is reported immediately. On CI, `retries` is 2 and workers are limited to 1, which gives a flaky step a chance to pass while keeping the trace from the first retry.

### How flaky tests are identified and managed

A test is treated as flaky when it fails and then passes on retry, or when the same step fails only sometimes with a timeout on a control that is present. Playwright marks those runs in the HTML report. The trace from `on-first-retry` shows whether the locator never appeared, appeared too late, or the results request returned a different page from the one the test expected.

Management in this project:

- **Repayment / Interest Only** is not automated because that filter does not work on the page.
- Results waits are tied to the loading indicator becoming hidden, with a 60-second limit, instead of a fixed sleep.
- API responses are matched on URL, status 200, page number, and property value, so a late response from another search cannot be counted.
- **Accept All** on the cookie consent banner is clicked when that button appears within 3 seconds. The search continues when the cookie consent banner is absent.
- CI retries absorb rare timing failures. A test that needs the retry every time is investigated; the retry is not treated as a fix.

### Self-healing (optional)

Self-healing here means the suite can recover from a broken locator or a timing shift without a person rewriting the test during the run, and that a permanent locator change is reviewed rather than applied blindly.

What is already in place:

- Accessible-role locators absorb many DOM and CSS changes.
- Playwright auto-waits for visibility, stability, and enabled state before click and fill.
- `expect(...).toBeVisible()` and the loading-indicator wait retry until the timeout, which covers short UI delays.
- CI retry plus trace separates a one-off timing failure from a real break.

A practical AI-assisted loop on top of that:

1. On failure, collect the HTML report error, the trace, and the DOM snapshot from `test-results`.
2. Ask an AI reviewer to compare the failed locator with the snapshot and propose one replacement (role, id, or text), plus the reason.
3. Re-run only the failed test with the proposed locator in a branch. Do not change locators inside the failing run itself.
4. Accept the change only when the re-run passes and the new locator is as specific as the old one. A broader locator that happens to pass can hide a real product change.
5. Keep a short note when a filter is left out of the suite, as with Repayment / Interest Only, and record why.

That keeps healing auditable. The model suggests the repair; the passing re-run and a human review decide whether it is merged.

---

## How to run

```bash
npm ci
npx playwright install
npx playwright test tests/findAMortgage.spec.ts tests/sortingAndFiltering.spec.ts tests/apiValidation.spec.ts --project=chromium --workers=1
npx playwright show-report
```

`BASE_URL` must be set in `.env` to `https://www.mortgageadvicebureau.com/find-a-mortgage/`.

---

## Assumptions

- The public Find a Mortgage journey is the application under test. No login is required.
- Product headings of the form `Product N:` are the UI representation of one result on the current page.
- `resultsViewModel.results.length` on each paginated response is the product count for that page.
- Summing those lengths is the API total while the response does not return `totalCount` and the UI does not display one.
- The UI total is the sum of `Product N:` headings across the pagination pages. Each page starts 10 products after the previous page.
- A 2-year fixed term is represented by the fixed-term option `24`, and matching products can show an initial term from 24 to 35 months.
- Sort order on the visible page is ascending for the selected numeric field.
