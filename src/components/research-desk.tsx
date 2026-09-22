"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  ArrowUpRight,
  CircleAlert,
  FileText,
  LoaderCircle,
  Send,
  ShieldCheck,
} from "lucide-react";
import type { ResearchResponse } from "@/lib/card-research-agent";
import styles from "./research-desk.module.css";

type ResearchTarget = { id: string; label: string };
type Session = {
  id: string;
  card_id: string;
  title: string;
  updated_at: string;
};
type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  evidence?: ResearchResponse["evidence"];
  tool_trace?: ResearchResponse["toolTrace"];
  created_at: string;
};
type ResearchDocument = {
  id: string;
  source_filename: string;
  byte_size: number;
  status: "uploaded" | "ready_for_review" | "approved" | "rejected" | "failed";
  extracted_fields?: {
    summary?: string;
    candidates?: Array<{ playerName?: string; confidence?: "high" | "medium" | "low" }>;
    warnings?: string[];
  };
};

const questionSuggestions = [
  "这张卡的成交证据够不够？",
  "和我的收藏重复吗？",
  "哪些信息会推翻当前判断？",
];

export function ResearchDesk({ targets }: { targets: ResearchTarget[] }) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [selectedCardId, setSelectedCardId] = useState(targets[0]?.id ?? "");
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState("这张卡的成交证据够不够？");
  const [busy, setBusy] = useState(false);
  const [documents, setDocuments] = useState<ResearchDocument[]>([]);
  const [documentBusy, setDocumentBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState(
    "登录后，研究记录只保存到你的私有空间。",
  );

  useEffect(() => {
    void fetch("/api/research/sessions")
      .then(async (response) => ({
        ok: response.ok,
        payload: await response.json(),
      }))
      .then(({ ok, payload }) => {
        if (!ok) {
          setNotice(payload.error ?? "请先登录后使用研究工作台。");
          return;
        }
        setSessions(payload.data ?? []);
      })
      .catch(() => setNotice("暂时无法连接研究记录。"));
  }, []);

  useEffect(() => {
    void fetch("/api/research/documents")
      .then(async (response) => ({ ok: response.ok, payload: await response.json() }))
      .then(({ ok, payload }) => {
        if (ok) setDocuments(payload.data ?? []);
      })
      .catch(() => undefined);
  }, []);

  async function uploadDocument(file: File | undefined) {
    if (!file || documentBusy) return;
    setDocumentBusy("upload");
    try {
      const form = new FormData();
      form.set("file", file);
      const response = await fetch("/api/research/documents", { method: "POST", body: form });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error ?? "PDF 上传失败。");
      setDocuments((current) => [payload.data, ...current]);
      setNotice("PDF 已进入你的私有审核区；请先提取草稿并核对，不会自动导入收藏。");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "PDF 上传失败。");
    } finally {
      setDocumentBusy(null);
    }
  }

  async function extractDocument(id: string) {
    setDocumentBusy(id);
    try {
      const response = await fetch(`/api/research/documents/${id}/extract`, { method: "POST" });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error ?? "PDF 草稿提取失败。");
      setDocuments((current) => current.map((document) => document.id === id ? payload.data : document));
      setNotice("PDF 已生成待审核草稿。请核对候选卡片与字段；确认并不会自动写入收藏。 ");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "PDF 草稿提取失败。");
    } finally {
      setDocumentBusy(null);
    }
  }

  async function approveDocument(id: string) {
    if (!window.confirm("确认该草稿只保存为已审核记录？它不会自动新增收藏或持仓。")) return;
    setDocumentBusy(id);
    try {
      const response = await fetch(`/api/research/documents/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmed: true }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error ?? "保存审核决定失败。");
      setDocuments((current) => current.map((document) => document.id === id ? payload.data : document));
      setNotice("审核决定已保存。下一步必须显式匹配到已核验卡片后，才可创建收藏记录。");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "保存审核决定失败。");
    } finally {
      setDocumentBusy(null);
    }
  }

  async function loadMessages(id: string) {
    setBusy(true);
    const response = await fetch(`/api/research/sessions/${id}/messages`);
    const payload = await response.json().catch(() => ({}));
    setBusy(false);
    if (!response.ok) {
      setNotice(payload.error ?? "无法读取研究记录。");
      return;
    }
    setSessionId(id);
    setMessages(payload.data ?? []);
  }

  async function ensureSession() {
    if (sessionId) return sessionId;
    const response = await fetch("/api/research/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cardId: selectedCardId }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error ?? "无法创建研究会话。");
    const created = payload.data as Session;
    setSessionId(created.id);
    setSessions((current) => [created, ...current]);
    return created.id;
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!question.trim() || busy) return;
    setBusy(true);
    try {
      const id = await ensureSession();
      const response = await fetch(`/api/research/sessions/${id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error ?? "研究请求失败。");
      const answer = payload.data as ResearchResponse;
      setMessages((current) => [
        ...current,
        {
          id: `local-user-${Date.now()}`,
          role: "user",
          content: question,
          created_at: new Date().toISOString(),
        },
        {
          id: `local-agent-${Date.now()}`,
          role: "assistant",
          content: answer.answer,
          evidence: answer.evidence,
          tool_trace: answer.toolTrace,
          created_at: answer.generatedAt,
        },
      ]);
      setQuestion("");
      setNotice("已完成只读核验；任何收藏、提醒或导入写入都需要你另行确认。");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "研究请求失败。");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className={styles.desk} aria-label="球星卡研究助理">
      <header>
        <div>
          <span>收藏研究助理</span>
          <h2>带证据的收藏研究助理</h2>
          <p>先核对身份与样本，再解释结论；没有可靠证据时会明确说明。</p>
        </div>
        <div className={styles.boundary}>
          <ShieldCheck size={17} />
          <span>
            仅读取站内数据
            <br />
            写入动作需确认
          </span>
        </div>
      </header>
      <div className={styles.grid}>
        <aside className={styles.history}>
          <b>私有会话</b>
          <button
            type="button"
            className={styles.newSession}
            onClick={() => {
              setSessionId(null);
              setMessages([]);
              setNotice("已新建本地研究草稿，发送问题后才会保存。");
            }}
          >
            + 新建研究
          </button>
          {sessions.length ? (
            sessions.map((session) => (
              <button
                type="button"
                key={session.id}
                className={session.id === sessionId ? styles.activeSession : ""}
                onClick={() => void loadMessages(session.id)}
              >
                {session.title}
                <small>
                  {new Date(session.updated_at).toLocaleDateString("zh-CN")}
                </small>
              </button>
            ))
          ) : (
            <p>还没有已保存的研究会话。</p>
          )}
        </aside>
        <div className={styles.chat}>
          <div className={styles.target}>
            <label htmlFor="research-card">研究对象</label>
            <select
              id="research-card"
              value={selectedCardId}
              disabled={Boolean(sessionId)}
              onChange={(event) => setSelectedCardId(event.target.value)}
            >
              {targets.map((target) => (
                <option key={target.id} value={target.id}>
                  {target.label}
                </option>
              ))}
            </select>
            {sessionId && (
              <small>已有会话锁定研究对象；新建研究可切换卡片。</small>
            )}
          </div>
          <div className={styles.thread} aria-live="polite">
            {messages.length === 0 ? (
              <div className={styles.empty}>
                <CircleAlert size={18} />
                <div>
                  <p>从一个具体问题开始。助理会先检查卡片身份、站内证据和个人收藏边界。</p>
                  <div className={styles.questionSuggestions} aria-label="常用研究问题">
                    {questionSuggestions.map((suggestion) => (
                      <button type="button" key={suggestion} onClick={() => setQuestion(suggestion)}>
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <article
                  key={message.id}
                  className={
                    message.role === "user"
                      ? styles.userMessage
                      : styles.agentMessage
                  }
                >
                  <b>{message.role === "user" ? "你" : "研究助理"}</b>
                  <p>{message.content}</p>
                  {message.evidence && (
                    <div className={styles.evidence}>
                      {message.evidence.map((item) => (
                        <div key={`${item.label}-${item.updatedAt}`}>
                          <strong>{item.label}</strong>
                          <span className={styles[item.status]}>
                            {item.status === "verified"
                              ? "已核验"
                              : item.status === "demo"
                                ? "演示"
                                : "有限"}
                          </span>
                          <p>{item.detail}</p>
                          <small>
                            {item.source} ·{" "}
                            {item.sampleSize != null
                              ? `${item.sampleSize} 条样本 · `
                              : ""}
                            {new Date(item.updatedAt).toLocaleString("zh-CN")}
                          </small>
                        </div>
                      ))}
                    </div>
                  )}
                  {message.tool_trace && (
                    <small className={styles.tools}>
                      研究路径：
                      {message.tool_trace.map((tool) => tool.name).join(" · ")}
                    </small>
                  )}
                </article>
              ))
            )}
          </div>
          <form onSubmit={submit}>
            <label htmlFor="research-question">向研究助理提问</label>
            <div>
              <textarea
                id="research-question"
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                maxLength={600}
                placeholder="例如：这张卡的成交证据够不够？"
              />
              <button type="submit" disabled={busy}>
                {busy ? (
                  <LoaderCircle className={styles.spin} size={17} />
                ) : (
                  <Send size={17} />
                )}
                发送
              </button>
            </div>
          </form>
          <p className={styles.notice}>{notice}</p>
          <section className={styles.documents} aria-label="私有 PDF 审核导入">
            <div className={styles.documentHeading}>
              <div>
                <FileText size={16} />
                <b>PDF 审核导入</b>
              </div>
              <label>
                <span>{documentBusy === "upload" ? "上传中" : "上传 PDF"}</span>
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  disabled={Boolean(documentBusy)}
                  onChange={(event) => void uploadDocument(event.target.files?.[0])}
                />
              </label>
            </div>
            <p>仅存入当前登录用户的私有空间。提取结果永远是待审核草稿，文档里的文字不能调用工具、修改权限或自动新增收藏。</p>
            {documents.length > 0 && (
              <div className={styles.documentList}>
                {documents.map((document) => (
                  <article key={document.id}>
                    <div>
                      <strong>{document.source_filename}</strong>
                      <small>{Math.ceil(document.byte_size / 1024)} KB · {document.status === "uploaded" ? "待提取" : document.status === "ready_for_review" ? "待审核" : "已确认"}</small>
                    </div>
                    {document.status === "uploaded" && (
                      <button type="button" disabled={Boolean(documentBusy)} onClick={() => void extractDocument(document.id)}>提取草稿</button>
                    )}
                    {document.status === "ready_for_review" && (
                      <button type="button" disabled={Boolean(documentBusy)} onClick={() => void approveDocument(document.id)}>确认审核</button>
                    )}
                    {document.extracted_fields?.summary && (
                      <p>{document.extracted_fields.summary}</p>
                    )}
                    {document.extracted_fields?.warnings?.map((warning) => <small className={styles.warning} key={warning}>{warning}</small>)}
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
      <footer>
        <ArrowUpRight size={14} />
        研究结果不是投资建议；演示数据不会被包装成真实成交或预测概率。
      </footer>
    </section>
  );
}
