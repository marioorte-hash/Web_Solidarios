import { db } from "./db";
import {
  contactMessages, news, activities, users, products, productImages,
  productReviews, promoCodes, cartItems, orders, orderItems,
  type InsertContactMessage, type InsertNewsItem, type InsertActivity,
  type InsertUser, type InsertProduct, type InsertProductImage,
  type InsertProductReview, type InsertPromoCode, type InsertCartItem,
  type InsertOrder, type InsertOrderItem,
  type NewsItem, type Activity, type User, type Product, type ProductImage,
  type ProductReview, type PromoCode, type CartItem, type Order, type OrderItem,
} from "@shared/schema";
import { eq, desc, ilike, or, and } from "drizzle-orm";
import bcrypt from "bcrypt";

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

export interface IStorage {
  // Auth
  createUser(user: InsertUser): Promise<Omit<User, "password">>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserById(id: number): Promise<Omit<User, "password"> | undefined>;
  validatePassword(plain: string, hashed: string): Promise<boolean>;

  // Contact
  createContactMessage(message: InsertContactMessage): Promise<void>;

  // News
  getNews(): Promise<NewsItem[]>;
  getNewsItem(id: number): Promise<NewsItem | undefined>;
  getNewsItemBySlug(slug: string): Promise<NewsItem | undefined>;
  createNews(item: InsertNewsItem): Promise<NewsItem>;
  updateNews(id: number, item: Partial<InsertNewsItem>): Promise<NewsItem | undefined>;
  deleteNews(id: number): Promise<void>;

  // Activities
  getActivities(): Promise<Activity[]>;
  getActivity(id: number): Promise<Activity | undefined>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  updateActivity(id: number, activity: Partial<InsertActivity>): Promise<Activity | undefined>;
  deleteActivity(id: number): Promise<void>;

  // Products
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<void>;
  addProductImage(image: InsertProductImage): Promise<ProductImage>;
  getProductImages(productId: number): Promise<ProductImage[]>;
  deleteProductImage(id: number): Promise<void>;

  // Reviews
  getProductReviews(productId: number): Promise<(ProductReview & { username: string })[]>;
  createProductReview(review: InsertProductReview): Promise<ProductReview>;
  getUserReviewForProduct(userId: number, productId: number): Promise<ProductReview | undefined>;

  // Promo Codes
  getPromoCodes(): Promise<PromoCode[]>;
  getPromoCode(code: string): Promise<PromoCode | undefined>;
  createPromoCode(promo: InsertPromoCode): Promise<PromoCode>;
  updatePromoCode(id: number, data: Partial<InsertPromoCode>): Promise<PromoCode | undefined>;
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

