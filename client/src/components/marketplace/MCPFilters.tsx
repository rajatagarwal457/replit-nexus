import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Grid3X3, List } from "lucide-react";

interface MCPFiltersProps {
  onCategoryChange: (category: string) => void;
  onSortChange: (sort: string) => void;
  onViewChange: (view: "grid" | "list") => void;
  currentView: "grid" | "list";
}

export function MCPFilters({ onCategoryChange, onSortChange, onViewChange, currentView }: MCPFiltersProps) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSort, setSelectedSort] = useState("popular");

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    onCategoryChange(category);
  };

  const handleSortChange = (sort: string) => {
    setSelectedSort(sort);
    onSortChange(sort);
  };

  const popularTags = ["database", "filesystem", "api", "slack", "github"];

  return (
    <div className="mb-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-gray-700">Filter by:</span>
          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Database">Database</SelectItem>
              <SelectItem value="File Systems">File Systems</SelectItem>
              <SelectItem value="Communication">Communication</SelectItem>
              <SelectItem value="Development Tools">Development Tools</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedSort} onValueChange={handleSortChange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="deployments">Most Deployed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant={currentView === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => onViewChange("grid")}
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button
            variant={currentView === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => onViewChange("list")}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <span className="text-sm text-gray-600">Popular:</span>
        {popularTags.map((tag) => (
          <Badge
            key={tag}
            variant="outline"
            className="cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={() => {
              // This would trigger a search for the tag
              console.log(`Search for tag: ${tag}`);
            }}
          >
            {tag}
          </Badge>
        ))}
      </div>
    </div>
  );
}
