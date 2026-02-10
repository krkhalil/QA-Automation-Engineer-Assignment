import { Page } from '@playwright/test';

const BASE_URL = 'https://www.automationexercise.com';

export abstract class BasePage {
  readonly page: Page;
  readonly path: string;

  constructor(page: Page, path: string = '') {
    this.page = page;
    this.path = path;
  }

  async goto(options?: { waitUntil?: 'load' | 'domcontentloaded' }): Promise<void> {
    await this.page.goto(`${BASE_URL}${this.path}`, {
      waitUntil: options?.waitUntil ?? 'domcontentloaded',
      timeout: 60_000,
    });
  }

  async getTitle(): Promise<string> {
    return this.page.title();
  }

  get navProducts() {
    return this.page.getByRole('link', { name: 'Products' }).first();
  }

  get navCart() {
    return this.page.getByRole('link', { name: 'Cart' }).first();
  }

  get navSignupLogin() {
    return this.page.getByRole('link', { name: 'Signup / Login' }).first();
  }

  get navHome() {
    return this.page.getByRole('link', { name: 'Home' }).first();
  }

  async goToProducts(): Promise<void> {
    await this.navProducts.click({ noWaitAfter: true });
  }

  async goToCart(): Promise<void> {
    await this.navCart.click({ noWaitAfter: true });
  }
}