  // Search
  search(query: string): Promise<{ products: Product[]; news: NewsItem[]; activities: Activity[] }>;
}

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

  // Contact
  async createContactMessage(message: InsertContactMessage): Promise<void> {
    await db.insert(contactMessages).values(message);
  }

  // News
  async getNews(): Promise<NewsItem[]> {
    return db.select().from(news).orderBy(desc(news.publishedAt));
  }

  async getNewsItem(id: number): Promise<NewsItem | undefined> {
    const [item] = await db.select().from(news).where(eq(news.id, id));
    return item;
  }

  async getNewsItemBySlug(slug: string): Promise<NewsItem | undefined> {
    const [item] = await db.select().from(news).where(eq(news.slug, slug));
    return item;
  }

  async createNews(item: InsertNewsItem): Promise<NewsItem> {
    const [newItem] = await db.insert(news).values(item).returning();
    return newItem;
  }

  async updateNews(id: number, item: Partial<InsertNewsItem>): Promise<NewsItem | undefined> {
    const [updated] = await db.update(news).set(item).where(eq(news.id, id)).returning();
    return updated;
  }

  async deleteNews(id: number): Promise<void> {
    await db.delete(news).where(eq(news.id, id));
  }

  // Activities
  async getActivities(): Promise<Activity[]> {
    return db.select().from(activities).orderBy(desc(activities.date));
  }

  async getActivity(id: number): Promise<Activity | undefined> {
    const [item] = await db.select().from(activities).where(eq(activities.id, id));
    return item;
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const [newActivity] = await db.insert(activities).values(activity).returning();
    return newActivity;
  }

  async updateActivity(id: number, activity: Partial<InsertActivity>): Promise<Activity | undefined> {
    const [updated] = await db.update(activities).set(activity).where(eq(activities.id, id)).returning();
    return updated;
  }

  async deleteActivity(id: number): Promise<void> {
    await db.delete(activities).where(eq(activities.id, id));
  }

  // Products
  async getProducts(): Promise<Product[]> {
    return db.select().from(products).where(eq(products.isActive, true)).orderBy(desc(products.createdAt));
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [item] = await db.select().from(products).where(eq(products.id, id));
    return item;
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
    await db.update(products).set({ isActive: false }).where(eq(products.id, id));
  }

  async addProductImage(image: InsertProductImage): Promise<ProductImage> {
    const [created] = await db.insert(productImages).values(image).returning();
    return created;
  }

  async getProductImages(productId: number): Promise<ProductImage[]> {
    return db.select().from(productImages).where(eq(productImages.productId, productId));
  }

  async deleteProductImage(id: number): Promise<void> {
    await db.delete(productImages).where(eq(productImages.id, id));
  }

  // Reviews
  async getProductReviews(productId: number): Promise<(ProductReview & { username: string })[]> {
    const rows = await db
      .select({
        id: productReviews.id,
        productId: productReviews.productId,
        userId: productReviews.userId,
        rating: productReviews.rating,
        comment: productReviews.comment,
        createdAt: productReviews.createdAt,
        username: users.username,
      })
      .from(productReviews)
      .innerJoin(users, eq(productReviews.userId, users.id))
      .where(eq(productReviews.productId, productId))
      .orderBy(desc(productReviews.createdAt));
    return rows;
  }

  async createProductReview(review: InsertProductReview): Promise<ProductReview> {
    const [created] = await db.insert(productReviews).values(review).returning();
    return created;
  }

  async getUserReviewForProduct(userId: number, productId: number): Promise<ProductReview | undefined> {
    const [row] = await db
      .select()
      .from(productReviews)
      .where(and(eq(productReviews.userId, userId), eq(productReviews.productId, productId)));
    return row;
  }

  // Promo Codes
  async getPromoCodes(): Promise<PromoCode[]> {
    return db.select().from(promoCodes).orderBy(desc(promoCodes.createdAt));
  }

  async getPromoCode(code: string): Promise<PromoCode | undefined> {
    const [row] = await db.select().from(promoCodes).where(eq(promoCodes.code, code.toUpperCase()));
    return row;
  }

  async createPromoCode(promo: InsertPromoCode): Promise<PromoCode> {
    const [created] = await db.insert(promoCodes).values({ ...promo, code: promo.code.toUpperCase() }).returning();
    return created;
  }

  async updatePromoCode(id: number, data: Partial<InsertPromoCode>): Promise<PromoCode | undefined> {
    const [updated] = await db.update(promoCodes).set(data).where(eq(promoCodes.id, id)).returning();
    return updated;
  }

  async deletePromoCode(id: number): Promise<void> {
    await db.delete(promoCodes).where(eq(promoCodes.id, id));
  }

  // Cart
  async getCartItems(sessionId: string): Promise<(CartItem & { product: Product })[]> {
    const rows = await db
      .select({
        id: cartItems.id,
        sessionId: cartItems.sessionId,
        productId: cartItems.productId,
        quantity: cartItems.quantity,
        product: products,
      })
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.sessionId, sessionId));
    return rows;
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

      result.push({
        ...order,
        total: String(order.total),
        items,
      });
    }
    return result;
  }

  async updateOrderStatus(id: number, status: string): Promise<void> {
    await db.update(orders).set({ status: status as "pending" | "paid" | "shipped" | "delivered" | "cancelled" }).where(eq(orders.id, id));
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
