import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertDeploymentSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // MCP routes
  app.get('/api/mcps', async (req, res) => {
    try {
      const { search, featured } = req.query;
      
      let mcps;
      if (featured === 'true') {
        mcps = await storage.getFeaturedMcps();
      } else if (search && typeof search === 'string') {
        mcps = await storage.searchMcps(search);
      } else {
        mcps = await storage.getAllMcps();
      }
      
      res.json(mcps);
    } catch (error) {
      console.error("Error fetching MCPs:", error);
      res.status(500).json({ message: "Failed to fetch MCPs" });
    }
  });

  app.get('/api/mcps/:slug', async (req, res) => {
    try {
      const { slug } = req.params;
      const mcp = await storage.getMcpBySlug(slug);
      
      if (!mcp) {
        return res.status(404).json({ message: "MCP not found" });
      }
      
      res.json(mcp);
    } catch (error) {
      console.error("Error fetching MCP:", error);
      res.status(500).json({ message: "Failed to fetch MCP" });
    }
  });

  // Deployment routes
  app.get('/api/deployments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const deployments = await storage.getUserDeployments(userId);
      res.json(deployments);
    } catch (error) {
      console.error("Error fetching deployments:", error);
      res.status(500).json({ message: "Failed to fetch deployments" });
    }
  });

  app.post('/api/deployments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { mcpId, envVars } = req.body;

      // Validate input
      const validation = z.object({
        mcpId: z.number(),
        envVars: z.record(z.string()).optional().default({}),
      }).safeParse({ mcpId, envVars });

      if (!validation.success) {
        return res.status(400).json({ message: "Invalid request data" });
      }

      // Get MCP details
      const mcp = await storage.getMcpById(mcpId);
      if (!mcp) {
        return res.status(404).json({ message: "MCP not found" });
      }

      // Generate unique deployment URL
      const deploymentId = Math.random().toString(36).substring(2, 8);
      const url = `https://${mcp.slug}-${deploymentId}.mcpmarket.dev`;

      // Create deployment
      const deployment = await storage.createDeployment({
        userId,
        mcpId,
        name: `${mcp.name} - ${deploymentId}`,
        url,
        status: 'deploying',
        envVars: validation.data.envVars,
      });

      // Increment deployment count
      await storage.incrementDeploymentCount(mcpId);

      // Simulate deployment process
      setTimeout(async () => {
        await storage.updateDeploymentStatus(deployment.id, 'running');
      }, 2000);

      res.json(deployment);
    } catch (error) {
      console.error("Error creating deployment:", error);
      res.status(500).json({ message: "Failed to create deployment" });
    }
  });

  app.patch('/api/deployments/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userId = req.user.claims.sub;

      // Validate status
      const validStatuses = ['running', 'stopped', 'error', 'deploying'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      // Check if deployment belongs to user
      const deployment = await storage.getDeploymentById(parseInt(id));
      if (!deployment || deployment.userId !== userId) {
        return res.status(404).json({ message: "Deployment not found" });
      }

      await storage.updateDeploymentStatus(parseInt(id), status);
      res.json({ message: "Status updated successfully" });
    } catch (error) {
      console.error("Error updating deployment status:", error);
      res.status(500).json({ message: "Failed to update deployment status" });
    }
  });

  app.patch('/api/deployments/:id/env-vars', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { envVars } = req.body;
      const userId = req.user.claims.sub;

      // Validate input
      const validation = z.record(z.string()).safeParse(envVars);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid environment variables" });
      }

      // Check if deployment belongs to user
      const deployment = await storage.getDeploymentById(parseInt(id));
      if (!deployment || deployment.userId !== userId) {
        return res.status(404).json({ message: "Deployment not found" });
      }

      await storage.updateDeploymentEnvVars(parseInt(id), validation.data);
      res.json({ message: "Environment variables updated successfully" });
    } catch (error) {
      console.error("Error updating environment variables:", error);
      res.status(500).json({ message: "Failed to update environment variables" });
    }
  });

  app.delete('/api/deployments/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;

      // Check if deployment belongs to user
      const deployment = await storage.getDeploymentById(parseInt(id));
      if (!deployment || deployment.userId !== userId) {
        return res.status(404).json({ message: "Deployment not found" });
      }

      await storage.deleteDeployment(parseInt(id));
      res.json({ message: "Deployment deleted successfully" });
    } catch (error) {
      console.error("Error deleting deployment:", error);
      res.status(500).json({ message: "Failed to delete deployment" });
    }
  });

  // Initialize default MCPs if database is empty
  app.post('/api/seed-mcps', async (req, res) => {
    try {
      const existingMcps = await storage.getAllMcps();
      if (existingMcps.length > 0) {
        return res.json({ message: "MCPs already exist" });
      }

      const defaultMcps = [
        {
          name: "PostgreSQL MCP",
          slug: "postgresql-mcp",
          description: "Connect to PostgreSQL databases with full query support, schema introspection, and connection pooling.",
          longDescription: "The PostgreSQL MCP provides comprehensive database connectivity for PostgreSQL instances. It supports executing SQL queries, exploring database schemas, managing connections efficiently through connection pooling, and handling transactions safely.",
          maintainer: "PostgreSQL Team",
          maintainerAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&w=40&h=40&fit=crop&crop=face",
          version: "1.2.3",
          category: "Database",
          tags: ["database", "sql", "postgresql", "query"],
          rating: 49,
          deploymentCount: 2145,
          icon: "DB",
          iconColor: "#0066CC",
          featured: true,
          documentation: "# PostgreSQL MCP Documentation\n\nThis MCP provides PostgreSQL database connectivity...",
          screenshots: [],
          envVars: [
            { key: "DATABASE_URL", required: true, description: "Connection string for your PostgreSQL database" },
            { key: "DB_POOL_SIZE", required: false, description: "Maximum number of database connections in the pool", default: "10" },
            { key: "DB_TIMEOUT", required: false, description: "Database connection timeout in milliseconds", default: "5000" }
          ],
        },
        {
          name: "Filesystem MCP",
          slug: "filesystem-mcp",
          description: "Secure file system access with read/write operations, directory traversal, and file monitoring.",
          longDescription: "The Filesystem MCP provides secure and controlled access to file systems with comprehensive file operations, directory management, and real-time file monitoring capabilities.",
          maintainer: "MCP Core",
          version: "2.1.0",
          category: "File Systems",
          tags: ["filesystem", "files", "storage", "monitoring"],
          rating: 47,
          deploymentCount: 1823,
          icon: "FS",
          iconColor: "#0891B2",
          featured: true,
          envVars: [
            { key: "ROOT_PATH", required: true, description: "Root directory for file operations" },
            { key: "READONLY_MODE", required: false, description: "Enable read-only mode", default: "false" }
          ],
        },
        {
          name: "Slack MCP",
          slug: "slack-mcp",
          description: "Integrate with Slack workspaces, send messages, manage channels, and automate workflows.",
          longDescription: "The Slack MCP enables comprehensive Slack workspace integration with message sending, channel management, user interactions, and workflow automation capabilities.",
          maintainer: "Slack Team",
          version: "1.5.2",
          category: "Communication",
          tags: ["slack", "messaging", "communication", "automation"],
          rating: 48,
          deploymentCount: 945,
          icon: "SL",
          iconColor: "#7C3AED",
          featured: true,
          envVars: [
            { key: "SLACK_BOT_TOKEN", required: true, description: "Slack bot token for API access" },
            { key: "SLACK_SIGNING_SECRET", required: true, description: "Slack signing secret for webhook verification" }
          ],
        },
        {
          name: "GitHub MCP",
          slug: "github-mcp",
          description: "GitHub repository management and issue tracking integration.",
          maintainer: "GitHub",
          version: "2.0.1",
          category: "Development Tools",
          tags: ["github", "git", "repositories", "issues"],
          rating: 46,
          deploymentCount: 756,
          icon: "GH",
          iconColor: "#EF4444",
          featured: false,
          envVars: [
            { key: "GITHUB_TOKEN", required: true, description: "GitHub personal access token" }
          ],
        },
        {
          name: "MySQL MCP",
          slug: "mysql-mcp",
          description: "Connect to MySQL databases with query execution and management.",
          maintainer: "Oracle",
          version: "1.8.5",
          category: "Database",
          tags: ["mysql", "database", "sql"],
          rating: 45,
          deploymentCount: 623,
          icon: "MY",
          iconColor: "#3B82F6",
          featured: false,
          envVars: [
            { key: "MYSQL_CONNECTION_STRING", required: true, description: "MySQL connection string" }
          ],
        },
        {
          name: "MongoDB MCP",
          slug: "mongodb-mcp",
          description: "NoSQL database operations with document management and queries.",
          maintainer: "MongoDB",
          version: "1.3.7",
          category: "Database",
          tags: ["mongodb", "nosql", "documents"],
          rating: 44,
          deploymentCount: 534,
          icon: "MG",
          iconColor: "#10B981",
          featured: false,
          envVars: [
            { key: "MONGODB_URI", required: true, description: "MongoDB connection URI" }
          ],
        }
      ];

      for (const mcpData of defaultMcps) {
        await storage.createMcp(mcpData);
      }

      res.json({ message: "Default MCPs created successfully" });
    } catch (error) {
      console.error("Error seeding MCPs:", error);
      res.status(500).json({ message: "Failed to seed MCPs" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
