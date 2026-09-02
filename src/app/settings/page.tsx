import type { Metadata } from "next";
import { PrivacySettings } from "@/components/privacy-settings";
import { PageHeader } from "@/components/page-header";
export const metadata: Metadata = { title: "隐私设置" };
export default function SettingsPage() {
  return (
    <main className="page-shell inner-page">
      <PageHeader
        eyebrow="PRIVACY BY DEFAULT"
        title="隐私与数据设置"
        description="敏感字段默认不公开。用户必须主动开启，公开收藏页才会展示相应信息。"
      />
      <PrivacySettings />
    </main>
  );
}
