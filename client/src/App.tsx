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
    <div style={{ 
      backgroundColor: 'red', 
      minHeight: '100vh', 
      padding: '20px',
      color: 'white',
      fontSize: '24px'
    }}>
      <h1>EMERGENCY TEST - ClaimTrackR</h1>
      <p>If you can see this red page, React is working!</p>
      <div style={{ backgroundColor: 'blue', padding: '20px', margin: '20px 0' }}>
        This is a basic test without any complex routing or components.
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
