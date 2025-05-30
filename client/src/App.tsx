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
                  <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Projects</h2>
                    <p className="text-gray-500 mb-4">Manage your construction projects and progress claims</p>
                    <div className="bg-green-100 border border-green-200 rounded-lg p-4 mb-4">
                      <p className="text-green-800">Projects page is loading correctly!</p>
                    </div>
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Project List</h3>
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                          New Project
                        </button>
                      </div>
                      <div className="text-gray-500 text-center py-8">
                        <p>No projects created yet. Click "New Project" to get started.</p>
                      </div>
                    </div>
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
