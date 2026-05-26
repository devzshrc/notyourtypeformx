import { pgTable, uuid, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { formsTable } from "./form";

export const formEventTypeEnum = pgEnum("form_event_type_enum", ["VIEW", "START"]);

export const formEventsTable = pgTable("form_events", {
    id: uuid("id").primaryKey().defaultRandom(),
    formId: uuid("form_id")
        .references(() => formsTable.id)
        .notNull(),
    type: formEventTypeEnum("type").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
});
