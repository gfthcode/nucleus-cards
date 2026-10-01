import { expect, test } from "@playwright/test";

test("market defaults to sourced card photographs and keeps demo browsing explicit", async ({ page }) => {
  await page.goto("/market");
  const scope = page.getByRole("group", { name: /卡片目录范围|Catalog scope/ });
  await expect(scope.getByRole("button", { name: /实物卡图|Real card photos/ })).toHaveAttribute("aria-pressed", "true");
  const products = page.getByTestId("market-gallery").locator("article");
  await expect(products.first()).toBeVisible();
  const resultCount = Number(await page.getByTestId("market-result-count").innerText());
  await expect(products).toHaveCount(resultCount);
  expect(resultCount).toBeGreaterThan(48);
  await expect(page.locator('[data-evidence="demo"]')).toHaveCount(0);
  await expect(products.first()).toContainText(/实时价格和价格波动|Live price & price movement|卡片资料与图片来源|Card details & photo source/);
  await expect(products.first().locator('footer a[target="_blank"]')).toHaveAttribute("href", /^https:\/\//);
  await expect(page.locator("a a")).toHaveCount(0);
  await scope.getByRole("button", { name: /演示样本|Demo samples/ }).click();
  await expect(page.locator('[data-evidence="demo"]').first()).toBeVisible();
  await expect(page.locator('[data-evidence="photo"]')).toHaveCount(0);
  await expect(page.getByTestId("market-result-count")).toHaveText("21");
});

test("market shows every filtered card in one continuous scroll without page navigation", async ({ page }) => {
  await page.goto("/market");
  await page.getByRole("group", { name: /卡片目录范围|Catalog scope/ }).getByRole("button", { name: /全部记录|All records/ }).click();
  const count = Number(await page.getByTestId("market-result-count").innerText());
  expect(count).toBeGreaterThan(48);
  await expect(page.getByTestId("market-gallery").locator("article")).toHaveCount(count);
  await expect(page.getByRole("navigation", { name: /卡片分页|Card pages/ })).toHaveCount(0);
  const name = await page.getByTestId("market-gallery").locator("article > a").first().getAttribute("data-analytics-label");
  await page.locator('input[data-analytics-event="search_used"]').fill(name!);
  const searchCount = Number(await page.getByTestId("market-result-count").innerText());
  await expect(page.getByTestId("market-gallery").locator("article")).toHaveCount(searchCount);
  await expect(page.getByRole("navigation", { name: /卡片分页|Card pages/ })).toHaveCount(0);
});

test("unknown photographed-card prices are not treated as under-one-thousand sales", async ({ page }) => {
  await page.goto("/market");
  await page.getByRole("combobox", { name: /成交区间|Sale range/ }).selectOption("under1k");
  // Every newly imported photo record has no sale or listing price evidence.
  await expect(page.getByTestId("market-result-count")).toHaveText("0");
  await expect(page.getByText(/没有可用价格的卡片不会计入价格筛选|Cards without a recorded price are excluded/)).toBeVisible();
});
