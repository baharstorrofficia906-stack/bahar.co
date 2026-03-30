import { pgTable, serial, text, real, timestamp, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const orderStatusEnum = pgEnum("order_status", ["pending", "processing", "shipped", "delivered", "canceled"]);

export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  customerAddress: text("customer_address").notNull(),
  customerEmail: text("customer_email"),
  items: jsonb("items").notNull().$type<Array<{
    productId: number;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>>(),
  totalPrice: real("total_price").notNull(),
  status: orderStatusEnum("status").notNull().default("pending"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertOrderSchema = createInsertSchema(ordersTable).omit({ id: true, createdAt: true, updatedAt: true });
export const updateOrderSchema = z.object({
  status: z.enum(["pending", "processing", "shipped", "delivered", "canceled"]).optional(),
  notes: z.string().optional(),
});
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof ordersTable.$inferSelect;
