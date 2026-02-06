import { db } from "./db";
import {
  contactMessages,
  news,
  activities,
  type InsertContactMessage,
  type InsertNewsItem,
  type InsertActivity,
  type NewsItem,
  type Activity
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  createContactMessage(message: InsertContactMessage): Promise<void>;
  getNews(): Promise<NewsItem[]>;
  getNewsItem(id: number): Promise<NewsItem | undefined>;
  createNews(item: InsertNewsItem): Promise<NewsItem>;
  getActivities(): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
}

export class DatabaseStorage implements IStorage {
  async createContactMessage(message: InsertContactMessage): Promise<void> {
    await db.insert(contactMessages).values(message);
  }

  async getNews(): Promise<NewsItem[]> {
    return await db.select().from(news).orderBy(desc(news.publishedAt));
  }

  async getNewsItem(id: number): Promise<NewsItem | undefined> {
    const [item] = await db.select().from(news).where(eq(news.id, id));
    return item;
  }

  async createNews(item: InsertNewsItem): Promise<NewsItem> {
    const [newItem] = await db.insert(news).values(item).returning();
    return newItem;
  }

  async getActivities(): Promise<Activity[]> {
    return await db.select().from(activities).orderBy(desc(activities.date));
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const [newActivity] = await db.insert(activities).values(activity).returning();
    return newActivity;
  }
}

export const storage = new DatabaseStorage();
