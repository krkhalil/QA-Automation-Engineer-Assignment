import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  constructor(page: Page) {
    super(page, '/');
  }

  get heading() {
    return this.page.getByRole('heading', {
      name: /Full-Fledged practice website for Automation Engineers/i,
    });
  }

  async open(): Promise<void> {
    await this.goto();
  }

  async navigateToProducts(): Promise<void> {
    await this.page.goto('/products', {
      waitUntil: 'load',
      timeout: 90_000,
    });
  }
}
