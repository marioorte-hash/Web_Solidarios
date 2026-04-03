import { db } from "./db";
import {
  contactMessages, news, activities, users, products, productImages,
  productReviews, promoCodes, cartItems, orders, orderItems,
  sponsorships, activityRegistrations, internalMessages, sponsorshipFormFields,
  type InsertContactMessage, type InsertNewsItem, type InsertActivity,
  type InsertUser, type InsertProduct, type InsertProductImage,
  type InsertProductReview, type InsertPromoCode, type InsertCartItem,
  type InsertOrder, type InsertOrderItem, type InsertSponsorship,
  type InsertActivityRegistration, type InsertInternalMessage,
  type InsertSponsorshipFormField,
  type NewsItem, type Activity, type User, type Product, type ProductImage,
  type ProductReview, type PromoCode, type CartItem, type Order, type OrderItem,
  type Sponsorship, type ActivityRegistration, type InternalMessage,
  type SponsorshipFormField,
} from "@shared/schema";
import { eq, desc, ilike, or, and } from "drizzle-orm";
import bcrypt from "bcrypt";

// ── Admin Types ──────────────────────────────────────────────────────────────

export interface AdminOrderItem {
  productId: number;
  productTitle: string;
  quantity: number;
  price: string;
}

export interface AdminOrder {
  id: number;
  createdAt: Date | null;
  status: string;
  total: string;
  userEmail: string | null;
  username: string | null;
  isStudent: boolean;
  studentClass: string | null;
  pickupDate: string | null;
  pickupTime: string | null;
  userConsent: boolean;
  items: AdminOrderItem[];
}

export interface AdminSponsorship extends Sponsorship {
  userEmail: string | null;
  username: string | null;
}

export interface AdminActivityRegistration extends ActivityRegistration {
  userEmail: string | null;
  username: string | null;
  activityTitle: string;
  activityDate: Date;
  activityLocation: string;
}

export interface AdminMessage extends InternalMessage {
  userEmail: string | null;
  username: string | null;
}

// ── Storage Interface ────────────────────────────────────────────────────────

export interface IStorage {
  // Auth
  createUser(user: InsertUser): Promise<Omit<User, "password">>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserById(id: number): Promise<Omit<User, "password"> | undefined>;
  validatePassword(plain: string, hashed: string): Promise<boolean>;

  // Contact Messages
  createContactMessage(msg: InsertContactMessage): Promise<void>;

  // News
  getAllNews(): Promise<NewsItem[]>;
  getNewsBySlug(slug: string): Promise<NewsItem | undefined>;
  createNews(item: InsertNewsItem): Promise<NewsItem>;
  updateNews(id: number, item: Partial<InsertNewsItem>): Promise<NewsItem | undefined>;
  deleteNews(id: number): Promise<void>;

  // Activities
  getAllActivities(): Promise<Activity[]>;
  getActivityById(id: number): Promise<Activity | undefined>;
  createActivity(item: InsertActivity): Promise<Activity>;
  updateActivity(id: number, item: Partial<InsertActivity>): Promise<Activity | undefined>;
  deleteActivity(id: number): Promise<void>;

