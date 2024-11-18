import { Locator, Page } from '@playwright/test'

export class LoanCalculatorPage {

  private page: Page
  private apiUrl: string

  constructor(page: Page, apiUrl: string) {
    this.page = page
    this.apiUrl = apiUrl
  }

  closeButton = () => this.page.locator('button.bb-modal__close.bb-button--icon')
  editButton = () => this.page.locator('button.bb-edit-amount')
  submitButton = () => this.page.locator('.bb-calculator-modal__submit-button')
  modalElement = () => this.page.locator('.bb-modal.wrapper.bb-modal--m.bb-modal--card.bb-modal--card-full-mobile')
  titleElement = () => this.page.locator('span.bb-calculator-modal__heading')
  monthlyPaymentAmountElement = () => this.page.locator('p.bb-labeled-value__value')
  loanAmountElement  = () => this.page.locator('.bb-edit-amount__amount')
  amountRangeElement = () => this.page.locator('//*[@id="header-calculator-amount"]/*[contains(@class, "bb-slider__ranges")]')
  maturityRangeElement = () => this.page.locator('//*[@id="header-calculator-period"]/*[contains(@class, "bb-slider__ranges")]')
  amountInput = () => this.page.locator('input[name="header-calculator-amount"]')
  maturityInput = () => this.page.locator('input[name="header-calculator-period"]')
  modalDisclaimer = () => this.page.locator('.bb-modal__disclaimer-desktop')

  private async getText(locator: Locator): Promise<string> {
    const textContent = await locator.textContent()
    
    return textContent?.trim() ?? ''
  }

  public async getAmount(element: Locator): Promise<number> {
    const text = await this.getText(element)
    const amount = parseFloat(text.replace(/[€‚,]/g, '').trim())
    
    return isNaN(amount) ? 0 : amount
  }

  public async getNumericInputValue(element: Locator) {
    const inputValue = await element.inputValue();
    const numericValue = parseFloat(inputValue);
    
    return isNaN(numericValue) ? 0 : numericValue
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