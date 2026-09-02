"use client";

import { useState } from "react";
const initial = [
  ["公开昵称", true],
  ["头像与收藏简介", true],
  ["公开卡片", true],
  ["购买成本", false],
  ["盈亏数据", false],
  ["精确资产总额", false],
] as const;
export function PrivacySettings() {
  const [settings, setSettings] = useState<Record<string, boolean>>(
    Object.fromEntries(initial),
  );
  const [saved, setSaved] = useState(false);
  return (
    <section className="settings-grid">
      <div className="data-panel">
        <div className="section-heading">
          <div>
            <span className="section-kicker">PUBLIC PROFILE</span>
            <h2>公开资料隐私</h2>
          </div>
        </div>
        <div className="setting-list">
          {initial.map(([label]) => (
            <label key={label}>
              <div>
                <b>{label}</b>
                <small>
                  {["购买成本", "盈亏数据", "精确资产总额"].includes(label)
                    ? "敏感字段，默认关闭"
                    : "可在公开收藏主页展示"}
                </small>
              </div>
              <span className="switch">
                <input
                  type="checkbox"
                  checked={settings[label]}
                  onChange={() => {
                    setSaved(false);
                    setSettings({ ...settings, [label]: !settings[label] });
                  }}
                />
                <span />
              </span>
            </label>
          ))}
        </div>
        <button
          className="button button-primary save-settings"
          onClick={() => setSaved(true)}
        >
          保存设置
        </button>
        {saved && <span className="saved-message">已保存到演示会话</span>}
      </div>
      <aside className="data-panel">
        <div className="section-heading">
          <div>
            <span className="section-kicker">ACCOUNT DATA</span>
            <h2>个人数据</h2>
          </div>
        </div>
        <div className="account-actions">
          <button>
            导出我的数据 <small>接口设计示例</small>
          </button>
          <button className="danger">
            删除账号 <small>生产环境需二次确认</small>
          </button>
        </div>
        <div className="security-note">
          <b>演示模式</b>
          <p>
            没有收集身份证、银行卡或支付信息。正式模式将由 Supabase Auth
            管理身份。
          </p>
        </div>
      </aside>
    </section>
  );
}
