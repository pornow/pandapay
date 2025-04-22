import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Donations schema
export const donations = pgTable("donations", {
  id: serial("id").primaryKey(),
  amount: integer("amount").notNull(), // Amount in kopecks (1 ruble = 100 kopecks)
  name: text("name"),
  message: text("message"),
  paymentId: text("payment_id").notNull().unique(),
  date: timestamp("date").notNull().defaultNow(),
  source: text("source").notNull(), // "website" or "telegram"
  status: text("status").notNull(), // "pending", "completed", "failed"
  paymentMethod: text("payment_method").notNull(), // "yoomoney" or "crypto"
  cryptoAddress: text("crypto_address"), // Only for crypto payments
});

export const insertDonationSchema = createInsertSchema(donations).omit({
  id: true,
  date: true,
});

export const donationAmountSchema = z.object({
  amount: z.number().min(10).max(100000),
  paymentMethod: z.enum(["yoomoney", "crypto"]).default("yoomoney"),
});

export const donationInfoSchema = z.object({
  name: z.string().optional(),
  message: z.string().optional(),
});

export type InsertDonation = z.infer<typeof insertDonationSchema>;
export type Donation = typeof donations.$inferSelect;

// Daily Statistics schema to aggregate data
export const dailyStats = pgTable("daily_stats", {
  id: serial("id").primaryKey(),
  date: timestamp("date").notNull(),
  totalAmount: integer("total_amount").notNull().default(0),
  count: integer("count").notNull().default(0),
});

export const insertDailyStatsSchema = createInsertSchema(dailyStats).omit({
  id: true,
});

export type InsertDailyStats = z.infer<typeof insertDailyStatsSchema>;
export type DailyStats = typeof dailyStats.$inferSelect;
