import { db, productsTable, customersTable, ordersTable, messagesTable } from "@workspace/db";
import { desc } from "drizzle-orm";

const GITHUB_API = "https://api.github.com";

function getConfig() {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  if (!token || !repo) return null;
  return { token, repo };
}

async function getFileSha(token: string, repo: string, path: string): Promise<string | null> {
  const res = await fetch(`${GITHUB_API}/repos/${repo}/contents/${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  if (!res.ok) return null;
  const data = await res.json() as { sha: string };
  return data.sha ?? null;
}

async function commitFile(token: string, repo: string, path: string, content: string, message: string) {
  const sha = await getFileSha(token, repo, path);
  const body: Record<string, unknown> = {
    message,
    content: Buffer.from(content, "utf-8").toString("base64"),
  };
  if (sha) body.sha = sha;

  const res = await fetch(`${GITHUB_API}/repos/${repo}/contents/${path}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GitHub commit failed for ${path}: ${res.status} ${err}`);
  }
}

export async function syncToGitHub(triggeredBy = "data-change") {
  const config = getConfig();
  if (!config) return;

  const { token, repo } = config;

  const [products, customers, orders, messages] = await Promise.all([
    db.select().from(productsTable).orderBy(desc(productsTable.createdAt)),
    db.select().from(customersTable).orderBy(desc(customersTable.createdAt)),
    db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt)),
    db.select().from(messagesTable).orderBy(desc(messagesTable.createdAt)),
  ]);

  const timestamp = new Date().toISOString();
  const summary = {
    lastSync: timestamp,
    triggeredBy,
    counts: {
      products: products.length,
      customers: customers.length,
      orders: orders.length,
      messages: messages.length,
    },
  };

  const files = [
    { path: "data/products.json", data: products, label: "products" },
    { path: "data/customers.json", data: customers, label: "customers" },
    { path: "data/orders.json", data: orders, label: "orders" },
    { path: "data/messages.json", data: messages, label: "messages" },
    { path: "data/summary.json", data: summary, label: "summary" },
  ];

  await Promise.all(
    files.map(({ path, data, label }) =>
      commitFile(
        token,
        repo,
        path,
        JSON.stringify(data, null, 2),
        `sync: update ${label} — ${timestamp}`
      )
    )
  );
}

export function syncToGitHubBackground(triggeredBy?: string) {
  syncToGitHub(triggeredBy).catch((err) => {
    console.error("[githubSync] Background sync failed:", err?.message ?? err);
  });
}
