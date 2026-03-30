import { db, productsTable } from "@workspace/db";

const GITHUB_RAW = "https://raw.githubusercontent.com";

async function fetchJSON(url: string): Promise<any> {
  const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
  if (!res.ok) return null;
  return res.json();
}

export async function seedFromGitHubIfEmpty() {
  const repo = process.env.GITHUB_REPO;
  if (!repo) {
    console.log("[seed] GITHUB_REPO not set — skipping seed");
    return;
  }

  // Check if products table already has data
  const existing = await db.select({ id: productsTable.id }).from(productsTable).limit(1);
  if (existing.length > 0) {
    console.log("[seed] Database already has products — skipping seed");
    return;
  }

  console.log(`[seed] Empty database detected — pulling data from GitHub (${repo})...`);

  const branch = "main";
  const baseUrl = `${GITHUB_RAW}/${repo}/${branch}/data`;

  // Seed products
  const products = await fetchJSON(`${baseUrl}/products.json`);
  if (Array.isArray(products) && products.length > 0) {
    const toInsert = products.map(({ id, createdAt, updatedAt, ...rest }: any) => rest);
    await db.insert(productsTable).values(toInsert);
    console.log(`[seed] Seeded ${toInsert.length} products from GitHub`);
  } else {
    console.log("[seed] No products found in GitHub backup — nothing to seed");
  }
}
