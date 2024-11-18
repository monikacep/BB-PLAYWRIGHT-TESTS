import { test, expect } from '@playwright/test'
import { LoanCalculatorPage } from '../pages/loanCalculator.page'
import loanTestData from './data/loanTestData.json'
import { describe } from 'node:test'

let loanCalculatorPage: LoanCalculatorPage
const apiUrl = 'https://taotlus.bigbank.ee/api/v1/loan/calculate'

test.describe('Loan Calculator', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/')
        loanCalculatorPage = new LoanCalculatorPage(page, apiUrl)
        await loanCalculatorPage.modalElement().waitFor({ state: 'visible' })
    })

    test.describe('Modal Interaction', () => {
        test('should close the modal when the close button is clicked', async () => {
            await loanCalculatorPage.closeButton().click()
            await loanCalculatorPage.waitForModalToClose()
            expect(loanCalculatorPage.modalElement()).toBeHidden()
        })

        test('should display all loan calculator modal elements', () => {
            expect(loanCalculatorPage.titleElement()).toBeVisible()
            expect(loanCalculatorPage.amountInput()).toBeVisible()
            expect(loanCalculatorPage.amountRangeElement()).toBeVisible()
            expect(loanCalculatorPage.maturityInput()).toBeVisible()
            expect(loanCalculatorPage.monthlyPaymentAmountElement()).toBeVisible()
            expect(loanCalculatorPage.submitButton()).toBeVisible()
            expect(loanCalculatorPage.modalDisclaimer()).toBeVisible()
        })
    })

    test.describe('Loan Parameters Selection and Saving', () => {
        test(`should allow selecting and saving loan parameters`, async () => {
            await loanCalculatorPage.amountInput().fill(loanTestData.defaultAmount)
            const amountInputValue = await loanCalculatorPage.getNumericInputValue(loanCalculatorPage.amountInput())
            expect(amountInputValue).toBe(parseFloat(loanTestData.defaultAmount))

            await loanCalculatorPage.maturityInput().fill(loanTestData.defaultMaturity)
            const maturityInputValue = await loanCalculatorPage.getNumericInputValue(loanCalculatorPage.maturityInput())
            expect(maturityInputValue).toBe(parseFloat(loanTestData.defaultMaturity))

            await loanCalculatorPage.submitButton().click()

            const displayedLoanAmount = await loanCalculatorPage.getAmount(loanCalculatorPage.loanAmountElement())
            expect(displayedLoanAmount).toBe(parseFloat(loanTestData.defaultAmount))
            await loanCalculatorPage.editButton().click()

            const savedAmountInputValue = await loanCalculatorPage.getNumericInputValue(loanCalculatorPage.amountInput())
            expect(savedAmountInputValue).toBe(parseFloat(loanTestData.defaultAmount))
            const savedMaturityInputValue = await loanCalculatorPage.getNumericInputValue(loanCalculatorPage.maturityInput())
            expect(savedMaturityInputValue).toBe(parseFloat(loanTestData.defaultMaturity))
        })
    })

    test.describe('Valid Input Calculations', () => {
        for (const data of loanTestData.validLoanData) {
            test(`should calculate monthly payment correctly for ${data.amount} amount and ${data.maturity} maturity`, async ({ page }) => {
                await loanCalculatorPage.amountInput().fill(data.amount)
                const amountInputValue = await loanCalculatorPage.getNumericInputValue(loanCalculatorPage.amountInput())
                expect(amountInputValue).toBe(parseFloat(data.amount))

                await loanCalculatorPage.maturityInput().fill(data.maturity)
                const maturityInputValue = await loanCalculatorPage.getNumericInputValue(loanCalculatorPage.maturityInput())
                expect(maturityInputValue).toBe(parseFloat(data.maturity))

                const apiResponse = await loanCalculatorPage.interceptApiRequest()
                await loanCalculatorPage.waitForCalculationToComplete()
                const displayedMonthlyPaymentAmount = await loanCalculatorPage.getAmount(loanCalculatorPage.monthlyPaymentAmountElement())
                const expectedMonthlyPaymentAmount = parseFloat(apiResponse.monthlyPayment)
                expect(displayedMonthlyPaymentAmount).toBe(expectedMonthlyPaymentAmount)
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
