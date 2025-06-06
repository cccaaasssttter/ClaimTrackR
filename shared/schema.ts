import { pgTable, text, serial, integer, boolean, timestamp, decimal, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  role: text("role").notNull().default("subcontractor"), // subcontractor, admin
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userSettings = pgTable("user_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id),
  
  // Company Details (used as Subcontractor/Payee on claims)
  companyName: text("company_name"),
  contactPerson: text("contact_person"),
  companyAddress: text("company_address"),
  email: text("email"),
  mobile: text("mobile"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  clientName: text("client_name"),
  contactPerson: text("contact_person"),
  subcontractReference: text("subcontract_reference"),
  
  // Contractor Details (Payer)
  contractorName: text("contractor_name"),
  contractorContactPerson: text("contractor_contact_person"),
  contractorPhone: text("contractor_phone"),
  contractorEmail: text("contractor_email"),
  contractorAddress: text("contractor_address"),
  
  // Project Details
  siteAddress: text("site_address"),
  
  description: text("description"),
  totalValue: decimal("total_value", { precision: 12, scale: 2 }).notNull(),
  gstRate: decimal("gst_rate", { precision: 5, scale: 2 }).notNull().default("10.00"),
  
  // Retention Collection Settings
  retentionRate: decimal("retention_rate", { precision: 5, scale: 2 }).notNull().default("5.00"), // % of project value to hold
  retentionPerClaim: decimal("retention_per_claim", { precision: 5, scale: 2 }).notNull().default("5.00"), // % to deduct per claim
  retentionCollectionUntil: decimal("retention_collection_until", { precision: 5, scale: 2 }).default("50.00"), // Stop collecting at % completion
  
  // Retention Release Settings
  firstReleaseEvent: text("first_release_event").notNull().default("practical_completion"), // practical_completion, final_completion
  firstReleasePercentage: decimal("first_release_percentage", { precision: 5, scale: 2 }).notNull().default("50.00"), // % of retention to release first
  dlpPeriodMonths: integer("dlp_period_months").notNull().default(12), // Defects liability period in months
  finalReleasePercentage: decimal("final_release_percentage", { precision: 5, scale: 2 }).notNull().default("50.00"), // % remaining after DLP
  
  status: text("status").notNull().default("active"), // active, completed, on_hold
  createdBy: uuid("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const claims = pgTable("claims", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").notNull().references(() => projects.id),
  number: text("number").notNull(),
  status: text("status").notNull().default("draft"), // draft, pending, approved, rejected
  monthEnding: timestamp("month_ending"),
  contactPerson: text("contact_person"),
  subcontractReference: text("subcontract_reference"),
  totalWorksCompleted: decimal("total_works_completed", { precision: 12, scale: 2 }).notNull().default("0.00"),
  paymentReceived: decimal("payment_received", { precision: 12, scale: 2 }).notNull().default("0.00"),
  deductions: decimal("deductions", { precision: 12, scale: 2 }).notNull().default("0.00"),
  subTotal: decimal("sub_total", { precision: 12, scale: 2 }).notNull().default("0.00"),
  gst: decimal("gst", { precision: 12, scale: 2 }).notNull().default("0.00"),
  totalIncGst: decimal("total_inc_gst", { precision: 12, scale: 2 }).notNull().default("0.00"),
  description: text("description"),
  // Missing fields causing TypeScript errors
  percentComplete: decimal("percent_complete", { precision: 5, scale: 2 }).notNull().default("0.00"),
  previousClaim: decimal("previous_claim", { precision: 12, scale: 2 }).notNull().default("0.00"),
  thisClaim: decimal("this_claim", { precision: 12, scale: 2 }).notNull().default("0.00"),
  retentionHeld: decimal("retention_held", { precision: 12, scale: 2 }).notNull().default("0.00"),
  amountDue: decimal("amount_due", { precision: 12, scale: 2 }).notNull().default("0.00"),
  periodFrom: timestamp("period_from"),
  periodTo: timestamp("period_to"),
  createdBy: uuid("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const claimItems = pgTable("claim_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  claimId: uuid("claim_id").notNull().references(() => claims.id),
  description: text("description").notNull(),
  contractValue: decimal("contract_value", { precision: 12, scale: 2 }).notNull(),
  percentComplete: decimal("percent_complete", { precision: 5, scale: 2 }).notNull().default("0.00"),
  claimToDate: decimal("claim_to_date", { precision: 12, scale: 2 }).notNull().default("0.00"),
  previousClaim: decimal("previous_claim", { precision: 12, scale: 2 }).notNull().default("0.00"),
  thisClaim: decimal("this_claim", { precision: 12, scale: 2 }).notNull().default("0.00"),
  leftToClaim: decimal("left_to_claim", { precision: 12, scale: 2 }).notNull().default("0.00"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const variations = pgTable("variations", {
  id: uuid("id").primaryKey().defaultRandom(),
  claimId: uuid("claim_id").notNull().references(() => claims.id),
  description: text("description").notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull().default("0.00"),
  rate: decimal("rate", { precision: 12, scale: 2 }).notNull().default("0.00"),
  variationValue: decimal("variation_value", { precision: 12, scale: 2 }).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull().default("0.00"),
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull().default("0.00"),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const credits = pgTable("credits", {
  id: uuid("id").primaryKey().defaultRandom(),
  claimId: uuid("claim_id").notNull().references(() => claims.id),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
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

export const insertUserSettingsSchema = createInsertSchema(userSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
});

export const insertClaimSchema = createInsertSchema(claims).omit({
  id: true,
  createdAt: true,
});

export const insertClaimItemSchema = createInsertSchema(claimItems).omit({
  id: true,
  createdAt: true,
});

export const insertVariationSchema = createInsertSchema(variations).omit({
  id: true,
  createdAt: true,
});

export const insertCreditSchema = createInsertSchema(credits).omit({
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
export type UserSettings = typeof userSettings.$inferSelect;
export type InsertUserSettings = z.infer<typeof insertUserSettingsSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Claim = typeof claims.$inferSelect;
export type InsertClaim = z.infer<typeof insertClaimSchema>;
export type ClaimItem = typeof claimItems.$inferSelect;
export type InsertClaimItem = z.infer<typeof insertClaimItemSchema>;
export type Variation = typeof variations.$inferSelect;
export type InsertVariation = z.infer<typeof insertVariationSchema>;
export type Credit = typeof credits.$inferSelect;
export type InsertCredit = z.infer<typeof insertCreditSchema>;
export type Attachment = typeof attachments.$inferSelect;
export type InsertAttachment = z.infer<typeof insertAttachmentSchema>;
