import { pgTable, serial, text, real, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameAr: text("name_ar"),
  description: text("description"),
  descriptionAr: text("description_ar"),
  price: real("price").notNull(),
  originalPrice: real("original_price"),
  imageUrl: text("image_url"),
  images: jsonb("images").$type<string[]>().default([]),
  category: text("category"),
  stock: integer("stock").notNull().default(0),
  featured: boolean("featured").notNull().default(false),
  origin: text("origin").default("Saudi Arabia"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertProductSchema = createInsertSchema(productsTable).omit({ id: true, createdAt: true, updatedAt: true });
export const updateProductSchema = insertProductSchema.partial();
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof productsTable.$inferSelect;