  // Products
  getAllProducts(activeOnly?: boolean): Promise<Product[]>;
  getProductById(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<void>;
  getProductImages(productId: number): Promise<ProductImage[]>;
  addProductImage(image: InsertProductImage): Promise<ProductImage>;
  deleteProductImage(id: number): Promise<void>;

  // Reviews
  getProductReviews(productId: number): Promise<ProductReview[]>;
  createReview(review: InsertProductReview): Promise<ProductReview>;

  // Promo Codes
  getPromoCodes(): Promise<PromoCode[]>;
  getPromoCode(code: string): Promise<PromoCode | undefined>;
  createPromoCode(promo: InsertPromoCode): Promise<PromoCode>;
  updatePromoCode(id: number, promo: Partial<InsertPromoCode>): Promise<PromoCode | undefined>;
  deletePromoCode(id: number): Promise<void>;

  // Cart
  getCartItems(sessionId: string): Promise<(CartItem & { product: Product })[]>;
  addToCart(item: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, quantity: number): Promise<CartItem | undefined>;
  removeFromCart(id: number): Promise<void>;
  clearCart(sessionId: string): Promise<void>;

  // Orders
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order>;
  getOrdersByUser(userId: number): Promise<Order[]>;
  getAdminOrders(): Promise<AdminOrder[]>;
  updateOrderStatus(id: number, status: string): Promise<void>;

  // Sponsorship Form Fields
  getSponsorshipFormFields(): Promise<SponsorshipFormField[]>;
  createSponsorshipFormField(field: InsertSponsorshipFormField): Promise<SponsorshipFormField>;
  updateSponsorshipFormField(id: number, field: Partial<InsertSponsorshipFormField>): Promise<SponsorshipFormField | undefined>;
  deleteSponsorshipFormField(id: number): Promise<void>;

  // Sponsorships
  getSponsorshipsByUser(userId: number): Promise<Sponsorship[]>;
  createSponsorship(item: InsertSponsorship): Promise<Sponsorship>;
  updateSponsorship(id: number, item: Partial<InsertSponsorship>): Promise<Sponsorship | undefined>;
  deleteSponsorship(id: number): Promise<void>;
  getAdminSponsorships(): Promise<AdminSponsorship[]>;

  // Activity Registrations
  getActivityRegistrationsByUser(userId: number): Promise<(ActivityRegistration & { activity: Activity })[]>;
  createActivityRegistration(item: InsertActivityRegistration): Promise<ActivityRegistration>;
  deleteActivityRegistration(id: number): Promise<void>;
  isUserRegisteredForActivity(userId: number, activityId: number): Promise<boolean>;
  getAdminActivityRegistrations(): Promise<AdminActivityRegistration[]>;

  // Internal Messages
  getMessagesByUser(userId: number): Promise<InternalMessage[]>;
  createMessage(item: InsertInternalMessage): Promise<InternalMessage>;
  adminReplyToMessage(id: number, reply: string): Promise<void>;
  markMessageRead(id: number): Promise<void>;
  getAllMessages(): Promise<AdminMessage[]>;

  // User Management (Admin)
  getAllUsers(): Promise<Omit<User, "password">[]>;
  changeUserPassword(id: number, newPassword: string): Promise<void>;
  deleteUser(id: number): Promise<void>;
  createAdminUser(user: InsertUser, role: "admin" | "user"): Promise<Omit<User, "password">>;

  // Search
  search(query: string): Promise<{ products: Product[]; news: NewsItem[]; activities: Activity[] }>;
}

// ── Implementation ───────────────────────────────────────────────────────────

export class DatabaseStorage implements IStorage {
  // Auth
  async createUser(user: InsertUser): Promise<Omit<User, "password">> {
    const hashed = await bcrypt.hash(user.password, 10);
    const [created] = await db.insert(users).values({ ...user, password: hashed }).returning();
    const { password, ...safe } = created;
    return safe;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserById(id: number): Promise<Omit<User, "password"> | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    if (!user) return undefined;
    const { password, ...safe } = user;
    return safe;
  }

  async validatePassword(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
  }

  // Contact Messages
  async createContactMessage(msg: InsertContactMessage): Promise<void> {
    await db.insert(contactMessages).values(msg);
  }

  // News
  async getAllNews(): Promise<NewsItem[]> {
    return db.select().from(news).orderBy(desc(news.publishedAt));
  }

  async getNewsBySlug(slug: string): Promise<NewsItem | undefined> {
    const [item] = await db.select().from(news).where(eq(news.slug, slug));
    return item;
  }

  async createNews(item: InsertNewsItem): Promise<NewsItem> {
    const [created] = await db.insert(news).values(item).returning();
    return created;
  }

  async updateNews(id: number, item: Partial<InsertNewsItem>): Promise<NewsItem | undefined> {
    const [updated] = await db.update(news).set(item).where(eq(news.id, id)).returning();
    return updated;
  }

  async deleteNews(id: number): Promise<void> {
    await db.delete(news).where(eq(news.id, id));
  }

  // Activities
  async getAllActivities(): Promise<Activity[]> {
    return db.select().from(activities).orderBy(desc(activities.date));
  }

  async getActivityById(id: number): Promise<Activity | undefined> {
    const [item] = await db.select().from(activities).where(eq(activities.id, id));
    return item;
  }

  async createActivity(item: InsertActivity): Promise<Activity> {
    const [created] = await db.insert(activities).values(item).returning();
    return created;
  }

