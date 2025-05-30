import type { Express } from "express";
import { createServer, type Server } from "http";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, desc, and } from "drizzle-orm";
import { 
  users, 
  userSettings,
  projects, 
  claims, 
  claimItems,
  variations, 
  credits,
  attachments,
  insertProjectSchema,
  insertUserSettingsSchema,
  insertClaimSchema,
  insertClaimItemSchema,
  insertVariationSchema,
  insertCreditSchema,
  insertAttachmentSchema,
  type Project,
  type UserSettings,
  type Claim,
  type ClaimItem,
  type Variation,
  type Credit,
  type Attachment
} from "@shared/schema";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}

const client = postgres(connectionString);
const db = drizzle(client);

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Simple authentication - in production you'd hash passwords
      if (email === "admin@claimtrackr.com" && password === "password123") {
        const user = {
          id: "00000000-0000-0000-0000-000000000000",
          email: "admin@claimtrackr.com",
          role: "admin"
        };
        res.json(user);
      } else {
        res.status(401).json({ message: "Invalid credentials" });
      }
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.get("/api/auth/me", async (req, res) => {
    // For demo purposes, return a mock user
    // In production, you'd check session/token
    res.status(401).json({ message: "Not authenticated" });
  });

  app.post("/api/auth/logout", async (req, res) => {
    res.json({ message: "Logged out successfully" });
  });

  // Projects routes
  app.get("/api/projects", async (req, res) => {
    try {
      // In a real app, this would filter by the authenticated user
      const userProjects = await db
        .select()
        .from(projects)
        .orderBy(desc(projects.createdAt));
      
      res.json(userProjects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const project = await db
        .select()
        .from(projects)
        .where(eq(projects.id, id))
        .limit(1);
      
      if (project.length === 0) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      res.json(project[0]);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      console.log("Received project data:", req.body);
      const validatedData = insertProjectSchema.parse(req.body);
      console.log("Validated data:", validatedData);
      
      const [newProject] = await db
        .insert(projects)
        .values(validatedData)
        .returning();
      
      console.log("Created project:", newProject);
      res.status(201).json(newProject);
    } catch (error) {
      console.error("Error creating project:", error);
      res.status(400).json({ message: "Invalid project data", error: error instanceof Error ? error.message : String(error) });
    }
  });

  app.patch("/api/projects/:id", async (req, res) => {
    try {
      const { id } = req.params;
      console.log("Updating project:", id, req.body);
      
      // Create a partial schema that omits the id field
      const updateSchema = insertProjectSchema.partial();
      const validatedData = updateSchema.parse(req.body);
      console.log("Validated update data:", validatedData);
      
      const [updatedProject] = await db
        .update(projects)
        .set(validatedData)
        .where(eq(projects.id, id))
        .returning();
      
      if (!updatedProject) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      console.log("Updated project:", updatedProject);
      res.json(updatedProject);
    } catch (error) {
      console.error("Error updating project:", error);
      res.status(400).json({ message: "Invalid project data", error: error instanceof Error ? error.message : String(error) });
    }
  });

  app.delete("/api/projects/:id", async (req, res) => {
    try {
      const { id } = req.params;
      console.log("Deleting project:", id);
      
      // First delete all related claims and their dependencies
      const projectClaims = await db
        .select({ id: claims.id })
        .from(claims)
        .where(eq(claims.projectId, id));
      
      for (const claim of projectClaims) {
        // Delete claim items
        await db.delete(claimItems).where(eq(claimItems.claimId, claim.id));
        // Delete variations
        await db.delete(variations).where(eq(variations.claimId, claim.id));
        // Delete attachments
        await db.delete(attachments).where(eq(attachments.claimId, claim.id));
        // Delete credits
        await db.delete(credits).where(eq(credits.claimId, claim.id));
      }
      
      // Delete all claims for this project
      await db.delete(claims).where(eq(claims.projectId, id));
      
      // Finally delete the project
      const [deletedProject] = await db
        .delete(projects)
        .where(eq(projects.id, id))
        .returning();
      
      if (!deletedProject) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      console.log("Deleted project:", deletedProject);
      res.json({ message: "Project deleted successfully" });
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({ message: "Failed to delete project", error: error instanceof Error ? error.message : String(error) });
    }
  });

  // Claims routes
  app.get("/api/projects/:projectId/claims", async (req, res) => {
    try {
      const { projectId } = req.params;
      const projectClaims = await db
        .select()
        .from(claims)
        .where(eq(claims.projectId, projectId))
        .orderBy(desc(claims.createdAt));
      
      res.json(projectClaims);
    } catch (error) {
      console.error("Error fetching claims:", error);
      res.status(500).json({ message: "Failed to fetch claims" });
    }
  });

  app.get("/api/claims/recent", async (req, res) => {
    try {
      const recentClaims = await db
        .select()
        .from(claims)
        .orderBy(desc(claims.createdAt))
        .limit(10);
      
      res.json(recentClaims);
    } catch (error) {
      console.error("Error fetching recent claims:", error);
      res.status(500).json({ message: "Failed to fetch recent claims" });
    }
  });

  app.get("/api/claims/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const claim = await db
        .select()
        .from(claims)
        .where(eq(claims.id, id))
        .limit(1);
      
      if (claim.length === 0) {
        return res.status(404).json({ message: "Claim not found" });
      }
      
      res.json(claim[0]);
    } catch (error) {
      console.error("Error fetching claim:", error);
      res.status(500).json({ message: "Failed to fetch claim" });
    }
  });

  app.post("/api/claims", async (req, res) => {
    try {
      const validatedData = insertClaimSchema.parse(req.body);
      
      // In a real app, get this from authenticated user
      const claimData = {
        ...validatedData,
        createdBy: "00000000-0000-0000-0000-000000000000", // Mock user ID
      };
      
      const [newClaim] = await db
        .insert(claims)
        .values(claimData)
        .returning();
      
      res.status(201).json(newClaim);
    } catch (error) {
      console.error("Error creating claim:", error);
      res.status(400).json({ message: "Invalid claim data" });
    }
  });

  // Claim Items routes
  app.get("/api/claims/:claimId/items", async (req, res) => {
    try {
      const { claimId } = req.params;
      const items = await db
        .select()
        .from(claimItems)
        .where(eq(claimItems.claimId, claimId))
        .orderBy(claimItems.sortOrder);
      
      res.json(items);
    } catch (error) {
      console.error("Error fetching claim items:", error);
      res.status(500).json({ message: "Failed to fetch claim items" });
    }
  });

  app.post("/api/claim-items", async (req, res) => {
    try {
      const validatedData = insertClaimItemSchema.parse(req.body);
      
      const [newItem] = await db
        .insert(claimItems)
        .values(validatedData)
        .returning();
      
      res.status(201).json(newItem);
    } catch (error) {
      console.error("Error creating claim item:", error);
      res.status(400).json({ message: "Invalid claim item data" });
    }
  });

  // Variations routes
  app.get("/api/claims/:claimId/variations", async (req, res) => {
    try {
      const { claimId } = req.params;
      const claimVariations = await db
        .select()
        .from(variations)
        .where(eq(variations.claimId, claimId))
        .orderBy(desc(variations.createdAt));
      
      res.json(claimVariations);
    } catch (error) {
      console.error("Error fetching variations:", error);
      res.status(500).json({ message: "Failed to fetch variations" });
    }
  });

  app.post("/api/variations", async (req, res) => {
    try {
      const validatedData = insertVariationSchema.parse(req.body);
      
      const [newVariation] = await db
        .insert(variations)
        .values(validatedData)
        .returning();
      
      res.status(201).json(newVariation);
    } catch (error) {
      console.error("Error creating variation:", error);
      res.status(400).json({ message: "Invalid variation data" });
    }
  });

  // Credits routes
  app.get("/api/claims/:claimId/credits", async (req, res) => {
    try {
      const { claimId } = req.params;
      const claimCredits = await db
        .select()
        .from(credits)
        .where(eq(credits.claimId, claimId))
        .orderBy(desc(credits.createdAt));
      
      res.json(claimCredits);
    } catch (error) {
      console.error("Error fetching credits:", error);
      res.status(500).json({ message: "Failed to fetch credits" });
    }
  });

  app.post("/api/credits", async (req, res) => {
    try {
      const validatedData = insertCreditSchema.parse(req.body);
      
      const [newCredit] = await db
        .insert(credits)
        .values(validatedData)
        .returning();
      
      res.status(201).json(newCredit);
    } catch (error) {
      console.error("Error creating credit:", error);
      res.status(400).json({ message: "Invalid credit data" });
    }
  });

  // Attachments routes
  app.get("/api/claims/:claimId/attachments", async (req, res) => {
    try {
      const { claimId } = req.params;
      const claimAttachments = await db
        .select()
        .from(attachments)
        .where(eq(attachments.claimId, claimId))
        .orderBy(desc(attachments.createdAt));
      
      res.json(claimAttachments);
    } catch (error) {
      console.error("Error fetching attachments:", error);
      res.status(500).json({ message: "Failed to fetch attachments" });
    }
  });

  app.post("/api/attachments", async (req, res) => {
    try {
      const validatedData = insertAttachmentSchema.parse(req.body);
      
      // In a real app, get this from authenticated user
      const attachmentData = {
        ...validatedData,
        uploadedBy: "00000000-0000-0000-0000-000000000000", // Mock user ID
      };
      
      const [newAttachment] = await db
        .insert(attachments)
        .values(attachmentData)
        .returning();
      
      res.status(201).json(newAttachment);
    } catch (error) {
      console.error("Error creating attachment:", error);
      res.status(400).json({ message: "Invalid attachment data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
