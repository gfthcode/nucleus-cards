import type { MetadataRoute } from "next";
import { productConfig } from "@/config/product";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: [
          "Googlebot",
          "Bingbot",
          "GPTBot",
          "ChatGPT-User",
          "ClaudeBot",
          "anthropic-ai",
          "PerplexityBot",
        ],
        allow: "/",
      },
      { userAgent: "*", allow: "/" },
    ],
    sitemap: `${productConfig.siteUrl}/sitemap.xml`,
    host: productConfig.siteUrl,
  };
}
