import { useState } from "react";
import { MCPServer } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import { MCPDetailModal } from "./MCPDetailModal";
import { DeploymentConfirmationModal } from "../dashboard/DeploymentConfirmationModal";

interface MCPCardProps {
  mcp: MCPServer;
  onDeploy?: (mcpId: number, envVars: Record<string, string>) => void;
  size?: "small" | "large";
}

export function MCPCard({ mcp, onDeploy, size = "small" }: MCPCardProps) {
  const [showDetail, setShowDetail] = useState(false);
  const [showDeployModal, setShowDeployModal] = useState(false);

  const handleDeploy = (envVars: Record<string, string>) => {
    onDeploy?.(mcp.id, envVars);
    setShowDeployModal(false);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase();
  };

  const formatDeploymentCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  const formatRating = (rating: number) => {
    return (rating / 10).toFixed(1);
  };

  if (size === "large") {
    return (
      <>
        <Card className="hover:shadow-lg transition-all duration-200 hover:border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ 
                    background: `linear-gradient(135deg, ${mcp.iconColor || '#3B82F6'}, ${mcp.iconColor || '#3B82F6'}DD)` 
                  }}
                >
                  <span className="text-white font-bold">
                    {mcp.icon || getInitials(mcp.name)}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{mcp.name}</h3>
                  <p className="text-sm text-gray-500">by {mcp.maintainer}</p>
                </div>
              </div>
              {mcp.featured && (
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  Featured
                </Badge>
              )}
            </div>
            
            <p className="text-gray-600 text-sm mb-4">{mcp.description}</p>
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span className="flex items-center space-x-1">
                  <Star className="w-4 h-4 fill-current text-yellow-400" />
                  <span>{formatRating(mcp.rating)}</span>
                </span>
                <span>{formatDeploymentCount(mcp.deploymentCount)} deploys</span>
              </div>
              <div className="flex space-x-1">
                {mcp.tags.slice(0, 2).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button 
                className="flex-1" 
                onClick={() => setShowDeployModal(true)}
              >
                Deploy Now
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowDetail(true)}
              >
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>

        <MCPDetailModal 
          mcp={mcp}
          open={showDetail}
          onOpenChange={setShowDetail}
          onDeploy={() => setShowDeployModal(true)}
        />
        
        <DeploymentConfirmationModal
          mcp={mcp}
          open={showDeployModal}
          onOpenChange={setShowDeployModal}
          onConfirm={handleDeploy}
        />
      </>
    );
  }

  return (
    <>
      <Card className="hover:shadow-md transition-all duration-200 hover:border-primary/20">
        <CardContent className="p-5">
          <div className="flex items-center space-x-3 mb-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ 
                background: `linear-gradient(135deg, ${mcp.iconColor || '#3B82F6'}, ${mcp.iconColor || '#3B82F6'}DD)` 
              }}
            >
              <span className="text-white font-bold text-sm">
                {mcp.icon || getInitials(mcp.name)}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">{mcp.name}</h3>
              <p className="text-xs text-gray-500">by {mcp.maintainer}</p>
            </div>
          </div>
          
          <p className="text-gray-600 text-sm mb-4">{mcp.description}</p>
          
          <div className="flex items-center justify-between mb-4 text-xs text-gray-500">
            <span className="flex items-center space-x-1">
              <Star className="w-3 h-3 fill-current text-yellow-400" />
              <span>{formatRating(mcp.rating)}</span>
            </span>
            <span>{formatDeploymentCount(mcp.deploymentCount)} deploys</span>
          </div>
          
          <Button 
            className="w-full" 
            size="sm"
            onClick={() => setShowDeployModal(true)}
          >
            Deploy
          </Button>
        </CardContent>
      </Card>

      <MCPDetailModal 
        mcp={mcp}
        open={showDetail}
        onOpenChange={setShowDetail}
        onDeploy={() => setShowDeployModal(true)}
      />
      
      <DeploymentConfirmationModal
        mcp={mcp}
        open={showDeployModal}
        onOpenChange={setShowDeployModal}
        onConfirm={handleDeploy}
      />
    </>
  );
}
