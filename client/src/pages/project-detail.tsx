import React, { useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { ClaimList } from '@/components/ClaimList';
import { DetailedClaimForm } from '@/components/DetailedClaimForm';
import { Button } from '@/components/ui/button';
import { type Project, type Claim } from '@shared/schema';

export default function ProjectDetail() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const [showClaimForm, setShowClaimForm] = useState(false);

  const { data: project, isLoading } = useQuery<Project>({
    queryKey: ['/api/projects', params.id],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${params.id}`);
      if (!res.ok) throw new Error('Failed to load project');
      return res.json();
    },
  });

  const { data: claims = [] } = useQuery<Claim[]>({
    queryKey: ['/api/projects', params.id, 'claims'],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${params.id}/claims`);
      if (!res.ok) throw new Error('Failed to load claims');
      return res.json();
    },
    enabled: !!params.id,
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Project not found</h2>
        <p className="text-gray-500 mt-2">The project you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <>
      <div className="p-6">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button 
                onClick={() => setLocation('/projects')}
                className="mr-4 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="Back to projects"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{project.name}</h2>
                <p className="text-gray-500 mt-1">{project.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                {project.status}
              </span>
              <Button onClick={() => setShowClaimForm(true)}>
                <i className="fas fa-plus mr-2"></i>
                New Claim
              </Button>
            </div>
          </div>
        </div>

        {/* Project Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Contract Value</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                ${parseFloat(project.totalValue).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">Ex. GST</p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">GST Amount</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">${Math.round(parseFloat(project.totalValue) * 0.10).toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">10% of contract value</p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Retention</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{Math.round(parseFloat(project.retentionRate))}% = ${Math.round(parseFloat(project.totalValue) * parseFloat(project.retentionRate) / 100).toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">Held back from total</p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Claimed to Date</p>
              <p className="text-2xl font-bold text-blue-600 mt-2">
                ${claims?.reduce((sum, claim) => sum + parseFloat(claim.totalIncGst || '0'), 0).toLocaleString() || '0'}
              </p>
              <p className="text-xs text-gray-500 mt-1">Inc. GST</p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Left to Claim</p>
              <p className="text-2xl font-bold text-green-600 mt-2">
                ${Math.max(0, (parseFloat(project.totalValue) * 1.10) - (claims?.reduce((sum, claim) => sum + parseFloat(claim.totalIncGst || '0'), 0) || 0)).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">Remaining value</p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Created</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {new Date(project.createdAt).toLocaleDateString('en-US', { 
                  month: 'short',
                  day: 'numeric'
                })}
              </p>
              <p className="text-xs text-gray-500 mt-1">{new Date(project.createdAt).getFullYear()}</p>
            </div>
          </div>
        </div>

        {/* Claims List */}
        <ClaimList projectId={params.id!} />
      </div>

      {showClaimForm && (
        <DetailedClaimForm 
          project={project}
          onClose={() => setShowClaimForm(false)} 
        />
      )}
    </>
  );
}
