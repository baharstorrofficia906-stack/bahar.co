import { Router, type IRouter } from "express";
import { db, ordersTable, customersTable, insertOrderSchema, updateOrderSchema } from "@workspace/db";
import { eq } from "drizzle-orm";
import { syncToGitHubBackground } from "../lib/githubSync";

const router: IRouter = Router();

router.get("/orders", async (req, res) => {
  try {
    const orders = await db.select().from(ordersTable).orderBy(ordersTable.createdAt);
    res.json(orders.reverse());
  } catch (err) {
    req.log.error({ err }, "Failed to get orders");
    res.status(500).json({ error: "Failed to get orders" });
  }
});

router.get("/orders/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, id));
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (err) {
    req.log.error({ err }, "Failed to get order");
    res.status(500).json({ error: "Failed to get order" });
  }
});

router.post("/orders", async (req, res) => {
  try {
    const parsed = insertOrderSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid order data", details: parsed.error });
    }

    const [order] = await db.insert(ordersTable).values(parsed.data).returning();

    // Upsert customer record
    try {
      const existing = await db
        .select()
        .from(customersTable)
        .where(eq(customersTable.phone, parsed.data.customerPhone));

      if (existing.length === 0) {
        await db.insert(customersTable).values({
          name: parsed.data.customerName,
          phone: parsed.data.customerPhone,
          email: parsed.data.customerEmail ?? null,
          address: parsed.data.customerAddress,
        });
      }
    } catch (custErr) {
      // Non-fatal: customer upsert failure
      req.log.warn({ custErr }, "Failed to upsert customer");
    }

    res.status(201).json(order);
    syncToGitHubBackground("order-created");
  } catch (err) {
    req.log.error({ err }, "Failed to create order");
    res.status(500).json({ error: "Failed to create order" });
  }
});

router.put("/orders/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const parsed = updateOrderSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid order update", details: parsed.error });
    }
    const [order] = await db
      .update(ordersTable)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(ordersTable.id, id))
      .returning();
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
    syncToGitHubBackground("order-updated");
  } catch (err) {
    req.log.error({ err }, "Failed to update order");
    res.status(500).json({ error: "Failed to update order" });
  }
});

export default router;
