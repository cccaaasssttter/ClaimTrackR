import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { type Project, type Claim } from '@shared/schema';

export default function Dashboard() {
  const { data: projects } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
    queryFn: async () => {
      const res = await fetch('/api/projects');
      if (!res.ok) throw new Error('Failed to load projects');
      return res.json();
    },
  });

  const { data: recentClaims } = useQuery<Claim[]>({
    queryKey: ['/api/claims/recent'],
    queryFn: async () => {
      const res = await fetch('/api/claims/recent');
      if (!res.ok) throw new Error('Failed to load recent claims');
      return res.json();
    },
  });

  const stats = {
    activeProjects: projects?.filter(p => p.status === 'active').length || 0,
    pendingClaims: recentClaims?.filter(c => c.status === 'pending').length || 0,
    totalValue: projects?.reduce((sum, p) => sum + parseFloat(p.totalValue), 0) || 0,
    completionRate: 68, // This would be calculated from actual claim data
  };

  return (
    <div className="p-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Projects</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.activeProjects}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <i className="fas fa-folder-open text-blue-600 text-xl"></i>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600 font-medium">+2.5%</span>
            <span className="text-gray-500 ml-2">vs last month</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Claims</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.pendingClaims}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <i className="fas fa-clock text-yellow-600 text-xl"></i>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-yellow-600 font-medium">{stats.pendingClaims} urgent</span>
            <span className="text-gray-500 ml-2">require attention</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                ${(stats.totalValue / 1000000).toFixed(1)}M
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <i className="fas fa-dollar-sign text-green-600 text-xl"></i>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600 font-medium">+12.3%</span>
            <span className="text-gray-500 ml-2">this quarter</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completion Rate</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.completionRate}%</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <i className="fas fa-chart-line text-purple-600 text-xl"></i>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-purple-600 font-medium">On track</span>
            <span className="text-gray-500 ml-2">average progress</span>
          </div>
        </div>
      </div>

      {/* Recent Projects & Claims */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Projects */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Recent Projects</h3>
              <Link href="/projects" className="text-primary-500 hover:text-primary-600 text-sm font-medium">
                View all
              </Link>
            </div>
          </div>
          <div className="p-6">
            {projects && projects.length === 0 ? (
              <div className="text-center py-8">
                <i className="fas fa-folder text-4xl text-gray-300 mb-4"></i>
                <h4 className="text-lg font-medium text-gray-900">No projects yet</h4>
                <p className="text-gray-500">Create your first project to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {projects?.slice(0, 3).map((project) => (
                  <Link key={project.id} href={`/project/${project.id}`}>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{project.name}</h4>
                        <p className="text-sm text-gray-500 mt-1">{project.description}</p>
                      </div>
                      <div className="ml-4 text-right">
                        <p className="font-semibold text-gray-900">
                          ${parseFloat(project.totalValue).toLocaleString()}
                        </p>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                          {project.status}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Claims */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Recent Claims</h3>
              <Link href="/claims" className="text-primary-500 hover:text-primary-600 text-sm font-medium">
                View all
              </Link>
            </div>
          </div>
          <div className="p-6">
            {recentClaims && recentClaims.length === 0 ? (
              <div className="text-center py-8">
                <i className="fas fa-file-invoice text-4xl text-gray-300 mb-4"></i>
                <h4 className="text-lg font-medium text-gray-900">No claims yet</h4>
                <p className="text-gray-500">Submit your first claim to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentClaims?.slice(0, 3).map((claim) => (
                  <div key={claim.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h4 className="font-medium text-gray-900">{claim.number}</h4>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          claim.status === 'approved' 
                            ? 'bg-green-100 text-green-800'
                            : claim.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {claim.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{claim.percentComplete}% Progress</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Submitted {new Date(claim.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="ml-4 text-right">
                      <p className="font-semibold text-gray-900">
                        ${parseFloat(claim.amountDue).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Amount Due</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
