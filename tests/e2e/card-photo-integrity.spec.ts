import { expect, test } from "@playwright/test";

test("homepage card photos stay inside their full portrait frames", async ({ page }) => {
  await page.goto("/");
  const cards = page.locator('[data-card-photo="true"]');
  await expect(cards.first()).toBeVisible();
  const measurements = await cards.evaluateAll((elements) => elements.map((card) => {
    const photo = card.querySelector("img")!;
    const frame = photo.parentElement!;
    return {
      objectFit: getComputedStyle(photo).objectFit,
      photoHeight: photo.clientHeight,
      frameHeight: frame.clientHeight,
      cardHeight: card.clientHeight,
      frameWidth: frame.clientWidth,
      hasMeta: card.children.length > 1,
    };
  }));
  for (const measurement of measurements) {
    expect(measurement.objectFit).toBe("contain");
    expect(measurement.photoHeight).toBeLessThanOrEqual(measurement.frameHeight + 1);
    expect(measurement.frameHeight).toBeLessThanOrEqual(measurement.cardHeight + 1);
    expect(measurement.frameHeight / measurement.frameWidth).toBeGreaterThan(1.3);
    expect(measurement.hasMeta).toBe(false);
  }
});

test("a failed card photo becomes an explicit unavailable state", async ({ page }) => {
  await page.goto("/");
  const card = page.locator('[data-card-photo="true"]').first();
  await expect(card).toBeVisible();
  const id = await card.getAttribute("data-card-id");
  const photoUrl = await card.locator("img").evaluate((img: HTMLImageElement) => img.src);
  await page.route(photoUrl, (route) => route.abort());
  await page.reload();
  const failedCard = page.locator(`[data-card-id="${id}"]`).first();
  await failedCard.scrollIntoViewIfNeeded();
  await expect(failedCard).toHaveAttribute("data-card-photo", "false");
  await expect(failedCard).toContainText(/实物卡图待补充|Card photo unavailable/);
  await expect(failedCard.locator("img")).toHaveCount(0);
});
