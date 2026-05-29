import { pgTable, timestamp, uuid, varchar, text } from "drizzle-orm/pg-core"
import { email } from "zod";

export const usersTable = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    fullName: varchar("full_name", { length: 100 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    // Nullable: OAuth-only accounts have no password.
    passwordHash: text("password_hash"),

    // OAuth / identity. googleId = Google `sub` claim (stable per-user id).
    googleId: varchar("google_id", { length: 255 }).unique(),
    avatarUrl: text("avatar_url"),
    emailVerified: timestamp("email_verified"),
    authProvider: varchar("auth_provider", { length: 20 }).default("email").notNull(),

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date())
})