  async updateActivity(id: number, item: Partial<InsertActivity>): Promise<Activity | undefined> {
    const [updated] = await db.update(activities).set(item).where(eq(activities.id, id)).returning();
    return updated;
  }

  async deleteActivity(id: number): Promise<void> {
    await db.delete(activities).where(eq(activities.id, id));
  }

  // Products
  async getAllProducts(activeOnly = false): Promise<Product[]> {
    if (activeOnly) return db.select().from(products).where(eq(products.isActive, true));
    return db.select().from(products);
  }

  async getProductById(id: number): Promise<Product | undefined> {
    const [p] = await db.select().from(products).where(eq(products.id, id));
    return p;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [created] = await db.insert(products).values(product).returning();
    return created;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const [updated] = await db.update(products).set(product).where(eq(products.id, id)).returning();
    return updated;
  }

  async deleteProduct(id: number): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  async getProductImages(productId: number): Promise<ProductImage[]> {
    return db.select().from(productImages).where(eq(productImages.productId, productId));
  }

  async addProductImage(image: InsertProductImage): Promise<ProductImage> {
    const [created] = await db.insert(productImages).values(image).returning();
    return created;
  }

  async deleteProductImage(id: number): Promise<void> {
    await db.delete(productImages).where(eq(productImages.id, id));
  }

  // Reviews
  async getProductReviews(productId: number): Promise<ProductReview[]> {
    return db.select().from(productReviews).where(eq(productReviews.productId, productId)).orderBy(desc(productReviews.createdAt));
  }

  async createReview(review: InsertProductReview): Promise<ProductReview> {
    const [created] = await db.insert(productReviews).values(review).returning();
    return created;
  }

  // Promo Codes
  async getPromoCodes(): Promise<PromoCode[]> {
    return db.select().from(promoCodes).orderBy(desc(promoCodes.createdAt));
  }

  async getPromoCode(code: string): Promise<PromoCode | undefined> {
    const [promo] = await db.select().from(promoCodes).where(eq(promoCodes.code, code));
    return promo;
  }

  async createPromoCode(promo: InsertPromoCode): Promise<PromoCode> {
    const [created] = await db.insert(promoCodes).values(promo).returning();
    return created;
  }

  async updatePromoCode(id: number, promo: Partial<InsertPromoCode>): Promise<PromoCode | undefined> {
    const [updated] = await db.update(promoCodes).set(promo).where(eq(promoCodes.id, id)).returning();
    return updated;
  }

  async deletePromoCode(id: number): Promise<void> {
    await db.delete(promoCodes).where(eq(promoCodes.id, id));
  }

  // Cart
  async getCartItems(sessionId: string): Promise<(CartItem & { product: Product })[]> {
    const items = await db.select().from(cartItems).where(eq(cartItems.sessionId, sessionId));
    const result = [];
    for (const item of items) {
      const [product] = await db.select().from(products).where(eq(products.id, item.productId));
      if (product) result.push({ ...item, product });
    }
    return result;
  }

  async addToCart(item: InsertCartItem): Promise<CartItem> {
    const [existing] = await db
      .select()
      .from(cartItems)
      .where(and(eq(cartItems.sessionId, item.sessionId), eq(cartItems.productId, item.productId)));
    if (existing) {
      const [updated] = await db
        .update(cartItems)
        .set({ quantity: existing.quantity + (item.quantity ?? 1) })
        .where(eq(cartItems.id, existing.id))
        .returning();
      return updated;
    }
    const [created] = await db.insert(cartItems).values(item).returning();
    return created;
  }

  async updateCartItem(id: number, quantity: number): Promise<CartItem | undefined> {
    if (quantity <= 0) {
      await db.delete(cartItems).where(eq(cartItems.id, id));
      return undefined;
    }
    const [updated] = await db.update(cartItems).set({ quantity }).where(eq(cartItems.id, id)).returning();
    return updated;
  }

