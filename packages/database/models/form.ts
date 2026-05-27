import { pgTable, uuid, timestamp, varchar, text, pgEnum, jsonb, integer, boolean } from "drizzle-orm/pg-core";
import { usersTable } from "./user";

export const formStatusEnum = pgEnum("form_status_enum", ["DRAFT", "PUBLISHED"]);
export const formVisibilityEnum = pgEnum("form_visibility_enum", ["PUBLIC", "UNLISTED"]);

export const formsTable = pgTable("forms", {
    id: uuid("id").primaryKey().defaultRandom(),
    title: varchar("title", { length: 50 }).notNull(),
    description: varchar("description", { length: 300 }),
    status: formStatusEnum("status").default("DRAFT").notNull(),
    visibility: formVisibilityEnum("visibility").default("UNLISTED").notNull(),
    isTemplate: boolean("is_template").default(false).notNull(),
    slug: varchar("slug", { length: 80 }).unique(),
    welcomeTitle: varchar("welcome_title", { length: 120 }),
    welcomeDescription: text("welcome_description"),
    endingTitle: varchar("ending_title", { length: 120 }),
    endingDescription: text("ending_description"),
    hiddenFields: jsonb("hidden_fields").$type<string[]>(),
    expiresAt: timestamp("expires_at"),
    maxResponses: integer("max_responses"),
    password: varchar("password", { length: 100 }),
    theme: varchar("theme", { length: 50 }).default("bold-tech").notNull(),
    redirectUrl: varchar("redirect_url", { length: 500 }),
    isArchived: boolean("is_archived").default(false).notNull(),
    createdBy: uuid("created_by").references(() => usersTable.id),

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
