import { pgTable, serial, text, real, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { productsTable } from "./products";

export const offersTable = pgTable("offers", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  titleAr: text("title_ar"),
  description: text("description"),
  descriptionAr: text("description_ar"),
  productId: integer("product_id").references(() => productsTable.id),
  discountPercent: real("discount_percent"),
  offerPrice: real("offer_price"),
  originalPrice: real("original_price"),
  imageUrl: text("image_url"),
  stockLimit: integer("stock_limit"),
  stockRemaining: integer("stock_remaining"),
  expiresAt: timestamp("expires_at"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertOfferSchema = createInsertSchema(offersTable).omit({ id: true, createdAt: true });
export const updateOfferSchema = insertOfferSchema.partial();
export type InsertOffer = z.infer<typeof insertOfferSchema>;
export type Offer = typeof offersTable.$inferSelect;
