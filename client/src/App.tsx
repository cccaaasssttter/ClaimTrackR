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
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/">
        <AuthGuard>
          <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <main className="flex-1 ml-64">
              <header className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
                    <p className="text-sm text-gray-500 mt-1">Manage your progress claims and projects</p>
                  </div>
                </div>
              </header>
              <Switch>
                <Route path="/" component={Dashboard} />
                <Route path="/projects">
                  <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Projects</h2>
                    <ProjectList />
                  </div>
                </Route>
                <Route path="/claims" component={() => <div className="p-6"><ProjectList /></div>} />
                <Route path="/reports" component={() => <div className="p-6"><h2 className="text-2xl font-bold text-gray-900">Reports</h2><p className="text-gray-500 mt-2">Reports functionality coming soon</p></div>} />
                <Route path="/project/:id" component={ProjectDetail} />
                <Route path="/project/:projectId/claim/:claimId" component={ClaimDetail} />
                <Route component={NotFound} />
              </Switch>
            </main>
          </div>
        </AuthGuard>
      </Route>
    </Switch>
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
