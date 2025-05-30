import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { ProjectForm } from './ProjectForm';
import { Button } from '@/components/ui/button';
import { type Project } from '@shared/schema';

export const ProjectList: React.FC = () => {
  const [showProjectForm, setShowProjectForm] = useState(false);

  const { data: projects, isLoading, error } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
    queryFn: async () => {
      const res = await fetch('/api/projects');
      if (!res.ok) throw new Error('Failed to load projects');
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-2 bg-gray-200 rounded w-full"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <h3 className="text-lg font-medium text-red-900 mb-2">Unable to load projects</h3>
        <p className="text-red-700">Failed to connect to the backend. Please check your connection.</p>
        <pre className="mt-2 text-sm text-red-600">{error.message}</pre>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Projects</h2>
            <p className="text-sm text-gray-500 mt-1">Manage your progress claims and project financials</p>
          </div>
          <Button onClick={() => setShowProjectForm(true)}>
            <i className="fas fa-plus mr-2"></i>
            New Project
          </Button>
        </div>

        {projects && projects.length === 0 ? (
          <div className="text-center py-12">
            <i className="fas fa-folder text-4xl text-gray-300 mb-4"></i>
            <h3 className="text-lg font-medium text-gray-900">No projects yet</h3>
            <p className="text-gray-500 mb-6">Get started by creating your first project</p>
            <Button onClick={() => setShowProjectForm(true)}>
              Create Project
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {projects?.map((project) => (
              <div key={project.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <Link href={`/project/${project.id}`} className="block">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h4 className="text-lg font-medium text-gray-900">{project.name}</h4>
                        <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {project.status}
                        </span>
                      </div>
                      {project.description && (
                        <p className="mt-1 text-sm text-gray-600">{project.description}</p>
                      )}
                      
                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-gray-500">Total Value</p>
                          <p className="text-sm font-semibold text-gray-900">${parseFloat(project.totalValue).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">GST Rate</p>
                          <p className="text-sm font-semibold text-gray-900">{project.gstRate}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Retention</p>
                          <p className="text-sm font-semibold text-gray-900">{project.retentionRate}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Created</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {new Date(project.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-6 flex items-center">
                      <i className="fas fa-chevron-right text-gray-400"></i>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {showProjectForm && (
        <ProjectForm onClose={() => setShowProjectForm(false)} />
      )}
    </>
  );
};
