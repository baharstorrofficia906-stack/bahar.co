import { Router, type IRouter } from "express";
import { db, customersTable, ordersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { syncToGitHubBackground } from "../lib/githubSync";
const router: IRouter = Router();

router.get("/customers", async (req, res) => {
  try {
    const customers = await db.select().from(customersTable).orderBy(customersTable.createdAt);

    const enriched = await Promise.all(
      customers.map(async (c) => {
        const orders = await db
          .select()
          .from(ordersTable)
          .where(eq(ordersTable.customerPhone, c.phone));

        return {
          ...c,
          totalOrders: orders.length,
          totalSpent: orders.reduce((sum, o) => sum + (o.totalPrice ?? 0), 0),
        };
      })
    );

    res.json(enriched.reverse());
  } catch (err) {
    req.log.error({ err }, "Failed to get customers");
    res.status(500).json({ error: "Failed to get customers" });
  }
});

router.put("/customers/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, phone, email, address } = req.body;
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (email !== undefined) updateData.email = email;
    if (address !== undefined) updateData.address = address;

    const [customer] = await db
      .update(customersTable)
      .set(updateData)
      .where(eq(customersTable.id, id))
      .returning();

    if (!customer) return res.status(404).json({ error: "Customer not found" });
    res.json(customer);
    syncToGitHubBackground("customer-updated");
  } catch (err) {
    req.log.error({ err }, "Failed to update customer");
    res.status(500).json({ error: "Failed to update customer" });
  }
});

router.delete("/customers/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(customersTable).where(eq(customersTable.id, id));
    res.json({ success: true, message: "Customer deleted" });
    syncToGitHubBackground("customer-deleted");
  } catch (err) {
    req.log.error({ err }, "Failed to delete customer");
    res.status(500).json({ error: "Failed to delete customer" });
  }
});

export default router;
