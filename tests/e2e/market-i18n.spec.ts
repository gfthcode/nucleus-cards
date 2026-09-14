import { expect, test } from "@playwright/test";

test("market English mode has no unintended CJK UI", async ({ page, context }) => {
  await context.addCookies([{ name: "nucleus-locale", value: "en", domain: "localhost", path: "/" }]);
  await page.goto("/market");
  await expect(page.getByRole("heading", { name: "Sports card market" })).toBeVisible();
  const visibleText = await page.locator("body").innerText();
  expect(visibleText.replaceAll("中", "")).not.toMatch(/[\u3400-\u4DBF\u4E00-\u9FFF]/);
});

