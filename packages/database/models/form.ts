import { pgTable, uuid, timestamp, varchar, text, pgEnum, jsonb } from "drizzle-orm/pg-core";
import { usersTable } from "./user";

export const formStatusEnum = pgEnum("form_status_enum", ["DRAFT", "PUBLISHED"]);

export const formsTable = pgTable("forms", {
    id: uuid("id").primaryKey().defaultRandom(),
    title: varchar("title", { length: 50 }).notNull(),
    description: varchar("description", { length: 300 }),
    status: formStatusEnum("status").default("DRAFT").notNull(),
    slug: varchar("slug", { length: 80 }).unique(),
    welcomeTitle: varchar("welcome_title", { length: 120 }),
    welcomeDescription: text("welcome_description"),
    endingTitle: varchar("ending_title", { length: 120 }),
    endingDescription: text("ending_description"),
    hiddenFields: jsonb("hidden_fields").$type<string[]>(),
    createdBy: uuid("created_by").references(() => usersTable.id),

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
