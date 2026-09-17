"use client";

import { useEffect } from "react";
import { useI18n } from "@/i18n/client";

const CJK = /[\u3400-\u4DBF\u4E00-\u9FFF]/;

function untranslated(value: string) { return CJK.test(value); }

export function EnglishModeGuard() {
  const { locale } = useI18n();
  useEffect(() => {
    if (locale !== "en") return undefined;
    const audit = (root: Node) => {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      const nodes: Text[] = [];
      let node: Node | null;
      while ((node = walker.nextNode())) nodes.push(node as Text);
      const missing = nodes.map((text) => text.nodeValue ?? "").filter(untranslated);
      if (root instanceof Element) [root, ...Array.from(root.querySelectorAll<HTMLElement>("*[aria-label], *[title], input[placeholder], textarea[placeholder]"))].forEach((element) => {
        for (const attribute of ["aria-label", "title", "placeholder"]) { const value = element.getAttribute(attribute); if (value && untranslated(value)) missing.push(value); }
      });
      if (untranslated(document.title)) missing.push(document.title);
      if (missing.length && process.env.NODE_ENV !== "production") console.warn("Untranslated Chinese strings in English locale", missing.slice(0, 10));
    };
    audit(document.body);
    const observer = new MutationObserver((records) => records.forEach((record) => record.addedNodes.forEach((node) => audit(node))));
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, [locale]);
  return null;
}
