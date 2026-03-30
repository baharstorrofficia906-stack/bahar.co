import { Router, type IRouter } from "express";
import { db, offersTable, productsTable, offerProductsTable, insertOfferSchema, updateOfferSchema } from "@workspace/db";
import { eq, inArray } from "drizzle-orm";

const router: IRouter = Router();

async function getOffersWithProducts() {
  const offers = await db
    .select({
      id: offersTable.id,
      title: offersTable.title,
      titleAr: offersTable.titleAr,
      description: offersTable.description,
      descriptionAr: offersTable.descriptionAr,
      productId: offersTable.productId,
      discountPercent: offersTable.discountPercent,
      offerPrice: offersTable.offerPrice,
      originalPrice: offersTable.originalPrice,
      imageUrl: offersTable.imageUrl,
      stockLimit: offersTable.stockLimit,
      stockRemaining: offersTable.stockRemaining,
      expiresAt: offersTable.expiresAt,
      active: offersTable.active,
      createdAt: offersTable.createdAt,
    })
    .from(offersTable);

  // For each offer, fetch its linked products from offer_products
  const offerIds = offers.map((o) => o.id);
  let linkedRows: { offerId: number; productId: number }[] = [];
  if (offerIds.length > 0) {
    linkedRows = await db
      .select({ offerId: offerProductsTable.offerId, productId: offerProductsTable.productId })
      .from(offerProductsTable)
      .where(inArray(offerProductsTable.offerId, offerIds));
  }

  // Fetch all referenced products
  const allProductIds = [...new Set(linkedRows.map((r) => r.productId))];
  let productsMap: Record<number, any> = {};
  if (allProductIds.length > 0) {
    const prods = await db.select().from(productsTable).where(inArray(productsTable.id, allProductIds));
    for (const p of prods) productsMap[p.id] = p;
  }

  // Build a map of offerId → productIds
  const offerProductsMap: Record<number, number[]> = {};
  for (const row of linkedRows) {
    if (!offerProductsMap[row.offerId]) offerProductsMap[row.offerId] = [];
    offerProductsMap[row.offerId].push(row.productId);
  }

  return offers.map((offer) => {
    const productIds = offerProductsMap[offer.id] ?? [];
    const products = productIds.map((pid) => productsMap[pid]).filter(Boolean);
    // also keep legacy product field for backward compat
    const product = products[0] ?? null;
    return { ...offer, products, productIds, product };
  });
}

router.get("/offers", async (req, res) => {
  try {
    const offers = await getOffersWithProducts();
    res.json(offers);
  } catch (err) {
    req.log.error({ err }, "Failed to get offers");
    res.status(500).json({ error: "Failed to get offers" });
  }
});

router.post("/offers", async (req, res) => {
  try {
    const { productIds, ...rest } = req.body;
    const parsed = insertOfferSchema.safeParse(rest);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid offer data", details: parsed.error });
    }
    const [offer] = await db.insert(offersTable).values(parsed.data).returning();

    // Insert offer_products rows
    if (Array.isArray(productIds) && productIds.length > 0) {
      await db.insert(offerProductsTable).values(
        productIds.map((pid: number) => ({ offerId: offer.id, productId: pid }))
      );
    }

    const [enriched] = await getOffersWithProducts();
    const result = (await getOffersWithProducts()).find((o) => o.id === offer.id) ?? offer;
    res.status(201).json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to create offer");
    res.status(500).json({ error: "Failed to create offer" });
  }
});

router.put("/offers/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { productIds, ...rest } = req.body;
    const parsed = updateOfferSchema.safeParse(rest);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid offer data", details: parsed.error });
    }
    const [offer] = await db
      .update(offersTable)
      .set(parsed.data)
      .where(eq(offersTable.id, id))
      .returning();
    if (!offer) return res.status(404).json({ error: "Offer not found" });

    // Replace offer_products
    if (Array.isArray(productIds)) {
      await db.delete(offerProductsTable).where(eq(offerProductsTable.offerId, id));
      if (productIds.length > 0) {
        await db.insert(offerProductsTable).values(
          productIds.map((pid: number) => ({ offerId: id, productId: pid }))
        );
      }
    }

    const result = (await getOffersWithProducts()).find((o) => o.id === id) ?? offer;
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to update offer");
    res.status(500).json({ error: "Failed to update offer" });
  }
});

router.delete("/offers/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    // offer_products rows are cascade-deleted by FK
    await db.delete(offersTable).where(eq(offersTable.id, id));
    res.json({ success: true, message: "Offer deleted" });
  } catch (err) {
    req.log.error({ err }, "Failed to delete offer");
    res.status(500).json({ error: "Failed to delete offer" });
  }
});

export default router;
