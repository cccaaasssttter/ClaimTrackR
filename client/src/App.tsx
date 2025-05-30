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
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Projects</h1>
      <div className="bg-green-100 border border-green-200 rounded-lg p-4 mb-6">
        <p className="text-green-800 font-medium">✓ Projects page loaded successfully!</p>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Your Projects</h2>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            + New Project
          </button>
        </div>
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">No projects created yet</p>
          <p>Click "New Project" to get started with your first construction project</p>
        </div>
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