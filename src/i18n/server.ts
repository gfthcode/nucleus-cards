import { cookies } from "next/headers";
import { productConfig, type Locale } from "@/config/product";
import { getMessages, translate, type TranslationKey } from "./messages";

export const localeCookieName = "nucleus-locale";
export function isLocale(value: string | undefined): value is Locale { return value !== undefined && productConfig.supportedLocales.includes(value as Locale); }
export async function getLocale(): Promise<Locale> { const value = (await cookies()).get(localeCookieName)?.value; return isLocale(value) ? value : productConfig.defaultLocale; }
export function getServerTranslator(locale: Locale) { return (key: TranslationKey) => translate(locale, key); }
export { getMessages };
