import React from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { VariationList } from '@/components/VariationList';
import { FileUploader } from '@/components/FileUploader';
import { Button } from '@/components/ui/button';
import { type Claim, type Attachment } from '@shared/schema';

export default function ClaimDetail() {
  const params = useParams<{ projectId: string; claimId: string }>();
  const [, setLocation] = useLocation();

  const { data: claim, isLoading } = useQuery<Claim>({
    queryKey: ['/api/claims', params.claimId],
    queryFn: async () => {
      const res = await fetch(`/api/claims/${params.claimId}`);
      if (!res.ok) throw new Error('Failed to load claim');
      return res.json();
    },
  });

  const { data: attachments } = useQuery<Attachment[]>({
    queryKey: ['/api/claims', params.claimId, 'attachments'],
    queryFn: async () => {
      const res = await fetch(`/api/claims/${params.claimId}/attachments`);
      if (!res.ok) throw new Error('Failed to load attachments');
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-3 gap-8">
            <div className="col-span-2 space-y-6">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-48 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-6">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-48 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!claim) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Claim not found</h2>
        <p className="text-gray-500 mt-2">The claim you're looking for doesn't exist.</p>
        <Button onClick={() => setLocation(`/project/${params.projectId}`)} className="mt-4">
          Back to Project
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setLocation(`/project/${params.projectId}`)}
              className="text-gray-500 hover:text-gray-700"
            >
              <i className="fas fa-arrow-left text-lg"></i>
            </button>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Progress Claim {claim.number}</h2>
              <p className="text-gray-500 mt-1">
                Submitted {new Date(claim.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              claim.status === 'approved' 
                ? 'bg-green-100 text-green-800'
                : claim.status === 'pending'
                ? 'bg-yellow-100 text-yellow-800'
                : claim.status === 'rejected'
                ? 'bg-red-100 text-red-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {claim.status}
            </span>
            <Button variant="outline">
              <i className="fas fa-download mr-2"></i>
              Export PDF
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Claim Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Financial Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Financial Summary</h3>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">% Complete:</span>
                  <span className="font-medium text-gray-900">{claim.percentComplete}%</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Previous Claims:</span>
                  <span className="font-medium text-gray-900">
                    ${parseFloat(claim.previousClaim).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 bg-blue-50 px-4 rounded">
                  <span className="text-gray-700 font-medium">This Claim (Ex. GST):</span>
                  <span className="font-bold text-blue-700">
                    ${parseFloat(claim.thisClaim).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">GST:</span>
                  <span className="font-medium text-gray-900">
                    ${parseFloat(claim.gst).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Total Inc. GST:</span>
                  <span className="font-medium text-gray-900">
                    ${parseFloat(claim.totalIncGst).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-t border-gray-200">
                  <span className="text-gray-600">Retention:</span>
                  <span className="font-medium text-red-600">
                    -${parseFloat(claim.retentionHeld).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 bg-green-50 px-4 rounded border-t-2 border-green-200">
                  <span className="text-gray-700 font-bold">Amount Due:</span>
                  <span className="font-bold text-green-700 text-lg">
                    ${parseFloat(claim.amountDue).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            {claim.description && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                <p className="text-gray-600">{claim.description}</p>
              </div>
            )}
          </div>

          {/* Variations */}
          <VariationList claimId={params.claimId!} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Progress */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Overall Completion</span>
                  <span className="font-medium text-gray-900">{claim.percentComplete}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-primary-500 h-3 rounded-full transition-all duration-300" 
                    style={{ width: `${Math.min(100, parseFloat(claim.percentComplete))}%` }}
                  ></div>
                </div>
              </div>
              
              {claim.periodFrom && claim.periodTo && (
                <div className="pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600 mb-3">Claim Period:</div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">From:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {new Date(claim.periodFrom).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">To:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {new Date(claim.periodTo).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Attachments */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Attachments</h3>
            </div>
            
            <div className="p-6">
              {attachments && attachments.length === 0 ? (
                <div className="text-center py-4">
                  <i className="fas fa-paperclip text-2xl text-gray-300 mb-2"></i>
                  <p className="text-sm text-gray-500">No attachments yet</p>
                </div>
              ) : (
                <div className="space-y-3 mb-4">
                  {attachments?.map((attachment) => (
                    <div key={attachment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                          <i className={`fas ${
                            attachment.fileName.endsWith('.pdf') ? 'fa-file-pdf text-red-600' :
                            attachment.fileName.match(/\.(jpg|jpeg|png)$/i) ? 'fa-file-image text-blue-600' :
                            'fa-file text-gray-600'
                          }`}></i>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{attachment.fileName}</p>
                          <p className="text-xs text-gray-500">
                            {(attachment.fileSize / 1024 / 1024).toFixed(1)} MB
                          </p>
                        </div>
                      </div>
                      <a 
                        href={attachment.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <i className="fas fa-download"></i>
                      </a>
                    </div>
                  ))}
                </div>
              )}

              <FileUploader claimId={params.claimId!} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
