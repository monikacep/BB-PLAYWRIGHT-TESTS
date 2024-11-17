# BB-PLAYWRIGHT-TESTS

## Project Overview

This project contains Playwright tests for the **Loan Calculator** modal. These tests are designed to validate the functionality of the loan calculator, ensuring that it works correctly under various scenarios, including both valid and invalid inputs.

## Prerequisites

- **Node.js** version 18 or higher.
- **Playwright** version 1.48.2.

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/monikacep/BB-PLAYWRIGHT-TESTS.git
   cd BB-PLAYWRIGHT-TESTS
   ```
   
2. Install the dependencies:

    ```bash
    npm install
    ```
    
## Running the Tests

To run the Playwright tests:

```bash
npx playwright test
```

The tests will be executed in the default browser environment specified in the playwright.config.ts file.

## Test Results

The results of the tests will be output to the terminal, with details on the passed/failed tests. For a more detailed report, check the generated XML test report located in `tests-report.xml`.

## Test Suite

The current test suite includes the following tests for the **Loan Calculator** modal:

### Modal Interaction

- Verify the modal can be closed.
- Verify that all modal elements are displayed.

### Valid Input Calculations

- Validate that the loan calculator correctly calculates monthly payments for various loan amounts and maturities.

### Invalid Input Calculations

- Ensure the modal does not accept invalid amounts or maturities.

