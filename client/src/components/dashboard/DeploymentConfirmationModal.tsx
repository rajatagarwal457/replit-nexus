import { useState } from "react";
import { MCPServer } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Server } from "lucide-react";

interface DeploymentConfirmationModalProps {
  mcp: MCPServer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (envVars: Record<string, string>) => void;
}

export function DeploymentConfirmationModal({ mcp, open, onOpenChange, onConfirm }: DeploymentConfirmationModalProps) {
  const [envVars, setEnvVars] = useState<Record<string, string>>({});

  const handleConfirm = () => {
    // Validate required environment variables
    const missingRequired = mcp.envVars
      .filter(envVar => envVar.required)
      .filter(envVar => !envVars[envVar.key]);

    if (missingRequired.length > 0) {
      alert(`Please provide values for required environment variables: ${missingRequired.map(e => e.key).join(', ')}`);
      return;
    }

    onConfirm(envVars);
  };

  const updateEnvVar = (key: string, value: string) => {
    setEnvVars({ ...envVars, [key]: value });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Server className="w-6 h-6 text-primary" />
            </div>
            <div>
              <DialogTitle>Deploy {mcp.name}?</DialogTitle>
              <p className="text-sm text-gray-600">This will create a new deployment instance</p>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Estimated deploy time:</span>
                <span className="font-medium">~2 seconds</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Resource usage:</span>
                <span className="font-medium">Low</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Monthly cost:</span>
                <span className="font-medium text-green-600">Free</span>
              </div>
            </div>
          </div>

          {/* Environment Variables */}
          {mcp.envVars.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-900">Environment Variables</h4>
              {mcp.envVars.map((envVar) => (
                <div key={envVar.key} className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor={envVar.key} className="text-sm font-medium">
                      {envVar.key}
                    </Label>
                    <Badge variant={envVar.required ? "destructive" : "secondary"}>
                      {envVar.required ? "Required" : "Optional"}
                    </Badge>
                  </div>
                  <Input
                    id={envVar.key}
                    type={envVar.key.toLowerCase().includes("secret") || 
                          envVar.key.toLowerCase().includes("token") || 
                          envVar.key.toLowerCase().includes("password") ? "password" : "text"}
                    placeholder={envVar.default || `Enter ${envVar.key}`}
                    value={envVars[envVar.key] || ""}
                    onChange={(e) => updateEnvVar(envVar.key, e.target.value)}
                    className="font-mono text-sm"
                  />
                  {envVar.description && (
                    <p className="text-xs text-gray-500">{envVar.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>
            Deploy Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
