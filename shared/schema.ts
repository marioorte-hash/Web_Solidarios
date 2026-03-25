import { pgTable, text, serial, timestamp, boolean, integer, numeric, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userRoleEnum = pgEnum("user_role", ["admin", "user"]);
export const orderStatusEnum = pgEnum("order_status", ["pending", "paid", "shipped", "delivered", "cancelled"]);

// Users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: userRoleEnum("role").notNull().default("user"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, role: true });
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

// Contact Messages
export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertContactMessageSchema = createInsertSchema(contactMessages).omit({
  id: true,
  createdAt: true,
});
export type ContactMessage = typeof contactMessages.$inferSelect;
export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;

// News
export const news = pgTable("news", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  summary: text("summary").notNull(),
  content: text("content").notNull(),
  imageUrl: text("image_url").notNull(),
  publishedAt: timestamp("published_at").defaultNow(),
});

export const insertNewsSchema = createInsertSchema(news).omit({ id: true, publishedAt: true });
export type NewsItem = typeof news.$inferSelect;
export type InsertNewsItem = z.infer<typeof insertNewsSchema>;

// Activities / Events
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  date: timestamp("date").notNull(),
  location: text("location").notNull(),
  imageUrl: text("image_url").notNull(),
});

export const insertActivitySchema = createInsertSchema(activities).omit({ id: true });
export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

// Products
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  category: text("category").notNull(),
  stock: integer("stock").notNull().default(0),
  imageUrl: text("image_url").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertProductSchema = createInsertSchema(products).omit({ id: true, createdAt: true });
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

// Product Images (multiple images per product)
export const productImages = pgTable("product_images", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  imageUrl: text("image_url").notNull(),
});

export const insertProductImageSchema = createInsertSchema(productImages).omit({ id: true });
export type ProductImage = typeof productImages.$inferSelect;
export type InsertProductImage = z.infer<typeof insertProductImageSchema>;

// Product Reviews
export const productReviews = pgTable("product_reviews", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertProductReviewSchema = createInsertSchema(productReviews).omit({ id: true, createdAt: true });
export type ProductReview = typeof productReviews.$inferSelect;
export type InsertProductReview = z.infer<typeof insertProductReviewSchema>;

// Promo Codes
export const promoCodes = pgTable("promo_codes", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  discount: integer("discount").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPromoCodeSchema = createInsertSchema(promoCodes).omit({ id: true, createdAt: true });
export type PromoCode = typeof promoCodes.$inferSelect;
export type InsertPromoCode = z.infer<typeof insertPromoCodeSchema>;

// Cart Items
export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  productId: integer("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull().default(1),
});

export const insertCartItemSchema = createInsertSchema(cartItems).omit({ id: true });
export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;

// Orders
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  sessionId: text("session_id"),
  total: numeric("total", { precision: 10, scale: 2 }).notNull(),
  promoCodeId: integer("promo_code_id").references(() => promoCodes.id),
  status: orderStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true });
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

// Order Items
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  productId: integer("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({ id: true });
export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
