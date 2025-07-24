export interface MCPServer {
  id: number;
  name: string;
  slug: string;
  description: string;
  longDescription?: string;
  maintainer: string;
  maintainerAvatar?: string;
  version: string;
  category: string;
  tags: string[];
  rating: number;
  deploymentCount: number;
  icon?: string;
  iconColor?: string;
  featured: boolean;
  documentation?: string;
  screenshots: string[];
  envVars: EnvVar[];
  createdAt?: string;
  updatedAt?: string;
}

export interface EnvVar {
  key: string;
  required: boolean;
  description: string;
  default?: string;
}

export interface Deployment {
  id: number;
  userId: string;
  mcpId: number;
  name: string;
  url: string;
  status: 'running' | 'stopped' | 'error' | 'deploying';
  envVars: Record<string, string>;
  mcp?: MCPServer;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
}
