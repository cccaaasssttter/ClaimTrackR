import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";
import { AuthGuard } from "@/components/AuthGuard";
import { Sidebar } from "@/components/Sidebar";
import { ProjectList } from "@/components/ProjectList";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import ProjectDetail from "@/pages/project-detail";
import ClaimDetail from "@/pages/claim-detail";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <div className="min-h-screen bg-red-100 p-8">
      <h1 className="text-4xl font-bold text-red-900 mb-4">ClaimTrackR Test</h1>
      <div className="bg-white p-6 rounded shadow">
        <p className="text-lg">This is a test page to verify the app is loading.</p>
        <p className="mt-2">If you can see this, React is working!</p>
        <div className="mt-4 space-y-2">
          <div className="bg-blue-100 p-2 rounded">Dashboard should work</div>
          <div className="bg-green-100 p-2 rounded">Projects should work</div>
          <div className="bg-yellow-100 p-2 rounded">Claims should work</div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
