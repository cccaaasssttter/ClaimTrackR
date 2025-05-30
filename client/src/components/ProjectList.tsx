import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import { type Project } from '@shared/schema';

export const ProjectList: React.FC = () => {
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const queryClient = useQueryClient();

  const { data: projects, isLoading, error } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
    queryFn: async () => {
      const res = await fetch('/api/projects');
      if (!res.ok) throw new Error('Failed to load projects');
      return res.json();
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: async (projectData: any) => {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData)
      });
      if (!response.ok) throw new Error('Failed to create project');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      setShowProjectForm(false);
    }
  });

  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, ...projectData }: any) => {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData)
      });
      if (!response.ok) throw new Error('Failed to update project');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      setEditingProject(null);
    }
  });

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
      gstRate: '10.00',
      retentionRate: '5.00',
      status: 'active',
      createdBy: '550e8400-e29b-41d4-a716-446655440000'
    };
    createProjectMutation.mutate(projectData);
  };

  const handleUpdateProject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingProject) return;
    
    const formData = new FormData(e.currentTarget);
    const projectData = {
      id: editingProject.id,
      name: formData.get('name'),
      description: formData.get('description'),
      clientName: formData.get('clientName'),
      totalValue: formData.get('totalValue'),
      startDate: formData.get('startDate'),
      endDate: formData.get('endDate'),
      gstRate: formData.get('gstRate') || '10.00',
      retentionRate: formData.get('retentionRate') || '5.00',
      status: formData.get('status') || 'active'
    };
    updateProjectMutation.mutate(projectData);
  };

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
        </div>

        {projects && projects.length === 0 ? (
          <div className="text-center py-12">
            <i className="fas fa-folder text-4xl text-gray-300 mb-4"></i>
            <h3 className="text-lg font-medium text-gray-900">No projects yet</h3>
            <p className="text-gray-500 mb-6">Get started by creating your first project</p>
            <button 
              onClick={() => setShowProjectForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Create Project
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {projects?.map((project) => (
              <div key={project.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <Link href={`/project/${project.id}`} className="block flex-1">
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
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingProject(project);
                    }}
                    className="ml-4 p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit project"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showProjectForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-medium mb-4">Create New Project</h3>
              <form onSubmit={handleCreateProject} className="space-y-4">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea 
                    name="description" 
                    rows={3}
                    placeholder="Commercial building construction project..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  ></textarea>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input 
                      name="startDate" 
                      type="date" 
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input 
                      name="endDate" 
                      type="date" 
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex space-x-3 pt-4">
                  <button 
                    type="submit" 
                    disabled={createProjectMutation.isPending}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {createProjectMutation.isPending ? 'Creating...' : 'Create Project'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowProjectForm(false)}
                    className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {editingProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-medium mb-4">Edit Project</h3>
              <form onSubmit={handleUpdateProject} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                  <input 
                    name="name" 
                    type="text" 
                    required 
                    defaultValue={editingProject.name}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
                  <input 
                    name="clientName" 
                    type="text" 
                    defaultValue={editingProject.clientName || ''}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contract Value</label>
                  <input 
                    name="totalValue" 
                    type="number" 
                    required 
                    defaultValue={editingProject.totalValue}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea 
                    name="description" 
                    rows={3}
                    defaultValue={editingProject.description || ''}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  ></textarea>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">GST Rate (%)</label>
                    <input 
                      name="gstRate" 
                      type="number" 
                      step="0.01"
                      defaultValue={editingProject.gstRate}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Retention (%)</label>
                    <input 
                      name="retentionRate" 
                      type="number" 
                      step="0.01"
                      defaultValue={editingProject.retentionRate}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select 
                    name="status" 
                    defaultValue={editingProject.status}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="on-hold">On Hold</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="flex space-x-3 pt-4">
                  <button 
                    type="submit" 
                    disabled={updateProjectMutation.isPending}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {updateProjectMutation.isPending ? 'Updating...' : 'Update Project'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setEditingProject(null)}
                    className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
