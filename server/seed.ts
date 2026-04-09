import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

export async function seedAdminUser() {
  try {
    const email = "marioorte@alumnossolidarios.org";
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing.length > 0) {
      console.log("[seed] Admin user already exists, skipping.");
      return;
    }

    const hashed = await bcrypt.hash("Alumn@sSolidarios.org_2026", 10);
    await db.insert(users).values({
      username: "AdminSolidarios",
      email,
      password: hashed,
      role: "admin",
    });

    console.log("[seed] Admin user 'AdminSolidarios' created successfully.");
  } catch (err) {
    console.error("[seed] Error seeding admin user:", err);
  }
}
