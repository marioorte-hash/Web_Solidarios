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

// Contact Messages (legacy simple contact form)
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

// Internal Messages (chat system)
export const internalMessages = pgTable("internal_messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  recipientId: integer("recipient_id").references(() => users.id, { onDelete: "set null" }),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  attachmentUrl: text("attachment_url"),
  attachmentName: text("attachment_name"),
  isRead: boolean("is_read").notNull().default(false),
  adminReply: text("admin_reply"),
  repliedAt: timestamp("replied_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertInternalMessageSchema = createInsertSchema(internalMessages).omit({
  id: true, createdAt: true, isRead: true, adminReply: true, repliedAt: true,
});
export type InternalMessage = typeof internalMessages.$inferSelect;
export type InsertInternalMessage = z.infer<typeof insertInternalMessageSchema>;

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
  titleEn: text("title_en"),
  titleDe: text("title_de"),
  description: text("description").notNull(),
  descriptionEn: text("description_en"),
  descriptionDe: text("description_de"),
  date: timestamp("date").notNull(),
  location: text("location").notNull(),
  imageUrl: text("image_url").notNull(),
});

export const insertActivitySchema = createInsertSchema(activities).omit({ id: true });
export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

// Activity Registrations
export const activityRegistrations = pgTable("activity_registrations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  activityId: integer("activity_id").notNull().references(() => activities.id, { onDelete: "cascade" }),
  notes: text("notes"),
  registeredAt: timestamp("registered_at").defaultNow(),
});

export const insertActivityRegistrationSchema = createInsertSchema(activityRegistrations).omit({
  id: true, registeredAt: true,
});
export type ActivityRegistration = typeof activityRegistrations.$inferSelect;
export type InsertActivityRegistration = z.infer<typeof insertActivityRegistrationSchema>;

// Sponsorship Form Fields (custom dynamic fields for apadrinamiento form)
export const sponsorshipFormFields = pgTable("sponsorship_form_fields", {
  id: serial("id").primaryKey(),
  label: text("label").notNull(),
  fieldType: text("field_type").notNull().default("short_answer"), // "short_answer" | "multiple_choice"
  options: text("options").array(), // only for multiple_choice
  required: boolean("required").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSponsorshipFormFieldSchema = createInsertSchema(sponsorshipFormFields).omit({ id: true, createdAt: true });
export type SponsorshipFormField = typeof sponsorshipFormFields.$inferSelect;
export type InsertSponsorshipFormField = z.infer<typeof insertSponsorshipFormFieldSchema>;

// Sponsorships (Apadrinamiento)
export const sponsorships = pgTable("sponsorships", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  childName: text("child_name").notNull(),
  childAge: integer("child_age"),
  country: text("country").notNull(),
  school: text("school"),
  monthlyAmount: numeric("monthly_amount", { precision: 10, scale: 2 }),
  startDate: text("start_date"),
  notes: text("notes"),
  customResponses: text("custom_responses"), // JSON string: { fieldId: response }
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSponsorshipSchema = createInsertSchema(sponsorships).omit({
  id: true, createdAt: true,
});
export type Sponsorship = typeof sponsorships.$inferSelect;
export type InsertSponsorship = z.infer<typeof insertSponsorshipSchema>;

// Sponsored Children (admin-managed)
export const sponsoredChildren = pgTable("sponsored_children", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  age: text("age"),
  country: text("country").notNull(),
  school: text("school"),
  photoUrl: text("photo_url"),
  monthlyAmount: numeric("monthly_amount", { precision: 10, scale: 2 }),
  coverageDetails: text("coverage_details"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});
export const insertSponsoredChildSchema = createInsertSchema(sponsoredChildren).omit({ id: true, createdAt: true });
export type SponsoredChild = typeof sponsoredChildren.$inferSelect;
export type InsertSponsoredChild = z.infer<typeof insertSponsoredChildSchema>;

// Child Assignments (which socio has which child)
export const childAssignments = pgTable("child_assignments", {
  id: serial("id").primaryKey(),
  childId: integer("child_id").notNull().references(() => sponsoredChildren.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  assignedAt: timestamp("assigned_at").defaultNow(),
});
export const insertChildAssignmentSchema = createInsertSchema(childAssignments).omit({ id: true, assignedAt: true });
export type ChildAssignment = typeof childAssignments.$inferSelect;
export type InsertChildAssignment = z.infer<typeof insertChildAssignmentSchema>;

// Benefits (admin-created benefit cards)
export const benefits = pgTable("benefits", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});
export const insertBenefitSchema = createInsertSchema(benefits).omit({ id: true, createdAt: true });
export type Benefit = typeof benefits.$inferSelect;
export type InsertBenefit = z.infer<typeof insertBenefitSchema>;

// Benefit Assignments (which socios receive which benefit)
export const benefitAssignments = pgTable("benefit_assignments", {
  id: serial("id").primaryKey(),
  benefitId: integer("benefit_id").notNull().references(() => benefits.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  assignedAt: timestamp("assigned_at").defaultNow(),
});
export const insertBenefitAssignmentSchema = createInsertSchema(benefitAssignments).omit({ id: true, assignedAt: true });
export type BenefitAssignment = typeof benefitAssignments.$inferSelect;
export type InsertBenefitAssignment = z.infer<typeof insertBenefitAssignmentSchema>;

// Products
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  titleEn: text("title_en"),
  titleDe: text("title_de"),
  description: text("description").notNull(),
  descriptionEn: text("description_en"),
  descriptionDe: text("description_de"),
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
  isStudent: boolean("is_student").notNull().default(false),
  studentClass: text("student_class"),
  pickupDate: text("pickup_date"),
  pickupTime: text("pickup_time"),
  userConsent: boolean("user_consent").notNull().default(false),
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
