import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class CheckoutPage extends BasePage {
  constructor(page: Page) {
    super(page, '/checkout');
  }

  get placeOrderButton() {
    return this.page.getByRole('link', { name: 'Place Order' }).or(
      this.page.getByText('Place Order')
    ).first();
  }

  get checkoutModal() {
    return this.page.locator('.modal-content').filter({ hasText: 'Order' });
  }

  get nameOnCardInput() {
    return this.page.locator('input[name="name_on_card"]');
  }

  get cardNumberInput() {
    return this.page.locator('input[name="card_number"]');
  }

  get cvcInput() {
    return this.page.locator('input[name="cvc"]');
  }

  get expiryMonthInput() {
    return this.page.locator('input[name="expiry_month"]');
  }

  get expiryYearInput() {
    return this.page.locator('input[name="expiry_year"]');
  }

  get payButton() {
    return this.page.getByRole('button', { name: 'Pay and Confirm Order' }).or(
      this.page.getByRole('button', { name: 'Confirm Order' })
    ).first();
  }

  get orderPlacedMessage() {
    return this.page.getByText('Order Placed!', { exact: false }).or(
      this.page.getByText('Congratulations! Your order has been confirmed')
    );
  }

  async open(): Promise<void> {
    await this.goto();
  }

  /**
   * Proceed to Place Order (checkout simulation).
   * If the site shows a register/login step, we only simulate up to the payment modal.
   */
  async clickPlaceOrder(): Promise<void> {
    await this.placeOrderButton.click();
  }

  /**
   * Fill payment details in the modal (simulation - use test data).
   */
  async fillPaymentDetails(details: {
    nameOnCard: string;
    cardNumber: string;
    cvc: string;
    expiryMonth: string;
    expiryYear: string;
  }): Promise<void> {
    await this.nameOnCardInput.fill(details.nameOnCard);
    await this.cardNumberInput.fill(details.cardNumber);
    await this.cvcInput.fill(details.cvc);
    await this.expiryMonthInput.fill(details.expiryMonth);
    await this.expiryYearInput.fill(details.expiryYear);
  }

  async submitPayment(): Promise<void> {
    await this.payButton.click();
  }

  async waitForOrderConfirmation(): Promise<void> {
    await this.orderPlacedMessage.waitFor({ state: 'visible', timeout: 15_000 });
  }
}
