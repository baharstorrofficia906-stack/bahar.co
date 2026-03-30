import { pgTable, integer, primaryKey } from "drizzle-orm/pg-core";
import { offersTable } from "./offers";
import { productsTable } from "./products";

export const offerProductsTable = pgTable(
  "offer_products",
  {
    offerId: integer("offer_id").notNull().references(() => offersTable.id, { onDelete: "cascade" }),
    productId: integer("product_id").notNull().references(() => productsTable.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.offerId, t.productId] })]
);
