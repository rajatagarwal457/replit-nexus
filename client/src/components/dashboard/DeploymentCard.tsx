import { useState } from "react";
import { Deployment } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, Settings, RotateCcw, Square, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { EnvironmentVariablesModal } from "./EnvironmentVariablesModal";

interface DeploymentCardProps {
  deployment: Deployment;
  onStatusChange: (id: number, status: string) => void;
  onDelete: (id: number) => void;
  onUpdateEnvVars: (id: number, envVars: Record<string, string>) => void;
}

export function DeploymentCard({ deployment, onStatusChange, onDelete, onUpdateEnvVars }: DeploymentCardProps) {
  const [showEnvModal, setShowEnvModal] = useState(false);
  const { toast } = useToast();

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(deployment.url);
      toast({
        title: "Copied!",
        description: "URL copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy URL",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "bg-green-100 text-green-800";
      case "stopped":
        return "bg-gray-100 text-gray-800";
      case "error":
        return "bg-red-100 text-red-800";
      case "deploying":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case "running":
        return "bg-green-400";
      case "stopped":
        return "bg-gray-400";
      case "error":
        return "bg-red-400";
      case "deploying":
        return "bg-blue-400";
      default:
        return "bg-gray-400";
    }
  };

  const getInitials = (name: string | undefined) => {
    if (!name) return "MC";
    return name.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return `${Math.round(diffInHours * 60)} minutes ago`;
    } else if (diffInHours < 24) {
      return `${Math.round(diffInHours)} hours ago`;
    } else {
      return `${Math.round(diffInHours / 24)} days ago`;
    }
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ 
                  background: `linear-gradient(135deg, ${deployment.mcp?.iconColor || '#3B82F6'}, ${deployment.mcp?.iconColor || '#3B82F6'}DD)` 
                }}
              >
                <span className="text-white font-bold">
                  {deployment.mcp?.icon || getInitials(deployment.mcp?.name || deployment.name)}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{deployment.name}</h3>
                <p className="text-sm text-gray-500">{deployment.mcp?.version}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Badge className={`${getStatusColor(deployment.status || 'unknown')} border-0`}>
                <span className={`w-1.5 h-1.5 ${getStatusDot(deployment.status || 'unknown')} rounded-full mr-1.5`}></span>
                {deployment.status ? deployment.status.charAt(0).toUpperCase() + deployment.status.slice(1) : 'Unknown'}
              </Badge>

              <div className="flex items-center space-x-2">
                <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono max-w-xs truncate">
                  {deployment.url}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyUrl}
                  disabled={deployment.status !== "running"}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>

              <span className="text-sm text-gray-500">
                {deployment.createdAt ? formatDate(deployment.createdAt) : 'Unknown'}
              </span>

              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEnvModal(true)}
                >
                  <Settings className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onStatusChange(deployment.id, deployment.status === "running" ? "stopped" : "running")}
                  disabled={deployment.status === "error"}
                >
                  {deployment.status === "running" ? (
                    <Square className="w-4 h-4" />
                  ) : (
                    <RotateCcw className="w-4 h-4" />
                  )}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(deployment.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <EnvironmentVariablesModal
        deployment={deployment}
        open={showEnvModal}
        onOpenChange={setShowEnvModal}
        onSave={(envVars) => onUpdateEnvVars(deployment.id, envVars)}
      />
    </>
  );
}
