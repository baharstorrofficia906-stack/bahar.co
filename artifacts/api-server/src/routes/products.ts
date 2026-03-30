import { Router, type IRouter } from "express";
import { db, productsTable, insertProductSchema, updateProductSchema } from "@workspace/db";
import { eq } from "drizzle-orm";
import { syncToGitHubBackground } from "../lib/githubSync";

const router: IRouter = Router();

router.get("/products", async (req, res) => {
  try {
    const { category, featured } = req.query;
    const products = await db.select().from(productsTable);

    let filtered = products;
    if (category) {
      filtered = filtered.filter(p => p.category === category);
    }
    if (featured === "true") {
      filtered = filtered.filter(p => p.featured === true);
    }

    res.json(filtered);
  } catch (err) {
    req.log.error({ err }, "Failed to get products");
    res.status(500).json({ error: "Failed to get products" });
  }
});

router.get("/products/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [product] = await db.select().from(productsTable).where(eq(productsTable.id, id));
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    req.log.error({ err }, "Failed to get product");
    res.status(500).json({ error: "Failed to get product" });
  }
});

router.post("/products", async (req, res) => {
  try {
    const parsed = insertProductSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid product data", details: parsed.error });
    }
    const [product] = await db.insert(productsTable).values(parsed.data).returning();
    res.status(201).json(product);
    syncToGitHubBackground("product-created");
  } catch (err) {
    req.log.error({ err }, "Failed to create product");
    res.status(500).json({ error: "Failed to create product" });
  }
});

router.put("/products/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const parsed = updateProductSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid product data", details: parsed.error });
    }
    const [product] = await db
      .update(productsTable)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(productsTable.id, id))
      .returning();
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
    syncToGitHubBackground("product-updated");
  } catch (err) {
    req.log.error({ err }, "Failed to update product");
    res.status(500).json({ error: "Failed to update product" });
  }
});

router.delete("/products/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(productsTable).where(eq(productsTable.id, id));
    res.json({ success: true, message: "Product deleted" });
    syncToGitHubBackground("product-deleted");
  } catch (err) {
    req.log.error({ err }, "Failed to delete product");
    res.status(500).json({ error: "Failed to delete product" });
  }
});

export default router;
