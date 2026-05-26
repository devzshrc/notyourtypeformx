import { pgTable, uuid, timestamp, jsonb } from "drizzle-orm/pg-core";
import { formsTable } from "./form";

export const submissionsTable = pgTable("submissions", {
    id: uuid("id").primaryKey().defaultRandom(),
    formId: uuid("form_id")
        .references(() => formsTable.id)
        .notNull(),
    data: jsonb("data").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
});
