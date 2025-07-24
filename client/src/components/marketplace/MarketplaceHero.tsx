import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface MarketplaceHeroProps {
  onSearch: (query: string) => void;
}

export function MarketplaceHero({ onSearch }: MarketplaceHeroProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <div className="bg-gradient-to-br from-primary/5 to-teal-500/5 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Deploy MCP Servers in Seconds
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Browse, deploy, and manage Model Control Protocol servers with one-click simplicity. 
            Access a growing catalog of production-ready MCP implementations.
          </p>
          
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto relative">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search MCP servers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white shadow-sm"
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
