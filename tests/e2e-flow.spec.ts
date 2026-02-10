import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { ProductsPage } from '../pages/ProductsPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';

test.describe('E2E Flow - Automation Exercise', () => {
  test('navigate, search product, add to cart, checkout simulation', async ({ page }) => {
    const homePage = new HomePage(page);
    const productsPage = new ProductsPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    // 1. Navigate to the site (Home)
    await homePage.open();
    await expect(homePage.heading).toBeVisible();
    await expect(page).toHaveURL(/automationexercise\.com\/?$/);

    // 2. Navigate to Products
    await homePage.navigateToProducts();
    await expect(page).toHaveURL(/\/products/, { timeout: 25_000 });
    await expect(productsPage.allProductsHeading).toBeVisible({ timeout: 15_000 });

    // 3. Search for a product
    await productsPage.searchProduct('Blue Top');
    await expect(
      page.getByRole('heading', { name: 'Searched Products' })
    ).toBeVisible({ timeout: 15_000 });

    // 4. Add product to cart (first result after search)
    await productsPage.addFirstProductToCart();
    await productsPage.waitForAddedToCartMessage();

    // 5. Go to Cart (via modal)
    await productsPage.viewCartFromModal();

    // 6. Verify cart and proceed to checkout
    await expect(page).toHaveURL(/\/view_cart/);
    await expect(cartPage.cartTable).toBeVisible({ timeout: 10_000 });
    await cartPage.proceedToCheckout();

    // 7. Checkout simulation
    // Option A: Site shows "Register/Login" - we've reached checkout gate
    // Option B: Logged-in flow - we see Place Order and can complete with test payment
    const registerLogin = page.getByRole('link', { name: /Register.*Login|Signup.*Login/i });
    const placeOrderBtn = page.getByRole('link', { name: 'Place Order' });

    const hasPlaceOrder = await placeOrderBtn.isVisible().catch(() => false);
    const hasRegisterLogin = await registerLogin.isVisible().catch(() => false);

    if (hasPlaceOrder) {
      await placeOrderBtn.click();
      const nameOnCard = page.locator('input[name="name_on_card"]');
      await nameOnCard.waitFor({ state: 'visible', timeout: 5000 }).catch(() => null);
      if (await nameOnCard.isVisible().catch(() => false)) {
        await checkoutPage.fillPaymentDetails({
          nameOnCard: 'Test User',
          cardNumber: '4111111111111111',
          cvc: '123',
          expiryMonth: '12',
          expiryYear: '2028',
        });
        await checkoutPage.submitPayment();
        await checkoutPage.waitForOrderConfirmation();
        await expect(checkoutPage.orderPlacedMessage).toBeVisible();
      }
    }

    if (hasRegisterLogin && !hasPlaceOrder) {
      await expect(registerLogin).toBeVisible();
    }

    expect(page.url()).toMatch(/checkout|view_cart|cart|login|payment/);
  });
});
