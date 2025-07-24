import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// MCP servers table
export const mcps = pgTable("mcps", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description").notNull(),
  longDescription: text("long_description"),
  maintainer: varchar("maintainer", { length: 255 }).notNull(),
  maintainerAvatar: varchar("maintainer_avatar", { length: 500 }),
  version: varchar("version", { length: 50 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  tags: text("tags").array().notNull().default([]),
  rating: integer("rating").notNull().default(0),
  deploymentCount: integer("deployment_count").notNull().default(0),
  icon: varchar("icon", { length: 500 }),
  iconColor: varchar("icon_color", { length: 7 }).default("#3B82F6"),
  featured: boolean("featured").default(false),
  documentation: text("documentation"),
  screenshots: text("screenshots").array().default([]),
  envVars: jsonb("env_vars").default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User deployments table
export const deployments = pgTable("deployments", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  mcpId: integer("mcp_id").notNull().references(() => mcps.id),
  name: varchar("name", { length: 255 }).notNull(),
  url: varchar("url", { length: 500 }).notNull().unique(),
  status: varchar("status", { length: 50 }).notNull().default("running"), // running, stopped, error, deploying
  envVars: jsonb("env_vars").default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  deployments: many(deployments),
}));

export const mcpsRelations = relations(mcps, ({ many }) => ({
  deployments: many(deployments),
}));

export const deploymentsRelations = relations(deployments, ({ one }) => ({
  user: one(users, {
    fields: [deployments.userId],
    references: [users.id],
  }),
  mcp: one(mcps, {
    fields: [deployments.mcpId],
    references: [mcps.id],
  }),
}));

// Zod schemas
export const insertMcpSchema = createInsertSchema(mcps).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDeploymentSchema = createInsertSchema(deployments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertMcp = z.infer<typeof insertMcpSchema>;
export type Mcp = typeof mcps.$inferSelect;
export type InsertDeployment = z.infer<typeof insertDeploymentSchema>;
export type Deployment = typeof deployments.$inferSelect;
export type DeploymentWithMcp = Deployment & { mcp: Mcp };
