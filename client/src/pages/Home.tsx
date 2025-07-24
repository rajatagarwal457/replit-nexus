import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MCPServer } from "@/types";
import { Navigation } from "@/components/layout/Navigation";
import { MarketplaceHero } from "@/components/marketplace/MarketplaceHero";
import { MCPFilters } from "@/components/marketplace/MCPFilters";
import { MCPCard } from "@/components/marketplace/MCPCard";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filteredMcps, setFilteredMcps] = useState<MCPServer[]>([]);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch MCPs
  const { data: mcps = [], isLoading } = useQuery({
    queryKey: ["/api/mcps"],
    retry: false,
  });

  // Fetch featured MCPs
  const { data: featuredMcps = [] } = useQuery({
    queryKey: ["/api/mcps", "featured=true"],
    retry: false,
  });

  // Deploy mutation
  const deployMutation = useMutation({
    mutationFn: async ({ mcpId, envVars }: { mcpId: number; envVars: Record<string, string> }) => {
      const response = await apiRequest("POST", "/api/deployments", { mcpId, envVars });
      return response.json();
    },
    onSuccess: (deployment) => {
      toast({
        title: "Deployment Started!",
        description: `Your MCP is being deployed at ${deployment.url}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/deployments"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Deployment Failed",
        description: error.message || "Failed to deploy MCP",
        variant: "destructive",
      });
    },
  });

  // Seed MCPs mutation (for initial setup)
  const seedMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/seed-mcps");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mcps"] });
    },
  });

  // Initialize default MCPs if needed
  useEffect(() => {
    if (mcps.length === 0 && !isLoading) {
      seedMutation.mutate();
    }
  }, [mcps, isLoading]);

  // Filter and sort MCPs
  useEffect(() => {
    let filtered = [...mcps];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (mcp) =>
          mcp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          mcp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          mcp.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Category filter
    if (category !== "all") {
      filtered = filtered.filter((mcp) => mcp.category === category);
    }

    // Sort
    switch (sortBy) {
      case "popular":
        filtered.sort((a, b) => b.deploymentCount - a.deploymentCount);
        break;
      case "newest":
        filtered.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
        break;
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "deployments":
        filtered.sort((a, b) => b.deploymentCount - a.deploymentCount);
        break;
    }

    setFilteredMcps(filtered);
  }, [mcps, searchQuery, category, sortBy]);

  const handleDeploy = (mcpId: number, envVars: Record<string, string>) => {
    deployMutation.mutate({ mcpId, envVars });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading marketplace...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <MarketplaceHero onSearch={setSearchQuery} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <MCPFilters
          onCategoryChange={setCategory}
          onSortChange={setSortBy}
          onViewChange={setViewMode}
          currentView={viewMode}
        />

        {/* Featured MCPs */}
        {featuredMcps.length > 0 && !searchQuery && category === "all" && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured MCPs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredMcps.map((mcp) => (
                <MCPCard
                  key={mcp.id}
                  mcp={mcp}
                  onDeploy={handleDeploy}
                  size="large"
                />
              ))}
            </div>
          </div>
        )}

        {/* All MCPs */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {searchQuery ? "Search Results" : "All MCP Servers"}
            </h2>
            <span className="text-sm text-gray-500">
              Showing {filteredMcps.length} result{filteredMcps.length !== 1 ? 's' : ''}
            </span>
          </div>
          
          {filteredMcps.length > 0 ? (
            <div className={`grid gap-6 ${
              viewMode === "grid" 
                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
                : "grid-cols-1"
            }`}>
              {filteredMcps.map((mcp) => (
                <MCPCard
                  key={mcp.id}
                  mcp={mcp}
                  onDeploy={handleDeploy}
                  size={viewMode === "list" ? "large" : "small"}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No MCPs found matching your criteria.</p>
              {searchQuery && (
                <Button variant="outline" onClick={() => setSearchQuery("")}>
                  Clear Search
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
