import { pgTable, uuid, varchar, numeric, timestamp } from "drizzle-orm/pg-core";
import { formsFieldsTable } from "./form-field";

export const formFieldOptionsTable = pgTable("form_field_options", {
    id: uuid("id").primaryKey().defaultRandom(),
    fieldId: uuid("field_id")
        .references(() => formsFieldsTable.id)
        .notNull(),
    label: varchar("label", { length: 200 }).notNull(),
    index: numeric("index").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
});
