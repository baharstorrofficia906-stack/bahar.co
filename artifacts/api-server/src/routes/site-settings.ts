import { Router, type IRouter } from "express";
import { db, siteSettingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

async function getSetting(key: string): Promise<string | null> {
  const [row] = await db.select().from(siteSettingsTable).where(eq(siteSettingsTable.key, key));
  return row?.value ?? null;
}

async function setSetting(key: string, value: string): Promise<void> {
  await db
    .insert(siteSettingsTable)
    .values({ key, value })
    .onConflictDoUpdate({ target: siteSettingsTable.key, set: { value } });
}

router.get("/admin/site-status", async (req, res) => {
  try {
    const isOpen = (await getSetting("isOpen")) ?? "true";
    const closedMessage = (await getSetting("closedMessage")) ?? "We'll be back soon. Thank you for your patience.";
    const reopensAt = await getSetting("reopensAt");

    res.json({
      isOpen: isOpen === "true",
      closedMessage,
      reopensAt: reopensAt || null,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get site status");
    res.status(500).json({ error: "Failed to get site status" });
  }
});

router.put("/admin/site-status", async (req, res) => {
  try {
    const { isOpen, closedMessage, reopensAt } = req.body;

    if (isOpen !== undefined) await setSetting("isOpen", String(isOpen));
    if (closedMessage !== undefined) await setSetting("closedMessage", closedMessage);
    await setSetting("reopensAt", reopensAt || "");

    const updatedIsOpen = (await getSetting("isOpen")) ?? "true";
    const updatedMessage = (await getSetting("closedMessage")) ?? "";
    const updatedReopensAt = await getSetting("reopensAt");

    res.json({
      isOpen: updatedIsOpen === "true",
      closedMessage: updatedMessage,
      reopensAt: updatedReopensAt || null,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to update site status");
    res.status(500).json({ error: "Failed to update site status" });
  }
});

export default router;
