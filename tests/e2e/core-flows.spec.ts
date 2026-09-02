import { expect, test } from "@playwright/test";

test("critical market, rookie, portfolio, and mobile flows", async ({
  page,
}) => {
  await test.step("market filters and card detail", async () => {
    await page.goto("/market");
    await expect(
      page.getByRole("heading", { name: "球星卡行情市场" }),
    ).toBeVisible();
    await page
      .getByRole("combobox", { name: "球员代际", exact: true })
      .selectOption("retired_legend");
    await expect(page.getByText("Michael Jordan").first()).toBeVisible();
    await page
      .getByRole("combobox", { name: "球员代际", exact: true })
      .selectOption("all");
    await page.getByPlaceholder("球员、球队、品牌或系列").fill("Flagg");
    await expect(page.getByText("Cooper Flagg").first()).toBeVisible();
    await page
      .getByRole("link", { name: /Cooper Flagg/ })
      .first()
      .click();
    await expect(page.getByText("最新真实成交")).toBeVisible();
    await expect(page.getByText("最新在售标价")).toBeVisible();
  });

  await test.step("2020-2026 draft classes and cross-year comparison", async () => {
    await page.goto("/rookies/2025");
    await expect(
      page.getByRole("heading", { name: "2025 选秀届新秀专区" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "跨年份新秀对比" }),
    ).toBeVisible();
    await page.getByLabel("对比年份 1").selectOption("2020");
    await expect(page.getByLabel("对比年份 1")).toHaveValue("2020");
    await expect(
      page.getByRole("heading", { name: "安东尼·爱德华兹" }),
    ).toBeVisible();
    await page.getByRole("link", { name: "2024", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "2024 选秀届新秀专区" }),
    ).toBeVisible();
    await page.getByRole("link", { name: "2026", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "2026 选秀届新秀专区" }),
    ).toBeVisible();
  });

  await test.step("portfolio add and delete", async () => {
    await page.goto("/portfolio");
    await page.evaluate(() =>
      window.localStorage.removeItem("nucleus-portfolio"),
    );
    await page.reload();
    await expect(page.getByTestId("cohort-allocation")).toBeVisible();
    await page.getByLabel("买入价 CNY").fill("1000");
    await page.getByRole("button", { name: "添加持仓" }).click();
    await expect(page.getByText("4 个条目")).toBeVisible();
    await page.getByRole("button", { name: "删除" }).last().click();
    await expect(page.getByText("3 个条目")).toBeVisible();
  });

  await test.step("admin batch cohort management", async () => {
    await page.goto("/admin");
    await expect(
      page.getByRole("heading", {
        name: "2020—2026 与角色球员批量管理",
      }),
    ).toBeVisible();
    await page.getByRole("button", { name: "全选" }).click();
    await page.getByRole("button", { name: /应用至/ }).click();
    await expect(page.getByText(/已在本地演示中更新/)).toBeVisible();
  });

  await test.step("mobile navigation", async () => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await expect(
      page.getByRole("navigation", { name: "手机导航" }),
    ).toBeVisible();
    await page
      .getByRole("navigation", { name: "手机导航" })
      .getByRole("link", { name: /行情/ })
      .click();
    await expect(page).toHaveURL(/\/market/);
  });
});
