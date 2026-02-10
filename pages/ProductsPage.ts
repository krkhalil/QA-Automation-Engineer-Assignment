import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProductsPage extends BasePage {
  constructor(page: Page) {
    super(page, '/products');
  }

  get searchInput() {
    return this.page.locator('#search_product');
  }

  get searchButton() {
    return this.page.locator('#submit_search');
  }

  get allProductsHeading() {
    return this.page.getByRole('heading', { name: /All Products|Searched Products/i });
  }

  get addedToCartModal() {
    return this.page.locator('.modal-content').filter({ hasText: 'added to cart' }).or(
      this.page.getByRole('link', { name: 'View Cart' })
    ).first();
  }

  get viewCartLink() {
    return this.page.getByRole('link', { name: 'View Cart' });
  }

  get continueShoppingButton() {
    return this.page.getByRole('button', { name: 'Continue Shopping' });
  }

  async open(): Promise<void> {
    await this.goto();
  }

  async searchProduct(query: string): Promise<void> {
    await this.searchInput.fill(query);
    await this.searchButton.click({ noWaitAfter: true });
    await this.page.waitForURL(/search=|\/products/, { timeout: 15_000 }).catch(() => {});
    await this.page.getByText('Searched Products', { exact: false }).first()
      .waitFor({ state: 'visible', timeout: 15_000 });
  }

  /**
   * Add to cart by product name (e.g. "Blue Top", "Men Tshirt").
   * Clicks the "Add to cart" link for the first matching product.
   */
  async addProductToCartByName(productName: string): Promise<void> {
    const card = this.page.locator('.single-products').filter({ hasText: productName }).first();
    await card.hover();
    const addLink = card.getByRole('link', { name: /Add to cart/i }).or(
      card.getByRole('button', { name: /Add to cart/i })
    ).or(card.locator('a').filter({ hasText: /Add to cart/i }));
    if ((await addLink.count()) > 0) {
      await addLink.first().click({ noWaitAfter: true });
    } else {
      await this.addFirstProductToCart();
    }
  }

  /**
   * Add the first available product to cart (when search returns results).
   * "Add to cart" is inside a hover overlay - hover the product first.
   */
  async addFirstProductToCart(): Promise<void> {
    const firstProduct = this.page.locator('.single-products').first();
    await firstProduct.hover();
    const addToCart = this.page.getByRole('link', { name: /Add to cart/i }).or(
      this.page.getByRole('button', { name: /Add to cart/i })
    ).or(this.page.locator('a').filter({ hasText: /Add to cart/i }));
    await addToCart.first().click({ noWaitAfter: true });
  }

  async closeAddToCartModalAndContinueShopping(): Promise<void> {
    await this.continueShoppingButton.click();
  }

  async viewCartFromModal(): Promise<void> {
    await this.viewCartLink.click();
  }

  async waitForAddedToCartMessage(): Promise<void> {
    await this.viewCartLink.waitFor({ state: 'visible', timeout: 15_000 });
  }
}
