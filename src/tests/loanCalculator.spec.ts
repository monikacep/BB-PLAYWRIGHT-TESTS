import { test, expect } from '@playwright/test'
import { LoanCalculatorPage } from '../pages/loanCalculator.page'
import loanTestData from './data/loanTestData.json'

let loanCalculatorPage: LoanCalculatorPage
const apiUrl = 'https://taotlus.bigbank.ee/api/v1/loan/calculate'

test.describe('Loan Calculator', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/')
        loanCalculatorPage = new LoanCalculatorPage(page, apiUrl)
        await loanCalculatorPage.modalElement().waitFor({ state: 'visible' })
    })

    test('should let to close modal', async ({page }) => {
        await loanCalculatorPage.closeButton().click()
        await loanCalculatorPage.waitForModalToClose()
        expect(loanCalculatorPage.modalElement()).toBeHidden()
    })

    test('should display all loan calculator modal elements', async ({ }) => {
        expect(loanCalculatorPage.titleElement()).toBeVisible()
        expect(loanCalculatorPage.amountInput()).toBeVisible()
        expect(loanCalculatorPage.amountRangeElement()).toBeVisible()
        expect(loanCalculatorPage.maturityInput()).toBeVisible()
        expect(loanCalculatorPage.monthlyPaymentAmountElement()).toBeVisible()
        expect(loanCalculatorPage.submitButton()).toBeVisible()
        expect(loanCalculatorPage.modalDisclaimer()).toBeVisible()
    })

    test.describe('Valid Input Calculations', () => {
        for (const data of loanTestData.validLoanData) {
            test(`should calculate monthly payment correctly for ${data.amount} amount and ${data.maturity} maturity`, async ({ page }) => {
                await loanCalculatorPage.amountInput().fill(data.amount)
                await loanCalculatorPage.maturityInput().fill(data.maturity)
                const apiResponse = await loanCalculatorPage.interceptApiRequest()
                await loanCalculatorPage.waitForCalculationToComplete()
                const displayedAmount = await loanCalculatorPage.getMonthlyPaymentAmount()
                const expectedAmount = parseFloat(apiResponse.monthlyPayment)
                expect(displayedAmount).toBe(expectedAmount)
            })
        }
    })

    test.describe('Invalid Input Calculations', () => {
        for (const data of loanTestData.invalidAmountLoanData) {
            test(`should not allow to input invalid ${data.amount} amount`, async () => {
                await loanCalculatorPage.amountInput().fill(data.amount)
                await loanCalculatorPage.amountInput().blur()
                expect(loanCalculatorPage.amountInput()).not.toBe(data.amount)
            })
        }
        for (const data of loanTestData.invalidMaturityLoanData) {
            test(`should not allow to input invalid ${data.maturity} maturity`, async () => {
                await loanCalculatorPage.maturityInput().fill(data.maturity)
                await loanCalculatorPage.maturityInput().blur()
                expect(loanCalculatorPage.maturityInput()).not.toBe(data.maturity)
            })
        }
    })
})
