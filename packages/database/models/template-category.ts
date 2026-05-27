import { pgTable, uuid, timestamp, varchar, numeric } from "drizzle-orm/pg-core";

export const templateCategoriesTable = pgTable("template_categories", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 80 }).notNull().unique(),
    slug: varchar("slug", { length: 80 }).notNull().unique(),
    description: varchar("description", { length: 300 }),
    icon: varchar("icon", { length: 50 }),
    index: numeric("index").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
});
