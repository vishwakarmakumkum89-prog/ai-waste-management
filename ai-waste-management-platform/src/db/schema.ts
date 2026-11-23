import {
  doublePrecision,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";

/** Upcycling / product ideas that can be created from a waste category. */
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  category: text("category").notNull(), // waste category slug
  summary: text("summary").notNull(),
  difficulty: text("difficulty").notNull(), // Easy | Workshop | Industrial
  hours: doublePrecision("hours").notNull(),
  valueUsd: doublePrecision("value_usd").notNull(), // typical resale value per unit
  kgPerUnit: doublePrecision("kg_per_unit").notNull(),
  steps: jsonb("steps").$type<string[]>().notNull(),
  tools: jsonb("tools").$type<string[]>().notNull(),
  image: text("image").notNull(),
});

/** NGOs, recyclers and social enterprises in the circular network. */
export const organizations = pgTable("organizations", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  type: text("type").notNull(), // NGO | Recycler | Social Enterprise | Municipal
  city: text("city").notNull(),
  country: text("country").notNull(),
  accepts: jsonb("accepts").$type<string[]>().notNull(),
  description: text("description").notNull(),
  services: jsonb("services").$type<string[]>().notNull(),
  tonnesPerYear: integer("tonnes_per_year").notNull(),
  verified: boolean("verified").notNull().default(true),
  email: text("email").notNull(),
  image: text("image").notNull(),
});

/** Every classification run through the platform. */
export const scans = pgTable("scans", {
  id: serial("id").primaryKey(),
  predictedCategory: text("predicted_category").notNull(),
  confidence: doublePrecision("confidence").notNull(),
  correctedCategory: text("corrected_category"),
  scores: jsonb("scores").$type<Record<string, number>>().notNull(),
  features: jsonb("features").$type<Record<string, number>>(),
  description: text("description"),
  weightKg: doublePrecision("weight_kg").notNull().default(1),
  city: text("city"),
  co2SavedKg: doublePrecision("co2_saved_kg").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/** Requests from users to connect with an organisation (or join the network). */
export const connectionRequests = pgTable("connection_requests", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id"),
  scanId: integer("scan_id"),
  name: text("name").notNull(),
  email: text("email").notNull(),
  category: text("category"),
  quantityKg: doublePrecision("quantity_kg"),
  message: text("message"),
  kind: text("kind").notNull().default("pickup"), // pickup | partner
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Product = typeof products.$inferSelect;
export type Organization = typeof organizations.$inferSelect;
export type Scan = typeof scans.$inferSelect;