  async removeFromCart(id: number): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.id, id));
  }

  async clearCart(sessionId: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.sessionId, sessionId));
  }

  // Orders
  async createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    const [createdOrder] = await db.insert(orders).values(order).returning();
    if (items.length > 0) {
      await db.insert(orderItems).values(items.map(i => ({ ...i, orderId: createdOrder.id })));
    }
    return createdOrder;
  }

  async getOrdersByUser(userId: number): Promise<Order[]> {
    return db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
  }

  async getAdminOrders(): Promise<AdminOrder[]> {
    const allOrders = await db
      .select({
        id: orders.id,
        createdAt: orders.createdAt,
        status: orders.status,
        total: orders.total,
        isStudent: orders.isStudent,
        studentClass: orders.studentClass,
        pickupDate: orders.pickupDate,
        pickupTime: orders.pickupTime,
        userConsent: orders.userConsent,
        userEmail: users.email,
        username: users.username,
      })
      .from(orders)
      .leftJoin(users, eq(orders.userId, users.id))
      .orderBy(desc(orders.createdAt));

    const result: AdminOrder[] = [];
    for (const order of allOrders) {
      const items = await db
        .select({
          productId: orderItems.productId,
          productTitle: products.title,
          quantity: orderItems.quantity,
          price: orderItems.price,
        })
        .from(orderItems)
        .innerJoin(products, eq(orderItems.productId, products.id))
        .where(eq(orderItems.orderId, order.id));

      result.push({ ...order, total: String(order.total), items });
    }
    return result;
  }

  async updateOrderStatus(id: number, status: string): Promise<void> {
    await db.update(orders).set({ status: status as "pending" | "paid" | "shipped" | "delivered" | "cancelled" }).where(eq(orders.id, id));
  }

  // Sponsorship Form Fields
  async getSponsorshipFormFields(): Promise<SponsorshipFormField[]> {
    return db.select().from(sponsorshipFormFields).orderBy(sponsorshipFormFields.sortOrder);
  }
  async createSponsorshipFormField(field: InsertSponsorshipFormField): Promise<SponsorshipFormField> {
    const [created] = await db.insert(sponsorshipFormFields).values(field).returning();
    return created;
  }
  async updateSponsorshipFormField(id: number, field: Partial<InsertSponsorshipFormField>): Promise<SponsorshipFormField | undefined> {
    const [updated] = await db.update(sponsorshipFormFields).set(field).where(eq(sponsorshipFormFields.id, id)).returning();
    return updated;
  }
  async deleteSponsorshipFormField(id: number): Promise<void> {
    await db.delete(sponsorshipFormFields).where(eq(sponsorshipFormFields.id, id));
  }

  // Sponsorships
  async getSponsorshipsByUser(userId: number): Promise<Sponsorship[]> {
    return db.select().from(sponsorships).where(eq(sponsorships.userId, userId)).orderBy(desc(sponsorships.createdAt));
  }

  async createSponsorship(item: InsertSponsorship): Promise<Sponsorship> {
    const [created] = await db.insert(sponsorships).values(item).returning();
    return created;
  }

  async updateSponsorship(id: number, item: Partial<InsertSponsorship>): Promise<Sponsorship | undefined> {
    const [updated] = await db.update(sponsorships).set(item).where(eq(sponsorships.id, id)).returning();
    return updated;
  }

  async deleteSponsorship(id: number): Promise<void> {
    await db.delete(sponsorships).where(eq(sponsorships.id, id));
  }

  async getAdminSponsorships(): Promise<AdminSponsorship[]> {
    return db
      .select({
        id: sponsorships.id,
        userId: sponsorships.userId,
        childName: sponsorships.childName,
        childAge: sponsorships.childAge,
        country: sponsorships.country,
        school: sponsorships.school,
        monthlyAmount: sponsorships.monthlyAmount,
        startDate: sponsorships.startDate,
        notes: sponsorships.notes,
        customResponses: sponsorships.customResponses,
        createdAt: sponsorships.createdAt,
        userEmail: users.email,
        username: users.username,
      })
      .from(sponsorships)
      .leftJoin(users, eq(sponsorships.userId, users.id))
      .orderBy(desc(sponsorships.createdAt));
  }

  // Activity Registrations
  async getActivityRegistrationsByUser(userId: number): Promise<(ActivityRegistration & { activity: Activity })[]> {
    const regs = await db.select().from(activityRegistrations).where(eq(activityRegistrations.userId, userId));
    const result = [];
    for (const reg of regs) {
      const [activity] = await db.select().from(activities).where(eq(activities.id, reg.activityId));
      if (activity) result.push({ ...reg, activity });
    }
    return result;
  }

  async createActivityRegistration(item: InsertActivityRegistration): Promise<ActivityRegistration> {
    const [created] = await db.insert(activityRegistrations).values(item).returning();
    return created;
  }

  async deleteActivityRegistration(id: number): Promise<void> {
    await db.delete(activityRegistrations).where(eq(activityRegistrations.id, id));
  }

  async isUserRegisteredForActivity(userId: number, activityId: number): Promise<boolean> {
    const [reg] = await db
      .select()
      .from(activityRegistrations)
      .where(and(eq(activityRegistrations.userId, userId), eq(activityRegistrations.activityId, activityId)));
    return !!reg;
  }

  async getAdminActivityRegistrations(): Promise<AdminActivityRegistration[]> {
    return db
      .select({
        id: activityRegistrations.id,
        userId: activityRegistrations.userId,
        activityId: activityRegistrations.activityId,
        notes: activityRegistrations.notes,
        registeredAt: activityRegistrations.registeredAt,
        userEmail: users.email,
        username: users.username,
        activityTitle: activities.title,
        activityDate: activities.date,
        activityLocation: activities.location,
      })
      .from(activityRegistrations)
      .leftJoin(users, eq(activityRegistrations.userId, users.id))
      .innerJoin(activities, eq(activityRegistrations.activityId, activities.id))
      .orderBy(desc(activityRegistrations.registeredAt));
  }

  // Internal Messages
  async getMessagesByUser(userId: number): Promise<InternalMessage[]> {
    return db.select().from(internalMessages).where(eq(internalMessages.userId, userId)).orderBy(desc(internalMessages.createdAt));
  }

  async createMessage(item: InsertInternalMessage): Promise<InternalMessage> {
    const [created] = await db.insert(internalMessages).values(item).returning();
    return created;
  }

  async adminReplyToMessage(id: number, reply: string): Promise<void> {
    await db.update(internalMessages).set({ adminReply: reply, repliedAt: new Date(), isRead: true }).where(eq(internalMessages.id, id));
  }

  async markMessageRead(id: number): Promise<void> {
    await db.update(internalMessages).set({ isRead: true }).where(eq(internalMessages.id, id));
  }

  async getAllMessages(): Promise<AdminMessage[]> {
    return db
      .select({
        id: internalMessages.id,
        userId: internalMessages.userId,
        subject: internalMessages.subject,
        body: internalMessages.body,
        attachmentUrl: internalMessages.attachmentUrl,
        attachmentName: internalMessages.attachmentName,
        isRead: internalMessages.isRead,
        adminReply: internalMessages.adminReply,
        repliedAt: internalMessages.repliedAt,
        createdAt: internalMessages.createdAt,
        userEmail: users.email,
        username: users.username,
      })
      .from(internalMessages)
      .leftJoin(users, eq(internalMessages.userId, users.id))
      .orderBy(desc(internalMessages.createdAt));
  }

  // User Management (Admin)
  async getAllUsers(): Promise<Omit<User, "password">[]> {
    const rows = await db.select().from(users).orderBy(users.createdAt);
    return rows.map(({ password, ...u }) => u);
  }

  async changeUserPassword(id: number, newPassword: string): Promise<void> {
    const hashed = await bcrypt.hash(newPassword, 10);
    await db.update(users).set({ password: hashed }).where(eq(users.id, id));
  }

  async deleteUser(id: number): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async createAdminUser(user: InsertUser, role: "admin" | "user"): Promise<Omit<User, "password">> {
    const hashed = await bcrypt.hash(user.password, 10);
    const [created] = await db.insert(users).values({ ...user, password: hashed, role }).returning();
    const { password, ...safe } = created;
    return safe;
  }

  // Search
  async search(query: string): Promise<{ products: Product[]; news: NewsItem[]; activities: Activity[] }> {
    const q = `%${query}%`;
    const [searchProducts, searchNews, searchActivities] = await Promise.all([
      db.select().from(products).where(and(eq(products.isActive, true), or(ilike(products.title, q), ilike(products.description, q), ilike(products.category, q)))).limit(10),
      db.select().from(news).where(or(ilike(news.title, q), ilike(news.summary, q), ilike(news.content, q))).limit(10),
      db.select().from(activities).where(or(ilike(activities.title, q), ilike(activities.description, q))).limit(10),
    ]);
    return { products: searchProducts, news: searchNews, activities: searchActivities };
  }
}

export const storage = new DatabaseStorage();
