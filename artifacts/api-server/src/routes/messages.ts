import { Router } from "express";
import { db } from "@workspace/db";
import { messages } from "@workspace/db/schema";
import { desc, eq } from "drizzle-orm";
import { syncToGitHubBackground } from "../lib/githubSync";

const router = Router();

router.get("/messages", async (_req, res) => {
  try {
    const rows = await db.select().from(messages).orderBy(desc(messages.createdAt));
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

router.post("/messages", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: "name, email and message are required" });
    }
    const [created] = await db.insert(messages).values({ name, email, subject, message }).returning();
    res.status(201).json(created);
    syncToGitHubBackground("message-received");
  } catch (err) {
    res.status(500).json({ error: "Failed to save message" });
  }
});

router.patch("/messages/:id/read", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [updated] = await db.update(messages).set({ read: true }).where(eq(messages.id, id)).returning();
    if (!updated) return res.status(404).json({ error: "Message not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update message" });
  }
});

export default router;
