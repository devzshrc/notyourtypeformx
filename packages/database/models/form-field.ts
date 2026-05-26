import {
    pgTable,
    uuid,
    timestamp,
    varchar,
    pgEnum,
    text,
    boolean,
    numeric,
} from "drizzle-orm/pg-core";
import { usersTable } from "./user";
import { formsTable } from "./form";
import { z } from "zod";

export const fieldTypeEnum = pgEnum("field_type_enum", [
    "TEXT",
    "EMAIL",
    "NUMBER",
    "YES_NO",
    "PASSWORD",
]);

export const formsFieldsTable = pgTable("forms_fields", {
    id: uuid("id").primaryKey().defaultRandom(),
    formId: uuid("form_id").references(() => formsTable.id),
    label: varchar("label", { length: 100 }).notNull(),
    labelKey: varchar("label_key", { length: 100 }).notNull(),
    description: text("description"),
    placeholder: text("placeholder"),
    isRequired: boolean("is_required").default(false).notNull(),
    index: numeric("index").notNull(),
    type: fieldTypeEnum("type").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
