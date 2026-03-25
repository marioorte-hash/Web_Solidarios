import type { Express, Request, Response, NextFunction } from "express";
import type { Server } from "http";
import { storage, type AdminOrder } from "./storage";
import { z } from "zod";
import {
  insertUserSchema, insertNewsSchema, insertActivitySchema,
  insertProductSchema, insertProductImageSchema, insertProductReviewSchema,
  insertPromoCodeSchema, insertContactMessageSchema,
} from "@shared/schema";

// Middleware: require authenticated user
function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) return res.status(401).json({ message: "No autenticado" });
  next();
}

// Middleware: require admin role
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) return res.status(401).json({ message: "No autenticado" });
  if (req.session.userRole !== "admin") return res.status(403).json({ message: "Acceso denegado" });
  next();
}

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {

  // ─── AUTH ───────────────────────────────────────────────────────────
  app.post("/api/auth/register", async (req, res) => {
    try {
      const input = insertUserSchema.parse(req.body);
      const existing = await storage.getUserByEmail(input.email);
      if (existing) return res.status(400).json({ message: "El email ya está en uso" });
      const user = await storage.createUser(input);
      req.session.userId = user.id;
      req.session.userRole = user.role;
      res.json(user);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Error interno" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = z.object({ email: z.string().email(), password: z.string().min(1) }).parse(req.body);
      const user = await storage.getUserByEmail(email);
      if (!user) return res.status(401).json({ message: "Credenciales incorrectas" });
      const valid = await storage.validatePassword(password, user.password);
      if (!valid) return res.status(401).json({ message: "Credenciales incorrectas" });
      req.session.userId = user.id;
      req.session.userRole = user.role;
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

  // ─── CONTACT ────────────────────────────────────────────────────────
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
    res.json(await storage.getNews());
  });

  app.get("/api/news/:id", async (req, res) => {
    const id = Number(req.params.id);
    const item = isNaN(id)
      ? await storage.getNewsItemBySlug(req.params.id)
      : await storage.getNewsItem(id);
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
    res.json(await storage.getActivities());
  });

  app.get("/api/activities/:id", async (req, res) => {
    const item = await storage.getActivity(Number(req.params.id));
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

  // ─── PRODUCTS ───────────────────────────────────────────────────────
  app.get("/api/products", async (_req, res) => {
    res.json(await storage.getProducts());
  });

  app.get("/api/products/:id", async (req, res) => {
    const product = await storage.getProduct(Number(req.params.id));
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
      const existing = await storage.getUserReviewForProduct(req.session.userId!, Number(req.params.id));
      if (existing) return res.status(400).json({ message: "Ya has valorado este producto" });
      const input = insertProductReviewSchema.parse({
        ...req.body,
        productId: Number(req.params.id),
        userId: req.session.userId,
      });
      if (input.rating < 1 || input.rating > 5) return res.status(400).json({ message: "La valoración debe ser entre 1 y 5" });
      res.json(await storage.createProductReview(input));
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
    } catch (err) {
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

  // ─── CART ────────────────────────────────────────────────────────────
  app.get("/api/cart", async (req, res) => {
    const sessionId = req.session.id;
    res.json(await storage.getCartItems(sessionId));
  });

  app.post("/api/cart", async (req, res) => {
    try {
      const { productId, quantity } = z.object({ productId: z.number(), quantity: z.number().min(1).default(1) }).parse(req.body);
      const product = await storage.getProduct(productId);
      if (!product) return res.status(404).json({ message: "Producto no encontrado" });
      if (product.stock < quantity) return res.status(400).json({ message: "Stock insuficiente" });
      const item = await storage.addToCart({ sessionId: req.session.id, productId, quantity });
      res.json(item);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Error interno" });
    }
  });

  app.put("/api/cart/:id", async (req, res) => {
    try {
      const { quantity } = z.object({ quantity: z.number().min(0) }).parse(req.body);
      if (quantity === 0) {
        await storage.removeFromCart(Number(req.params.id));
        return res.json({ success: true });
      }
      const updated = await storage.updateCartItem(Number(req.params.id), quantity);
      res.json(updated);
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
      const id = Number(req.params.id);
      const { status } = z.object({ status: z.enum(["pending", "paid", "shipped", "delivered", "cancelled"]) }).parse(req.body);
      await storage.updateOrderStatus(id, status);
      res.json({ success: true });
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Error interno" });
    }
  });

  // ─── SEARCH ──────────────────────────────────────────────────────────
  app.get("/api/search", async (req, res) => {
    const { q } = z.object({ q: z.string().min(1) }).parse(req.query);
    res.json(await storage.search(q));
  });

  // ─── SEED DATA ───────────────────────────────────────────────────────
  const seedData = async () => {
    const newsItems = await storage.getNews();
    if (newsItems.length === 0) {
      await storage.createNews({ title: "Inauguración del nuevo curso", slug: "inauguracion-curso-2026", summary: "Damos la bienvenida a todos los alumnos a un nuevo año lleno de aprendizaje y solidaridad.", content: "Estamos emocionados de comenzar este nuevo ciclo. Este año hemos preparado nuevas actividades y proyectos que permitirán a nuestros estudiantes crecer tanto personal como académicamente. ¡Bienvenidos a todos!", imageUrl: "https://images.unsplash.com/photo-1509062522246-3755977927d7" });
      await storage.createNews({ title: "Campaña de recolección", slug: "campana-recoleccion-2026", summary: "Ayúdanos a recolectar materiales para las escuelas más necesitadas.", content: "Participa en nuestra campaña anual de recolección de materiales escolares. Cada cuaderno, lápiz y mochila que donas llega directamente a un niño que lo necesita. Juntos hacemos posible que ningún niño se quede sin estudiar por falta de recursos.", imageUrl: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c" });
    }
    const activitiesItems = await storage.getActivities();
    if (activitiesItems.length === 0) {
      await storage.createActivity({ title: "Taller de Arte Infantil", description: "Un espacio para que los niños expresen su creatividad.", date: new Date("2026-04-15"), location: "Centro Cultural", imageUrl: "https://images.unsplash.com/photo-1544776193-adeb74701485" });
      await storage.createActivity({ title: "Carrera Solidaria", description: "Corre por una buena causa. Todo lo recaudado será donado.", date: new Date("2026-05-10"), location: "Parque Central", imageUrl: "https://images.unsplash.com/photo-1461896836934-ffe607ba0197" });
    }
    const productsItems = await storage.getProducts();
    if (productsItems.length === 0) {
      await storage.createProduct({ title: "Camiseta Solidaria", description: "Camiseta oficial de Alumnos Solidarios. Con cada compra apoyas nuestros proyectos educativos.", price: "15.00", category: "Ropa", stock: 50, imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab", isActive: true });
      await storage.createProduct({ title: "Bolsa Ecológica", description: "Bolsa reutilizable con nuestro logo. Perfecta para el día a día y respetuosa con el medio ambiente.", price: "8.00", category: "Accesorios", stock: 100, imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe", isActive: true });
      await storage.createProduct({ title: "Pack Solidario Escolar", description: "Pack completo con material escolar para apoyar a los más pequeños.", price: "25.00", category: "Material Escolar", stock: 30, imageUrl: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6", isActive: true });
    }
  };
  seedData().catch(console.error);

  return httpServer;
}
