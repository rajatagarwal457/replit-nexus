import { MCPServer } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, CheckCircle } from "lucide-react";

interface MCPDetailModalProps {
  mcp: MCPServer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeploy: () => void;
}

export function MCPDetailModal({ mcp, open, onOpenChange, onDeploy }: MCPDetailModalProps) {
  const formatRating = (rating: number) => {
    return (rating / 10).toFixed(1);
  };

  const formatDeploymentCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mcp.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start space-x-4">
            <div 
              className="w-16 h-16 rounded-xl flex items-center justify-center"
              style={{ 
                background: `linear-gradient(135deg, ${mcp.iconColor || '#3B82F6'}, ${mcp.iconColor || '#3B82F6'}DD)` 
              }}
            >
              <span className="text-white font-bold text-xl">
                {mcp.icon || getInitials(mcp.name)}
              </span>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{mcp.name}</h1>
              <p className="text-gray-600 mb-4">{mcp.longDescription || mcp.description}</p>
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <span className="flex items-center space-x-1">
                  <Star className="w-4 h-4 fill-current text-yellow-400" />
                  <span>{formatRating(mcp.rating)} (127 reviews)</span>
                </span>
                <span>{formatDeploymentCount(mcp.deploymentCount)} deployments</span>
                <span>Updated 2 days ago</span>
              </div>
            </div>
            <Button onClick={onDeploy}>
              Deploy Now
            </Button>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="documentation">Documentation</TabsTrigger>
              <TabsTrigger value="screenshots">Screenshots</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  {/* Features */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Features</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Full API Access</h4>
                          <p className="text-sm text-gray-600">Complete access to all features</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Secure Connection</h4>
                          <p className="text-sm text-gray-600">Encrypted and secure communication</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">High Performance</h4>
                          <p className="text-sm text-gray-600">Optimized for speed and efficiency</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">24/7 Monitoring</h4>
                          <p className="text-sm text-gray-600">Continuous health monitoring</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Environment Variables */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Environment Variables</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="space-y-3">
                        {mcp.envVars.map((envVar) => (
                          <div key={envVar.key} className="flex items-center justify-between">
                            <code className="text-sm font-mono text-gray-700">{envVar.key}</code>
                            <Badge variant={envVar.required ? "destructive" : "secondary"}>
                              {envVar.required ? "Required" : "Optional"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Maintainer Info */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Maintainer</h4>
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={mcp.maintainerAvatar} alt={mcp.maintainer} />
                        <AvatarFallback>{mcp.maintainer[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-gray-900">{mcp.maintainer}</p>
                        <p className="text-sm text-gray-600">@{mcp.maintainer.toLowerCase().replace(' ', '-')}</p>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Statistics</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Deployments</span>
                        <span className="font-medium">{formatDeploymentCount(mcp.deploymentCount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Success Rate</span>
                        <span className="font-medium text-green-600">99.2%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Avg. Deploy Time</span>
                        <span className="font-medium">1.2s</span>
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {mcp.tags.map((tag) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="documentation">
              <div className="prose max-w-none">
                {mcp.documentation ? (
                  <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-lg">
                    {mcp.documentation}
                  </pre>
                ) : (
                  <p className="text-gray-500">No documentation available.</p>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="screenshots">
              <div className="text-center text-gray-500 py-8">
                No screenshots available for this MCP.
              </div>
            </TabsContent>
            
            <TabsContent value="reviews">
              <div className="text-center text-gray-500 py-8">
                Reviews feature coming soon.
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
