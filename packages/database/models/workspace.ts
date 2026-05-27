import { pgTable, uuid, timestamp, varchar, pgEnum, unique } from "drizzle-orm/pg-core";
import { usersTable } from "./user";

export const workspaceRoleEnum = pgEnum("workspace_role_enum", ["OWNER", "ADMIN", "EDITOR", "VIEWER"]);
export const invitationStatusEnum = pgEnum("invitation_status_enum", ["PENDING", "ACCEPTED", "EXPIRED"]);

export const workspacesTable = pgTable("workspaces", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 100 }).notNull(),
    slug: varchar("slug", { length: 80 }).unique().notNull(),
    ownerId: uuid("owner_id").references(() => usersTable.id).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export const workspaceMembersTable = pgTable("workspace_members", {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id").references(() => workspacesTable.id).notNull(),
    userId: uuid("user_id").references(() => usersTable.id).notNull(),
    role: workspaceRoleEnum("role").notNull(),
    invitedAt: timestamp("invited_at").defaultNow(),
    joinedAt: timestamp("joined_at"),
}, (t) => [unique().on(t.workspaceId, t.userId)]);

export const workspaceInvitationsTable = pgTable("workspace_invitations", {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id").references(() => workspacesTable.id).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    role: workspaceRoleEnum("role").notNull(),
    status: invitationStatusEnum("status").default("PENDING").notNull(),
    invitedBy: uuid("invited_by").references(() => usersTable.id).notNull(),
    token: varchar("token", { length: 64 }).unique().notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
});
