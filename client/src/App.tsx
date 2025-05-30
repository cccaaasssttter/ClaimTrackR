import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { Switch, Route, useLocation } from 'wouter';
import { AuthProvider } from '@/lib/auth';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { queryClient } from '@/lib/queryClient';
import { ProjectList } from '@/components/ProjectList';
import { Sidebar } from '@/components/Sidebar';
import Dashboard from "@/pages/dashboard";
import Login from "@/pages/login";
import ProjectDetail from "@/pages/project-detail";
import ClaimDetail from "@/pages/claim-detail";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/">
        <div className="flex min-h-screen bg-gray-50">
          <Sidebar />
          <main className="flex-1 ml-64">
            <header className="bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">ClaimTrackR</h2>
                  <p className="text-sm text-gray-500 mt-1">Progress Claim Management System</p>
                </div>
              </div>
            </header>
            <div className="p-6">
              <Switch>
                <Route path="/" component={Dashboard} />
                <Route path="/projects">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Projects</h2>
                    <p className="text-gray-500 mb-4">Manage your construction projects and progress claims</p>
                    <ProjectList />
                  </div>
                </Route>
                <Route path="/claims">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Claims</h2>
                    <p className="text-gray-500 mb-4">Access projects to create progress claims</p>
                    <ProjectList />
                  </div>
                </Route>
                <Route path="/reports">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Reports</h2>
                    <p className="text-gray-500 mb-4">Reports functionality coming soon</p>
                  </div>
                </Route>
                <Route path="/project/:id" component={ProjectDetail} />
                <Route path="/project/:projectId/claim/:claimId" component={ClaimDetail} />
                <Route component={NotFound} />
              </Switch>
            </div>
          </main>
        </div>
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