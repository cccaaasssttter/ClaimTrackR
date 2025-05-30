import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { Switch, Route } from 'wouter';
import { AuthProvider } from '@/lib/auth';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { queryClient } from '@/lib/queryClient';
import { Sidebar } from '@/components/Sidebar';
import Dashboard from "@/pages/dashboard";
import Login from "@/pages/login";
import ProjectDetail from "@/pages/project-detail";
import ClaimDetail from "@/pages/claim-detail";
import NotFound from "@/pages/not-found";

// Projects page component
function ProjectsPage() {
  const [showForm, setShowForm] = React.useState(false);
  const [projects, setProjects] = React.useState<any[]>([]);

  const handleCreateProject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const projectData = {
      name: formData.get('name'),
      description: formData.get('description'),
      clientName: formData.get('clientName'),
      totalValue: formData.get('totalValue'),
      startDate: formData.get('startDate'),
      endDate: formData.get('endDate'),
      status: 'active',
      createdBy: '550e8400-e29b-41d4-a716-446655440000'
    };

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData)
      });
      
      if (response.ok) {
        const newProject = await response.json();
        setProjects([...projects, newProject]);
        setShowForm(false);
        e.currentTarget.reset();
      }
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

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
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Projects</h1>
          <p className="text-gray-500 mb-4">Manage your construction projects and progress claims</p>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Your Projects</h3>
              <button 
                onClick={() => setShowForm(!showForm)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                {showForm ? 'Cancel' : '+ New Project'}
              </button>
            </div>

            {showForm && (
              <div className="mb-6 p-6 bg-gray-50 rounded-lg border">
                <h4 className="text-lg font-medium mb-4">Create New Project</h4>
                <form onSubmit={handleCreateProject} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                      <input 
                        name="name" 
                        type="text" 
                        required 
                        placeholder="Drake Building Construction"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
                      <input 
                        name="clientName" 
                        type="text" 
                        required 
                        placeholder="ABC Construction Ltd"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Contract Value</label>
                      <input 
                        name="totalValue" 
                        type="number" 
                        required 
                        placeholder="1500000"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                      <input 
                        name="startDate" 
                        type="date" 
                        required 
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                      <input 
                        name="endDate" 
                        type="date" 
                        required 
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea 
                      name="description" 
                      rows={3}
                      placeholder="Commercial building construction project..."
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    ></textarea>
                  </div>
                  <div className="flex space-x-3">
                    <button 
                      type="submit" 
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                    >
                      Create Project
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setShowForm(false)}
                      className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {projects.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg">No projects created yet</p>
                <p>Click "New Project" to get started with your first construction project</p>
              </div>
            ) : (
              <div className="space-y-4">
                {projects.map((project, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">{project.name}</h4>
                        <p className="text-gray-600">{project.description}</p>
                        <p className="text-sm text-gray-500 mt-1">Client: {project.clientName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-green-600">
                          ${parseInt(project.totalValue).toLocaleString()}
                        </p>
                        <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          {project.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Claims</h1>
          <p className="text-gray-500 mb-4">Access projects to create progress claims</p>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-gray-500 text-center py-12">Create a project first to submit progress claims</p>
          </div>
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