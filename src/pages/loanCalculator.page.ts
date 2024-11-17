import { Page } from '@playwright/test'

export class LoanCalculatorPage {
  protected page: Page
  private apiUrl: string

  constructor(page: Page, apiUrl: string) {
    this.page = page
    this.apiUrl = apiUrl
  }

  modalElement = () => this.page.locator('.bb-modal.wrapper.bb-modal--m.bb-modal--card.bb-modal--card-full-mobile')
  closeButton = () => this.page.locator('button.bb-modal__close.bb-button--icon')
  titleElement = () => this.page.locator('span.bb-calculator-modal__heading')
  amountInput = () => this.page.locator('input[name="header-calculator-amount"]')
  maturityInput = () => this.page.locator('input[name="header-calculator-period"]')
  monthlyPaymentAmountElement = () => this.page.locator('p.bb-labeled-value__value')
  amountRangeElement = () => this.page.locator('//*[@id="header-calculator-amount"]/*[contains(@class, "bb-slider__ranges")]')
  maturityRangeElement = () => this.page.locator('//*[@id="header-calculator-period"]/*[contains(@class, "bb-slider__ranges")]')
  submitButton = () => this.page.locator('.bb-calculator-modal__submit-button')
  modalDisclaimer = () => this.page.locator('.bb-modal__disclaimer-desktop')

  private async getMonthlyPaymentAmountText(): Promise<string> {
    const element = this.page.locator('p.bb-labeled-value__value')
    const textContent = await element.textContent()
    return textContent?.trim() ?? ''
  }

  public async getMonthlyPaymentAmount(): Promise<number> {
    const text = await this.getMonthlyPaymentAmountText()
    const monthlyPaymentAmount = parseFloat(text.replace(/[^\d.-]/g, '').trim())
    return isNaN(monthlyPaymentAmount) ? 0 : monthlyPaymentAmount
  }

  public async waitForCalculationToComplete() {
    await this.page.waitForTimeout(6000)
  }


  public async waitForModalToClose() {
    await this.page.waitForTimeout(2000)
  }

  public async interceptApiRequest(): Promise<any> {
    let apiResponse: any
    const routePromise = new Promise<void>((resolve) => {
      this.page.route(this.apiUrl, async (route) => {
        const response = await route.fetch()
        apiResponse = await response.json()
        await route.fulfill({
          status: response.status(),
          body: JSON.stringify(apiResponse),
        })
        resolve()
      })
    })
    await this.maturityInput().blur()
    await routePromise
    console.log('API response: ', apiResponse)

    return apiResponse
  }
}