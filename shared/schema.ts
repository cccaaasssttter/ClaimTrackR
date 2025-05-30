import { pgTable, text, serial, integer, boolean, timestamp, decimal, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  role: text("role").notNull().default("subcontractor"), // subcontractor, admin
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  totalValue: decimal("total_value", { precision: 12, scale: 2 }).notNull(),
  gstRate: decimal("gst_rate", { precision: 5, scale: 2 }).notNull().default("10.00"),
  retentionRate: decimal("retention_rate", { precision: 5, scale: 2 }).notNull().default("5.00"),
  status: text("status").notNull().default("active"), // active, completed, on_hold
  createdBy: uuid("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const claims = pgTable("claims", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").notNull().references(() => projects.id),
  number: text("number").notNull(),
  status: text("status").notNull().default("draft"), // draft, pending, approved, rejected
  percentComplete: decimal("percent_complete", { precision: 5, scale: 2 }).notNull(),
  previousClaim: decimal("previous_claim", { precision: 12, scale: 2 }).notNull().default("0.00"),
  thisClaim: decimal("this_claim", { precision: 12, scale: 2 }).notNull(),
  totalExGst: decimal("total_ex_gst", { precision: 12, scale: 2 }).notNull(),
  gst: decimal("gst", { precision: 12, scale: 2 }).notNull(),
  totalIncGst: decimal("total_inc_gst", { precision: 12, scale: 2 }).notNull(),
  retentionHeld: decimal("retention_held", { precision: 12, scale: 2 }).notNull(),
  amountDue: decimal("amount_due", { precision: 12, scale: 2 }).notNull(),
  description: text("description"),
  periodFrom: timestamp("period_from"),
  periodTo: timestamp("period_to"),
  createdBy: uuid("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const variations = pgTable("variations", {
  id: uuid("id").primaryKey().defaultRandom(),
  claimId: uuid("claim_id").notNull().references(() => claims.id),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const attachments = pgTable("attachments", {
  id: uuid("id").primaryKey().defaultRandom(),
  claimId: uuid("claim_id").notNull().references(() => claims.id),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  fileSize: integer("file_size").notNull(),
  uploadedBy: uuid("uploaded_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
});

export const insertClaimSchema = createInsertSchema(claims).omit({
  id: true,
  createdAt: true,
});

export const insertVariationSchema = createInsertSchema(variations).omit({
  id: true,
  createdAt: true,
});

export const insertAttachmentSchema = createInsertSchema(attachments).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Claim = typeof claims.$inferSelect;
export type InsertClaim = z.infer<typeof insertClaimSchema>;
export type Variation = typeof variations.$inferSelect;
export type InsertVariation = z.infer<typeof insertVariationSchema>;
export type Attachment = typeof attachments.$inferSelect;
export type InsertAttachment = z.infer<typeof insertAttachmentSchema>;
