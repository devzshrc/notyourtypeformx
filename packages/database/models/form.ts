import { pgTable, uuid, timestamp, varchar, text, pgEnum, jsonb, integer, boolean } from "drizzle-orm/pg-core";
import { usersTable } from "./user";
import { workspacesTable } from "./workspace";
import { templateCategoriesTable } from "./template-category";

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
    notifyEmail: varchar("notify_email", { length: 200 }),
    webhookUrl: varchar("webhook_url", { length: 500 }),
    closedMessage: text("closed_message"),
    isArchived: boolean("is_archived").default(false).notNull(),
    createdBy: uuid("created_by").references(() => usersTable.id),
    workspaceId: uuid("workspace_id").references(() => workspacesTable.id),
    categoryId: uuid("category_id").references(() => templateCategoriesTable.id),
    isSystemTemplate: boolean("is_system_template").default(false).notNull(),
    templateCloneCount: integer("template_clone_count").default(0).notNull(),
    embedSettings: jsonb("embed_settings").$type<{ allowIframe?: boolean; hideHeader?: boolean; autoResize?: boolean; maxWidth?: string }>(),

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
