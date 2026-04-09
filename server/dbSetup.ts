import { execSync } from "child_process";

export async function runMigrations() {
  try {
    console.log("[db] Running database migrations...");
    execSync("npx drizzle-kit push --config drizzle.config.ts", {
      stdio: "inherit",
      cwd: process.cwd(),
    });
    console.log("[db] Database migrations completed.");
  } catch (err) {
    console.error("[db] Migration error:", err);
  }
}
