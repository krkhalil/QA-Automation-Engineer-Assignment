import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class CartPage extends BasePage {
  constructor(page: Page) {
    super(page, '/view_cart');
  }

  get checkoutButton() {
    return this.page.getByRole('link', { name: 'Proceed to Checkout' }).or(
      this.page.getByText('Proceed to Checkout')
    ).first();
  }

  get cartTable() {
    return this.page.locator('#cart_info_table, .cart_info_table, table').first();
  }

  get emptyCartMessage() {
    return this.page.getByText('Cart is empty', { exact: false });
  }

  async open(): Promise<void> {
    await this.goto();
  }

  async proceedToCheckout(): Promise<void> {
    await this.checkoutButton.click();
  }

  async hasItems(): Promise<boolean> {
    const empty = await this.emptyCartMessage.isVisible().catch(() => false);
    return !empty;
  }
}
