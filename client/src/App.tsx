import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { Switch, Route } from 'wouter';
import { AuthProvider } from '@/lib/auth';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { queryClient } from '@/lib/queryClient';
import { Sidebar } from '@/components/Sidebar';
import { ProjectList } from '@/components/ProjectList';
import Dashboard from "@/pages/dashboard";
import Login from "@/pages/login";
import ProjectDetail from "@/pages/project-detail";
import ClaimDetail from "@/pages/claim-detail";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";

// Projects page component
function ProjectsPage() {
  return (
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
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Projects</h2>
          <p className="text-gray-500 mb-4">Manage your construction projects and progress claims</p>
          <ProjectList />
        </div>
      </main>
    </div>
  );
}

// Claims page component
function ClaimsPage() {
  return (
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
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Claims</h2>
          <p className="text-gray-500 mb-4">Access projects to create progress claims</p>
          <ProjectList />
        </div>
      </main>
    </div>
  );
}

// Reports page component
function ReportsPage() {
  return (
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
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Reports</h1>
          <p className="text-gray-500 mb-4">Reports functionality coming soon</p>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-gray-500 text-center py-12">Reports functionality coming soon</p>
          </div>
        </div>
      </main>
    </div>
  );
}

// Dashboard with layout
function DashboardWithLayout() {
  return (
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
        <Dashboard />
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Switch>
            <Route path="/login" component={Login} />
            <Route path="/projects" component={ProjectsPage} />
            <Route path="/claims" component={ClaimsPage} />
            <Route path="/reports" component={ReportsPage} />
            <Route path="/settings" component={() => (
              <div className="flex min-h-screen bg-gray-50">
                <Sidebar />
                <main className="flex-1 ml-64">
                  <Settings />
                </main>
              </div>
            )} />
            <Route path="/project/:id" component={ProjectDetail} />
            <Route path="/project/:projectId/claim/:claimId" component={ClaimDetail} />
            <Route path="/" component={DashboardWithLayout} />
            <Route component={NotFound} />
          </Switch>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;