import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { Switch, Route, useLocation } from 'wouter';
import { AuthProvider } from '@/lib/auth';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { queryClient } from '@/lib/queryClient';

// Simple page components defined inline
function Dashboard() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
      <div className="bg-blue-100 border border-blue-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Welcome to ClaimTrackR</h2>
        <p className="text-gray-700 mb-4">Construction Progress Claim Management System</p>
        <a href="/projects" className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          Go to Projects
        </a>
      </div>
    </div>
  );
}

function Projects() {
  const [showForm, setShowForm] = React.useState(false);
  const [projects, setProjects] = React.useState([]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const projectData = {
      name: formData.get('name'),
      description: formData.get('description'),
      clientName: formData.get('clientName'),
      totalValue: formData.get('totalValue'),
      startDate: formData.get('startDate'),
      endDate: formData.get('endDate'),
      status: 'active'
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
        e.target.reset();
      }
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Projects</h1>
      <div className="bg-green-100 border border-green-200 rounded-lg p-4 mb-6">
        <p className="text-green-800 font-medium">✓ Projects page loaded successfully!</p>
      </div>
      
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Your Projects</h2>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            {showForm ? 'Cancel' : '+ New Project'}
          </button>
        </div>

        {showForm && (
          <div className="mb-6 p-6 bg-gray-50 rounded-lg border">
            <h3 className="text-lg font-medium mb-4">Create New Project</h3>
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
                  rows="3" 
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
                    <h3 className="text-lg font-medium text-gray-900">{project.name}</h3>
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
  );
}

function Claims() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Claims</h1>
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <p className="text-gray-500 text-center py-12">Create a project first to submit progress claims</p>
      </div>
    </div>
  );
}

function Reports() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Reports</h1>
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <p className="text-gray-500 text-center py-12">Reports functionality coming soon</p>
      </div>
    </div>
  );
}

// Simple sidebar component
function Sidebar() {
  const [location] = useLocation();
  
  const navItems = [
    { path: '/', label: 'Dashboard' },
    { path: '/projects', label: 'Projects' },
    { path: '/claims', label: 'Claims' },
    { path: '/reports', label: 'Reports' },
  ];

  return (
    <aside className="w-64 bg-white shadow-lg border-r border-gray-200 fixed h-full">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">ClaimTrackR</h1>
        <p className="text-sm text-gray-500">Progress Claims</p>
      </div>
      <nav className="p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <a 
                href={item.path}
                className={`block px-3 py-2 rounded-lg transition-colors ${
                  location === item.path
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

function Router() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 ml-64">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/projects" component={Projects} />
          <Route path="/claims" component={Claims} />
          <Route path="/reports" component={Reports} />
          <Route>
            <div className="p-6">
              <h1 className="text-2xl font-bold text-gray-900">Page Not Found</h1>
              <p className="text-gray-500 mt-2">The page you're looking for doesn't exist.</p>
              <a href="/" className="text-blue-600 hover:text-blue-700 mt-4 inline-block">Go to Dashboard</a>
            </div>
          </Route>
        </Switch>
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
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;