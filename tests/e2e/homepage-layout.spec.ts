import { expect, test } from "@playwright/test";

test("homepage capability hierarchy adapts to mobile", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");

  const grid = page.locator("#features [class*='featureGrid']");
  const firstCard = grid.locator(":scope > a").first();
  const desktopLayout = await grid.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      columns: style.gridTemplateColumns.split(" ").length,
      firstCardRowEnd: getComputedStyle(element.firstElementChild!).gridRowEnd,
    };
  });

  expect(await grid.locator(":scope > a").count()).toBe(3);
  expect(desktopLayout.columns).toBe(2);
  expect(desktopLayout.firstCardRowEnd).toBe("span 2");

  await page.setViewportSize({ width: 390, height: 844 });

  const mobileLayout = await grid.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      columns: style.gridTemplateColumns.split(" ").length,
      firstCardRowEnd: getComputedStyle(element.firstElementChild!).gridRowEnd,
    };
  });

  expect(mobileLayout.columns).toBe(1);
  expect(mobileLayout.firstCardRowEnd).toBe("auto");
  await expect(firstCard).toBeVisible();
});
