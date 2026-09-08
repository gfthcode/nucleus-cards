import { z } from "zod";

export const saleImportSchema = z.object({
  cardIdentityKey: z.string().min(8).max(500),
  soldAt: z.iso.datetime(),
  amount: z.number().positive().max(100_000_000),
  currency: z.enum(["CNY", "HKD", "USD"]),
  source: z.string().min(2).max(100),
  originalUrl: z.url().optional(),
  verified: z.boolean().default(false),
  isBundle: z.boolean().default(false),
  notes: z.string().max(500).optional(),
});
export const saleImportBatchSchema = z.object({
  records: z.array(saleImportSchema).min(1).max(1000),
});

// Historical market data is only eligible for the verified pipeline when it
// can be traced back to an external sale record.
export const verifiedSaleImportSchema = saleImportSchema.extend({
  originalUrl: z.url(),
  externalSaleId: z.string().min(2).max(200),
  evidenceSnapshot: z.string().min(10).max(10_000),
  verified: z.literal(true),
});

export const verifiedSaleImportBatchSchema = z.object({
  records: z.array(verifiedSaleImportSchema).min(1).max(1000),
});

export const portfolioInputSchema = z.object({
  cardId: z.string().min(1),
  quantity: z.number().int().min(1).max(1000),
  purchasePrice: z.number().min(0),
  purchaseCurrency: z.enum(["CNY", "HKD", "USD"]),
  purchaseDate: z.iso.date(),
  platform: z.string().min(1).max(100),
  fees: z.number().min(0).default(0),
  shipping: z.number().min(0).default(0),
  tax: z.number().min(0).default(0),
  gradingCost: z.number().min(0).default(0),
  note: z.string().max(1000).default(""),
  isPublic: z.boolean().default(false),
});

