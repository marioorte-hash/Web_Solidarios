import type { Express, Request, Response, NextFunction } from "express";
import type { Server } from "http";
import { storage, type AdminOrder } from "./storage";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import {
  insertUserSchema, insertNewsSchema, insertActivitySchema,
  insertProductSchema, insertProductImageSchema, insertProductReviewSchema,
  insertPromoCodeSchema, insertContactMessageSchema,
  insertSponsorshipSchema, insertActivityRegistrationSchema, insertInternalMessageSchema,
} from "@shared/schema";

// ── File Upload Setup ────────────────────────────────────────────────────────

const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const fileStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`);
  },
});

const upload = multer({
  storage: fileStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf"];
    cb(null, allowed.includes(file.mimetype));
  },
});

// ── Middleware ───────────────────────────────────────────────────────────────

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) return res.status(401).json({ message: "No autenticado" });
  next();
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) return res.status(401).json({ message: "No autenticado" });
  if (req.session.userRole !== "admin") return res.status(403).json({ message: "Acceso denegado" });
  next();
}

// ── Routes ───────────────────────────────────────────────────────────────────

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {

  // Serve uploaded files statically
  app.use("/uploads", (req, res, next) => {
    const filePath = path.join(uploadsDir, path.basename(req.path));
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      next();
    }
  });

  // ─── AUTH ───────────────────────────────────────────────────────────
  app.post("/api/auth/register", async (req, res) => {
    try {
      const input = insertUserSchema.parse(req.body);
      const existing = await storage.getUserByEmail(input.email);
      if (existing) return res.status(400).json({ message: "El email ya está en uso" });
      const user = await storage.createUser(input);
      await new Promise<void>((resolve, reject) => {
        req.session.userId = user.id;
        req.session.userRole = user.role;
        req.session.save((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      res.json(user);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      console.error("Register error:", err);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = z.object({ email: z.string().email(), password: z.string().min(1) }).parse(req.body);
      const user = await storage.getUserByEmail(email);
      if (!user) return res.status(401).json({ message: "Credenciales incorrectas" });
      const valid = await storage.validatePassword(password, user.password);
      if (!valid) return res.status(401).json({ message: "Credenciales incorrectas" });
      await new Promise<void>((resolve, reject) => {
        req.session.userId = user.id;
        req.session.userRole = user.role;
        req.session.save((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      const { password: _, ...safeUser } = user;
      res.json(safeUser);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Error interno" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => res.json({ success: true }));
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ message: "No autenticado" });
    const user = await storage.getUserById(req.session.userId);
    if (!user) return res.status(401).json({ message: "Usuario no encontrado" });
    res.json(user);
  });

  // List admin users (for messaging)
  app.get("/api/admins", requireAuth, async (_req, res) => {
    const allUsers = await storage.getAllUsers();
    const admins = allUsers.filter(u => u.role === "admin").map(({ id, username, email }) => ({ id, username, email }));
    res.json(admins);
  });

  // ─── FILE UPLOAD ─────────────────────────────────────────────────────
  app.post("/api/upload", requireAdmin, upload.single("file"), (req, res) => {
    if (!req.file) return res.status(400).json({ message: "No se recibió ningún archivo" });
    const url = `/uploads/${req.file.filename}`;
    res.json({ url, filename: req.file.originalname });
  });

  // For message attachments (any authenticated user)
  app.post("/api/upload/attachment", requireAuth, upload.single("file"), (req, res) => {
    if (!req.file) return res.status(400).json({ message: "No se recibió ningún archivo" });
    const url = `/uploads/${req.file.filename}`;
    res.json({ url, filename: req.file.originalname });
  });

  // ─── CONTACT (legacy) ────────────────────────────────────────────────
  app.post("/api/contact", async (req, res) => {
    try {
      const input = insertContactMessageSchema.parse(req.body);
      await storage.createContactMessage(input);
      res.json({ success: true });
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Error interno" });
    }
  });

  // ─── NEWS ───────────────────────────────────────────────────────────
  app.get("/api/news", async (_req, res) => {
    res.json(await storage.getAllNews());
  });

  app.get("/api/news/:id", async (req, res) => {
    const id = Number(req.params.id);
    const item = isNaN(id)
      ? await storage.getNewsBySlug(req.params.id)
      : await storage.getNewsBySlug(req.params.id) ?? (await storage.getAllNews()).find(n => n.id === id);
    if (!item) return res.status(404).json({ message: "No encontrado" });
    res.json(item);
  });

  app.post("/api/news", requireAdmin, async (req, res) => {
    try {
      const input = insertNewsSchema.parse(req.body);
      res.json(await storage.createNews(input));
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Error interno" });
    }
  });

  app.put("/api/news/:id", requireAdmin, async (req, res) => {
    try {
      const input = insertNewsSchema.partial().parse(req.body);
      const updated = await storage.updateNews(Number(req.params.id), input);
      if (!updated) return res.status(404).json({ message: "No encontrado" });
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Error interno" });
    }
  });

  app.delete("/api/news/:id", requireAdmin, async (req, res) => {
    await storage.deleteNews(Number(req.params.id));
    res.json({ success: true });
  });

  // ─── ACTIVITIES ─────────────────────────────────────────────────────
  app.get("/api/activities", async (_req, res) => {
    res.json(await storage.getAllActivities());
  });

  app.get("/api/activities/:id", async (req, res) => {
    const item = await storage.getActivityById(Number(req.params.id));
    if (!item) return res.status(404).json({ message: "No encontrado" });
    res.json(item);
  });

  app.post("/api/activities", requireAdmin, async (req, res) => {
    try {
      const input = insertActivitySchema.parse(req.body);
      res.json(await storage.createActivity(input));
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Error interno" });
    }
  });

  app.put("/api/activities/:id", requireAdmin, async (req, res) => {
    try {
      const input = insertActivitySchema.partial().parse(req.body);
      const updated = await storage.updateActivity(Number(req.params.id), input);
      if (!updated) return res.status(404).json({ message: "No encontrado" });
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Error interno" });
    }
  });

  app.delete("/api/activities/:id", requireAdmin, async (req, res) => {
    await storage.deleteActivity(Number(req.params.id));
    res.json({ success: true });
  });

  // ─── ACTIVITY REGISTRATIONS ─────────────────────────────────────────
  app.get("/api/my-activities", requireAuth, async (req, res) => {
    res.json(await storage.getActivityRegistrationsByUser(req.session.userId!));
  });

  app.post("/api/activity-registrations", requireAuth, async (req, res) => {
    try {
      const { activityId, notes } = z.object({
        activityId: z.number().int(),
        notes: z.string().optional(),
      }).parse(req.body);
      const already = await storage.isUserRegisteredForActivity(req.session.userId!, activityId);
      if (already) return res.status(400).json({ message: "Ya estás apuntado a esta actividad" });
      const reg = await storage.createActivityRegistration({
        userId: req.session.userId!,
        activityId,
        notes: notes ?? null,
      });
      res.json(reg);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Error interno" });
    }
  });

  app.delete("/api/activity-registrations/:id", requireAuth, async (req, res) => {
    await storage.deleteActivityRegistration(Number(req.params.id));
    res.json({ success: true });
  });

  app.get("/api/admin/activity-registrations", requireAdmin, async (_req, res) => {
    res.json(await storage.getAdminActivityRegistrations());
  });

  // ─── SPONSORSHIP FORM FIELDS ─────────────────────────────────────────
  app.get("/api/sponsorship-form-fields", async (_req, res) => {
    res.json(await storage.getSponsorshipFormFields());
  });

  app.post("/api/admin/sponsorship-form-fields", requireAdmin, async (req, res) => {
    try {
      const { label, fieldType, options, required, sortOrder, isActive } = req.body;
      if (!label) return res.status(400).json({ message: "El campo 'label' es obligatorio" });
      const field = await storage.createSponsorshipFormField({
        label, fieldType: fieldType ?? "short_answer",
        options: options ?? null, required: required ?? false,
        sortOrder: sortOrder ?? 0, isActive: isActive ?? true,
      });
      res.json(field);
    } catch (err) {
      res.status(500).json({ message: "Error interno" });
    }
  });

  app.put("/api/admin/sponsorship-form-fields/:id", requireAdmin, async (req, res) => {
    try {
      const updated = await storage.updateSponsorshipFormField(Number(req.params.id), req.body);
      if (!updated) return res.status(404).json({ message: "No encontrado" });
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: "Error interno" });
    }
  });

  app.delete("/api/admin/sponsorship-form-fields/:id", requireAdmin, async (req, res) => {
    await storage.deleteSponsorshipFormField(Number(req.params.id));
    res.json({ success: true });
  });

  // ─── SPONSORSHIPS ────────────────────────────────────────────────────
  app.get("/api/my-sponsorships", requireAuth, async (req, res) => {
    res.json(await storage.getSponsorshipsByUser(req.session.userId!));
  });

  app.post("/api/sponsorships", requireAuth, async (req, res) => {
    try {
      const input = insertSponsorshipSchema.parse({ ...req.body, userId: req.session.userId });
      const item = await storage.createSponsorship(input);
      res.json(item);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Error interno" });
    }
  });

  app.put("/api/sponsorships/:id", requireAuth, async (req, res) => {
    try {
      const input = insertSponsorshipSchema.partial().omit({ userId: true } as any).parse(req.body);
      const updated = await storage.updateSponsorship(Number(req.params.id), input);
      if (!updated) return res.status(404).json({ message: "No encontrado" });
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Error interno" });
    }
  });

  app.delete("/api/sponsorships/:id", requireAuth, async (req, res) => {
    await storage.deleteSponsorship(Number(req.params.id));
    res.json({ success: true });
  });

  app.get("/api/admin/sponsorships", requireAdmin, async (_req, res) => {
    res.json(await storage.getAdminSponsorships());
  });

  // Admin can also update sponsorships
  app.put("/api/admin/sponsorships/:id", requireAdmin, async (req, res) => {
    try {
      const input = insertSponsorshipSchema.partial().parse(req.body);
      const updated = await storage.updateSponsorship(Number(req.params.id), input);
      if (!updated) return res.status(404).json({ message: "No encontrado" });
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Error interno" });
    }
  });

  // ─── INTERNAL MESSAGES ───────────────────────────────────────────────
  app.get("/api/my-messages", requireAuth, async (req, res) => {
    res.json(await storage.getMessagesByUser(req.session.userId!));
  });

  app.post("/api/messages", requireAuth, async (req, res) => {
    try {
      const { subject, body, attachmentUrl, attachmentName, recipientId } = z.object({
        subject: z.string().min(1),
        body: z.string().min(1),
        attachmentUrl: z.string().optional(),
        attachmentName: z.string().optional(),
        recipientId: z.number().optional(),
      }).parse(req.body);
      const msg = await storage.createMessage({
        userId: req.session.userId!,
        recipientId: recipientId ?? null,
        subject,
        body,
        attachmentUrl: attachmentUrl ?? null,
        attachmentName: attachmentName ?? null,
      });
      res.json(msg);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Error interno" });
    }
  });

  app.get("/api/admin/messages", requireAdmin, async (_req, res) => {
    res.json(await storage.getAllMessages());
  });

  app.put("/api/admin/messages/:id/reply", requireAdmin, async (req, res) => {
    try {
      const { reply } = z.object({ reply: z.string().min(1) }).parse(req.body);
      await storage.adminReplyToMessage(Number(req.params.id), reply);
      res.json({ success: true });
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Error interno" });
    }
  });

  app.put("/api/admin/messages/:id/read", requireAdmin, async (req, res) => {
    await storage.markMessageRead(Number(req.params.id));
    res.json({ success: true });
  });

  // ─── PRODUCTS ───────────────────────────────────────────────────────
  app.get("/api/products", async (_req, res) => {
    res.json(await storage.getAllProducts());
  });

  app.get("/api/products/:id", async (req, res) => {
    const product = await storage.getProductById(Number(req.params.id));
    if (!product) return res.status(404).json({ message: "No encontrado" });
    const images = await storage.getProductImages(product.id);
    res.json({ ...product, images });
  });

  app.post("/api/products", requireAdmin, async (req, res) => {
    try {
      const input = insertProductSchema.parse(req.body);
      res.json(await storage.createProduct(input));
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Error interno" });
    }
  });

  app.put("/api/products/:id", requireAdmin, async (req, res) => {
    try {
      const input = insertProductSchema.partial().parse(req.body);
      const updated = await storage.updateProduct(Number(req.params.id), input);
      if (!updated) return res.status(404).json({ message: "No encontrado" });
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Error interno" });
    }
  });

  app.delete("/api/products/:id", requireAdmin, async (req, res) => {
    await storage.deleteProduct(Number(req.params.id));
    res.json({ success: true });
  });

  app.post("/api/products/:id/images", requireAdmin, async (req, res) => {
    try {
      const input = insertProductImageSchema.parse({ ...req.body, productId: Number(req.params.id) });
      res.json(await storage.addProductImage(input));
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Error interno" });
    }
  });

  app.delete("/api/product-images/:id", requireAdmin, async (req, res) => {
    await storage.deleteProductImage(Number(req.params.id));
    res.json({ success: true });
  });

  // ─── REVIEWS ────────────────────────────────────────────────────────
  app.get("/api/products/:id/reviews", async (req, res) => {
    res.json(await storage.getProductReviews(Number(req.params.id)));
  });

  app.post("/api/products/:id/reviews", requireAuth, async (req, res) => {
    try {
      const input = insertProductReviewSchema.parse({
        ...req.body,
        productId: Number(req.params.id),
        userId: req.session.userId,
      });
      if (input.rating < 1 || input.rating > 5) return res.status(400).json({ message: "La valoración debe ser entre 1 y 5" });
      res.json(await storage.createReview(input));
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Error interno" });
    }
  });

  // ─── PROMO CODES ────────────────────────────────────────────────────
  app.get("/api/promo-codes", requireAdmin, async (_req, res) => {
    res.json(await storage.getPromoCodes());
  });

  app.post("/api/promo-codes/validate", async (req, res) => {
    try {
      const { code } = z.object({ code: z.string() }).parse(req.body);
      const promo = await storage.getPromoCode(code);
      if (!promo || !promo.isActive) return res.status(404).json({ message: "Código no válido o inactivo" });
      res.json({ id: promo.id, code: promo.code, discount: promo.discount });
    } catch {
      res.status(500).json({ message: "Error interno" });
    }
  });

  app.post("/api/promo-codes", requireAdmin, async (req, res) => {
    try {
      const input = insertPromoCodeSchema.parse(req.body);
      res.json(await storage.createPromoCode(input));
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Error interno" });
    }
  });

  app.put("/api/promo-codes/:id", requireAdmin, async (req, res) => {
    try {
      const input = insertPromoCodeSchema.partial().parse(req.body);
      const updated = await storage.updatePromoCode(Number(req.params.id), input);
      if (!updated) return res.status(404).json({ message: "No encontrado" });
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Error interno" });
    }
  });

  app.delete("/api/promo-codes/:id", requireAdmin, async (req, res) => {
    await storage.deletePromoCode(Number(req.params.id));
    res.json({ success: true });
  });

  // ─── CART ───────────────────────────────────────────────────────────
  app.get("/api/cart", async (req, res) => {
    res.json(await storage.getCartItems(req.session.id));
  });

  app.post("/api/cart", async (req, res) => {
    try {
      const { productId, quantity } = z.object({
        productId: z.number().int(),
        quantity: z.number().int().min(1).default(1),
      }).parse(req.body);
      const item = await storage.addToCart({ sessionId: req.session.id, productId, quantity });
      res.json(item);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Error interno" });
    }
  });

  app.put("/api/cart/:id", async (req, res) => {
    try {
      const { quantity } = z.object({ quantity: z.number().int() }).parse(req.body);
      const item = await storage.updateCartItem(Number(req.params.id), quantity);
      res.json(item ?? { deleted: true });
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Error interno" });
    }
  });

  app.delete("/api/cart/:id", async (req, res) => {
    await storage.removeFromCart(Number(req.params.id));
    res.json({ success: true });
  });

  app.delete("/api/cart", async (req, res) => {
    await storage.clearCart(req.session.id);
    res.json({ success: true });
  });

  // ─── ORDERS ──────────────────────────────────────────────────────────
  app.post("/api/orders", requireAuth, async (req, res) => {
    try {
      const body = z.object({
        promoCode: z.string().optional(),
        isStudent: z.boolean().default(false),
        studentClass: z.string().optional(),
        pickupDate: z.string().optional(),
        pickupTime: z.string().optional(),
        userConsent: z.boolean(),
      }).parse(req.body);

      if (!body.userConsent) {
        return res.status(400).json({ message: "Debes aceptar el envío de datos para continuar" });
      }
      if (!body.isStudent && (!body.pickupDate || !body.pickupTime)) {
        return res.status(400).json({ message: "Debes seleccionar fecha y hora de recogida" });
      }
      if (body.isStudent && !body.studentClass) {
        return res.status(400).json({ message: "Debes indicar la clase" });
      }

      const cartList = await storage.getCartItems(req.session.id);
      if (cartList.length === 0) return res.status(400).json({ message: "El carrito está vacío" });

      let total = cartList.reduce((sum, item) => sum + parseFloat(item.product.price as string) * item.quantity, 0);
      let promoCodeId: number | undefined;

      if (body.promoCode) {
        const promo = await storage.getPromoCode(body.promoCode);
        if (promo && promo.isActive) {
          total = total * (1 - promo.discount / 100);
          promoCodeId = promo.id;
        }
      }

      const order = await storage.createOrder(
        {
          userId: req.session.userId,
          sessionId: req.session.id,
          total: total.toFixed(2),
          status: "pending",
          promoCodeId,
          isStudent: body.isStudent,
          studentClass: body.studentClass ?? null,
          pickupDate: body.pickupDate ?? null,
          pickupTime: body.pickupTime ?? null,
          userConsent: body.userConsent,
        },
        cartList.map(item => ({
          orderId: 0,
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.price,
        }))
      );

      await storage.clearCart(req.session.id);
      res.json(order);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Error interno" });
    }
  });

  app.get("/api/orders", requireAuth, async (req, res) => {
    res.json(await storage.getOrdersByUser(req.session.userId!));
  });

  app.get("/api/admin/orders", requireAdmin, async (_req, res) => {
    res.json(await storage.getAdminOrders());
  });

  app.put("/api/admin/orders/:id/status", requireAdmin, async (req, res) => {
    try {
      const { status } = z.object({ status: z.enum(["pending", "paid", "shipped", "delivered", "cancelled"]) }).parse(req.body);
      await storage.updateOrderStatus(Number(req.params.id), status);
      res.json({ success: true });
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Error interno" });
    }
  });

  // ─── ADMIN USER MANAGEMENT ───────────────────────────────────────────
  app.get("/api/admin/users", requireAdmin, async (_req, res) => {
    res.json(await storage.getAllUsers());
  });

  app.post("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const body = z.object({
        username: z.string().min(3),
        email: z.string().email(),
        password: z.string().min(6),
        role: z.enum(["admin", "user"]).default("user"),
      }).parse(req.body);
      const existing = await storage.getUserByEmail(body.email);
      if (existing) return res.status(400).json({ message: "El email ya está en uso" });
      const user = await storage.createAdminUser(body, body.role);
      res.json(user);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Error interno" });
    }
  });

  app.patch("/api/admin/users/:id/password", requireAdmin, async (req, res) => {
    try {
      const { password } = z.object({ password: z.string().min(6) }).parse(req.body);
      await storage.changeUserPassword(Number(req.params.id), password);
      res.json({ success: true });
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Error interno" });
    }
  });

  app.delete("/api/admin/users/:id", requireAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (req.session.userId === id) return res.status(400).json({ message: "No puedes eliminarte a ti mismo" });
      await storage.deleteUser(id);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "Error interno" });
    }
  });

  // ─── SPONSORED CHILDREN ──────────────────────────────────────────────
  app.get("/api/admin/sponsored-children", requireAdmin, async (_req, res) => {
    res.json(await storage.getAllSponsoredChildren());
  });
  app.post("/api/admin/sponsored-children", requireAdmin, async (req, res) => {
    try {
      const child = await storage.createSponsoredChild(req.body);
      res.json(child);
    } catch { res.status(500).json({ message: "Error interno" }); }
  });
  app.put("/api/admin/sponsored-children/:id", requireAdmin, async (req, res) => {
    try {
      const updated = await storage.updateSponsoredChild(Number(req.params.id), req.body);
      if (!updated) return res.status(404).json({ message: "No encontrado" });
      res.json(updated);
    } catch { res.status(500).json({ message: "Error interno" }); }
  });
  app.delete("/api/admin/sponsored-children/:id", requireAdmin, async (req, res) => {
    await storage.deleteSponsoredChild(Number(req.params.id));
    res.json({ success: true });
  });
  app.get("/api/admin/sponsored-children/:id/assignments", requireAdmin, async (req, res) => {
    res.json(await storage.getAssignmentsForChild(Number(req.params.id)));
  });
  app.post("/api/admin/sponsored-children/:id/assign", requireAdmin, async (req, res) => {
    try {
      const { userId } = z.object({ userId: z.number() }).parse(req.body);
      await storage.assignChildToUser(Number(req.params.id), userId);
      res.json({ success: true });
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Error interno" });
    }
  });
  app.delete("/api/admin/sponsored-children/:id/assign/:userId", requireAdmin, async (req, res) => {
    await storage.unassignChildFromUser(Number(req.params.id), Number(req.params.userId));
    res.json({ success: true });
  });
  app.get("/api/my-sponsored-children", requireAuth, async (req, res) => {
    res.json(await storage.getChildrenForUser(req.session.userId!));
  });

  // ─── BENEFITS ────────────────────────────────────────────────────────
  app.get("/api/admin/benefits", requireAdmin, async (_req, res) => {
    res.json(await storage.getAllBenefits());
  });
  app.post("/api/admin/benefits", requireAdmin, async (req, res) => {
    try {
      const benefit = await storage.createBenefit(req.body);
      res.json(benefit);
    } catch { res.status(500).json({ message: "Error interno" }); }
  });
  app.put("/api/admin/benefits/:id", requireAdmin, async (req, res) => {
    try {
      const updated = await storage.updateBenefit(Number(req.params.id), req.body);
      if (!updated) return res.status(404).json({ message: "No encontrado" });
      res.json(updated);
    } catch { res.status(500).json({ message: "Error interno" }); }
  });
  app.delete("/api/admin/benefits/:id", requireAdmin, async (req, res) => {
    await storage.deleteBenefit(Number(req.params.id));
    res.json({ success: true });
  });
  app.get("/api/admin/benefits/:id/assignments", requireAdmin, async (req, res) => {
    res.json(await storage.getAssignmentsForBenefit(Number(req.params.id)));
  });
  app.post("/api/admin/benefits/:id/assign", requireAdmin, async (req, res) => {
    try {
      const { userId } = z.object({ userId: z.number() }).parse(req.body);
      await storage.assignBenefitToUser(Number(req.params.id), userId);
      res.json({ success: true });
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Error interno" });
    }
  });
  app.delete("/api/admin/benefits/:id/assign/:userId", requireAdmin, async (req, res) => {
    await storage.unassignBenefitFromUser(Number(req.params.id), Number(req.params.userId));
    res.json({ success: true });
  });
  app.get("/api/my-benefits", requireAuth, async (req, res) => {
    res.json(await storage.getBenefitsForUser(req.session.userId!));
  });

  // ─── USER PROFILE UPDATE ─────────────────────────────────────────────
  app.patch("/api/my-profile", requireAuth, async (req, res) => {
    try {
      const { username, email } = z.object({
        username: z.string().min(2).optional(),
        email: z.string().email().optional(),
      }).parse(req.body);
      const updated = await storage.updateUserProfile(req.session.userId!, { username, email });
      if (!updated) return res.status(404).json({ message: "Usuario no encontrado" });
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Error interno" });
    }
  });

  // ─── SEARCH ──────────────────────────────────────────────────────────
  app.get("/api/search", async (req, res) => {
    try {
      const { q } = z.object({ q: z.string().min(1) }).parse(req.query);
      res.json(await storage.search(q));
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Error interno" });
    }
  });

  return httpServer;
}
