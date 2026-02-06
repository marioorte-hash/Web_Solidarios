import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.post(api.contact.submit.path, async (req, res) => {
    try {
      const input = api.contact.submit.input.parse(req.body);
      await storage.createContactMessage(input);
      res.json({ success: true });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.news.list.path, async (req, res) => {
    const news = await storage.getNews();
    res.json(news);
  });

  app.get(api.news.get.path, async (req, res) => {
    const item = await storage.getNewsItem(Number(req.params.id));
    if (!item) {
      return res.status(404).json({ message: "Not found" });
    }
    res.json(item);
  });

  app.get(api.activities.list.path, async (req, res) => {
    const activities = await storage.getActivities();
    res.json(activities);
  });

  // Seed data function (internal use)
  const seedData = async () => {
    const news = await storage.getNews();
    if (news.length === 0) {
      await storage.createNews({
        title: "Inauguración del nuevo curso",
        slug: "inauguracion-curso-2026",
        summary: "Damos la bienvenida a todos los alumnos a un nuevo año lleno de aprendizaje y solidaridad.",
        content: "Estamos emocionados de comenzar este nuevo ciclo...",
        imageUrl: "https://images.unsplash.com/photo-1509062522246-3755977927d7",
      });
      await storage.createNews({
        title: "Campaña de recolección",
        slug: "campana-recoleccion-2026",
        summary: "Ayúdanos a recolectar materiales para las escuelas más necesitadas.",
        content: "Participa en nuestra campaña anual...",
        imageUrl: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c",
      });
    }

    const activities = await storage.getActivities();
    if (activities.length === 0) {
      await storage.createActivity({
        title: "Taller de Arte Infantil",
        description: "Un espacio para que los niños expresen su creatividad.",
        date: new Date("2026-03-15"),
        location: "Centro Cultural",
        imageUrl: "https://images.unsplash.com/photo-1544776193-adeb74701485",
      });
      await storage.createActivity({
        title: "Carrera Solidaria",
        description: "Corre por una buena causa. Todo lo recaudado será donado.",
        date: new Date("2026-04-10"),
        location: "Parque Central",
        imageUrl: "https://images.unsplash.com/photo-1461896836934-ffe607ba0197",
      });
    }
  };

  seedData();

  return httpServer;
}
