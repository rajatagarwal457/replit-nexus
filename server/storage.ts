import {
  users,
  mcps,
  deployments,
  type User,
  type UpsertUser,
  type Mcp,
  type InsertMcp,
  type Deployment,
  type InsertDeployment,
  type DeploymentWithMcp,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, ilike, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // MCP operations
  getAllMcps(): Promise<Mcp[]>;
  getMcpBySlug(slug: string): Promise<Mcp | undefined>;
  getMcpById(id: number): Promise<Mcp | undefined>;
  searchMcps(query: string): Promise<Mcp[]>;
  getFeaturedMcps(): Promise<Mcp[]>;
  createMcp(mcp: InsertMcp): Promise<Mcp>;
  incrementDeploymentCount(mcpId: number): Promise<void>;
  
  // Deployment operations
  getUserDeployments(userId: string): Promise<DeploymentWithMcp[]>;
  getDeploymentById(id: number): Promise<Deployment | undefined>;
  createDeployment(deployment: InsertDeployment): Promise<Deployment>;
  updateDeploymentStatus(id: number, status: string): Promise<void>;
  updateDeploymentEnvVars(id: number, envVars: Record<string, string>): Promise<void>;
  deleteDeployment(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // MCP operations
  async getAllMcps(): Promise<Mcp[]> {
    return await db.select().from(mcps).orderBy(desc(mcps.featured), desc(mcps.deploymentCount));
  }

  async getMcpBySlug(slug: string): Promise<Mcp | undefined> {
    const [mcp] = await db.select().from(mcps).where(eq(mcps.slug, slug));
    return mcp;
  }

  async getMcpById(id: number): Promise<Mcp | undefined> {
    const [mcp] = await db.select().from(mcps).where(eq(mcps.id, id));
    return mcp;
  }

  async searchMcps(query: string): Promise<Mcp[]> {
    return await db
      .select()
      .from(mcps)
      .where(
        sql`${mcps.name} ILIKE ${`%${query}%`} OR ${mcps.description} ILIKE ${`%${query}%`} OR ${query} = ANY(${mcps.tags})`
      )
      .orderBy(desc(mcps.featured), desc(mcps.deploymentCount));
  }

  async getFeaturedMcps(): Promise<Mcp[]> {
    return await db
      .select()
      .from(mcps)
      .where(eq(mcps.featured, true))
      .orderBy(desc(mcps.deploymentCount))
      .limit(6);
  }

  async createMcp(mcpData: InsertMcp): Promise<Mcp> {
    const [mcp] = await db.insert(mcps).values(mcpData).returning();
    return mcp;
  }

  async incrementDeploymentCount(mcpId: number): Promise<void> {
    await db
      .update(mcps)
      .set({
        deploymentCount: sql`${mcps.deploymentCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(mcps.id, mcpId));
  }

  // Deployment operations
  async getUserDeployments(userId: string): Promise<DeploymentWithMcp[]> {
    const results = await db
      .select({
        id: deployments.id,
        userId: deployments.userId,
        mcpId: deployments.mcpId,
        name: deployments.name,
        url: deployments.url,
        status: deployments.status,
        envVars: deployments.envVars,
        createdAt: deployments.createdAt,
        updatedAt: deployments.updatedAt,
        mcp: {
          id: mcps.id,
          name: mcps.name,
          slug: mcps.slug,
          description: mcps.description,
          maintainer: mcps.maintainer,
          version: mcps.version,
          category: mcps.category,
          tags: mcps.tags,
          rating: mcps.rating,
          deploymentCount: mcps.deploymentCount,
          icon: mcps.icon,
          iconColor: mcps.iconColor,
          featured: mcps.featured,
          envVars: mcps.envVars
        }
      })
      .from(deployments)
      .leftJoin(mcps, eq(deployments.mcpId, mcps.id))
      .where(eq(deployments.userId, userId))
      .orderBy(desc(deployments.createdAt));
    
    return results as DeploymentWithMcp[];
  }

  async getDeploymentById(id: number): Promise<Deployment | undefined> {
    const [deployment] = await db.select().from(deployments).where(eq(deployments.id, id));
    return deployment;
  }

  async createDeployment(deploymentData: InsertDeployment): Promise<Deployment> {
    const [deployment] = await db.insert(deployments).values(deploymentData).returning();
    return deployment;
  }

  async updateDeploymentStatus(id: number, status: string): Promise<void> {
    await db
      .update(deployments)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(deployments.id, id));
  }

  async updateDeploymentEnvVars(id: number, envVars: Record<string, string>): Promise<void> {
    await db
      .update(deployments)
      .set({
        envVars,
        updatedAt: new Date(),
      })
      .where(eq(deployments.id, id));
  }

  async deleteDeployment(id: number): Promise<void> {
    await db.delete(deployments).where(eq(deployments.id, id));
  }
}

export const storage = new DatabaseStorage();
