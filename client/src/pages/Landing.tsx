import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Server, Zap, Shield, Globe } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-teal-500/5">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-white font-bold text-2xl">M</span>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            MCP Market
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Deploy and manage Model Control Protocol servers with one-click simplicity. 
            Access a growing catalog of production-ready MCP implementations.
          </p>
          <Button size="lg" asChild>
            <a href="/api/login">Get Started</a>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">One-Click Deploy</h3>
              <p className="text-sm text-gray-600">Deploy MCP servers instantly with a single click</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-teal-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Server className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Managed Infrastructure</h3>
              <p className="text-sm text-gray-600">We handle the infrastructure so you can focus on your work</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Secure & Reliable</h3>
              <p className="text-sm text-gray-600">Enterprise-grade security and 99.9% uptime guarantee</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Globe className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Global Network</h3>
              <p className="text-sm text-gray-600">Deploy worldwide with our global infrastructure</p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to get started?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands of developers using MCP Market to deploy and manage their MCP servers.
          </p>
          <Button size="lg" asChild>
            <a href="/api/login">Sign In to Continue</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
