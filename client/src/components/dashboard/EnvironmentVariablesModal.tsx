import { useState, useEffect } from "react";
import { Deployment, EnvVar } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Plus, Download, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EnvironmentVariablesModalProps {
  deployment: Deployment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (envVars: Record<string, string>) => void;
}

export function EnvironmentVariablesModal({ deployment, open, onOpenChange, onSave }: EnvironmentVariablesModalProps) {
  const [envVars, setEnvVars] = useState<Record<string, string>>({});
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      setEnvVars(deployment.envVars || {});
    }
  }, [open, deployment.envVars]);

  const handleSave = () => {
    onSave(envVars);
    onOpenChange(false);
    toast({
      title: "Success",
      description: "Environment variables updated successfully",
    });
  };

  const addEnvVar = () => {
    if (newKey && newValue) {
      setEnvVars({ ...envVars, [newKey]: newValue });
      setNewKey("");
      setNewValue("");
    }
  };

  const removeEnvVar = (key: string) => {
    const newEnvVars = { ...envVars };
    delete newEnvVars[key];
    setEnvVars(newEnvVars);
  };

  const updateEnvVar = (key: string, value: string) => {
    setEnvVars({ ...envVars, [key]: value });
  };

  const exportEnvVars = () => {
    const dataStr = JSON.stringify(envVars, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${deployment.name}-env-vars.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importEnvVars = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string);
          setEnvVars({ ...envVars, ...imported });
          toast({
            title: "Success",
            description: "Environment variables imported successfully",
          });
        } catch (error) {
          toast({
            title: "Error",
            description: "Invalid JSON file",
            variant: "destructive",
          });
        }
      };
      reader.readAsText(file);
    }
  };

  const getEnvVarInfo = (key: string): EnvVar | undefined => {
    return deployment.mcp?.envVars.find(envVar => envVar.key === key);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Environment Variables</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto space-y-4">
          <p className="text-sm text-gray-600">
            Configure environment variables for your {deployment.name} deployment.
          </p>
          
          {/* Existing Environment Variables */}
          <div className="space-y-4">
            {Object.entries(envVars).map(([key, value]) => {
              const envVarInfo = getEnvVarInfo(key);
              return (
                <div key={key} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">{key}</Label>
                      {envVarInfo && (
                        <Badge 
                          variant={envVarInfo.required ? "destructive" : "secondary"}
                          className="ml-2"
                        >
                          {envVarInfo.required ? "Required" : "Optional"}
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeEnvVar(key)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <Input
                    type={key.toLowerCase().includes("secret") || key.toLowerCase().includes("token") || key.toLowerCase().includes("password") ? "password" : "text"}
                    value={value}
                    onChange={(e) => updateEnvVar(key, e.target.value)}
                    className="font-mono text-sm"
                  />
                  {envVarInfo?.description && (
                    <p className="mt-1 text-xs text-gray-500">{envVarInfo.description}</p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add New Variable */}
          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Add New Variable</h4>
            <div className="grid grid-cols-2 gap-3">
              <Input
                placeholder="Variable name"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
              />
              <Input
                placeholder="Variable value"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
              />
            </div>
            <Button
              onClick={addEnvVar}
              disabled={!newKey || !newValue}
              className="mt-3"
              variant="outline"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Variable
            </Button>
          </div>
        </div>

        <DialogFooter className="border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={exportEnvVars}>
                <Download className="w-4 h-4 mr-2" />
                Export JSON
              </Button>
              <Button variant="outline" asChild>
                <label>
                  <Upload className="w-4 h-4 mr-2" />
                  Import JSON
                  <input
                    type="file"
                    accept=".json"
                    onChange={importEnvVars}
                    className="hidden"
                  />
                </label>
              </Button>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
