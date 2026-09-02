import type { DataSource } from "@/types/domain";
import type { MarketplaceAdapter } from "./types";

export class EbayBrowseAdapter implements MarketplaceAdapter {
  source: DataSource = {
    id: "src-ebay",
    name: "eBay Browse API",
    region: "INTL",
    enabled: Boolean(process.env.EBAY_CLIENT_ID),
    requiresApiKey: true,
    supportsListings: true,
    supportsSales: false,
    authorization: "official-api",
    error: process.env.EBAY_CLIENT_ID ? undefined : "缺少 EBAY_CLIENT_ID",
  };
  async searchListings() {
    if (!this.source.enabled) return [];
    throw new Error("MVP placeholder: configure official Browse API mapping");
  }
  async fetchListing() {
    return null;
  }
  async fetchSales() {
    return [];
  }
  async fetchPlayerEvents() {
    return [];
  }
  async normalizeCard() {
    return {};
  }
  async validateRecord() {
    return { valid: false, reasons: ["eBay 映射尚未配置"] };
  }
  async getSourceHealth() {
    return {
      status: this.source.enabled
        ? ("degraded" as const)
        : ("disabled" as const),
      checkedAt: new Date().toISOString(),
      message: this.source.error ?? "官方 API 凭据已配置，映射待完成",
    };
  }
}
