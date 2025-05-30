import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { type Claim } from '@shared/schema';

interface ClaimListProps {
  projectId: string;
}

export const ClaimList: React.FC<ClaimListProps> = ({ projectId }) => {
  const { data: claims, isLoading } = useQuery<Claim[]>({
    queryKey: ['/api/projects', projectId, 'claims'],
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Progress Claims</h3>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Progress Claims</h3>
      </div>

      {claims && claims.length === 0 ? (
        <div className="p-6 text-center">
          <i className="fas fa-file-invoice text-4xl text-gray-300 mb-4"></i>
          <h4 className="text-lg font-medium text-gray-900">No claims yet</h4>
          <p className="text-gray-500">Create your first claim to get started</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-6 font-medium text-gray-700">Claim #</th>
                <th className="text-left py-3 px-6 font-medium text-gray-700">Date</th>
                <th className="text-left py-3 px-6 font-medium text-gray-700">% Complete</th>
                <th className="text-right py-3 px-6 font-medium text-gray-700">This Claim</th>
                <th className="text-right py-3 px-6 font-medium text-gray-700">Amount Due</th>
                <th className="text-center py-3 px-6 font-medium text-gray-700">Status</th>
                <th className="text-center py-3 px-6 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {claims?.map((claim) => (
                <tr key={claim.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-medium text-gray-900">{claim.number}</div>
                  </td>
                  <td className="py-4 px-6 text-gray-600">
                    {new Date(claim.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">{claim.percentComplete}%</span>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary-500 h-2 rounded-full" 
                          style={{ width: `${Math.min(100, parseFloat(claim.percentComplete))}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right font-medium text-gray-900">
                    ${parseFloat(claim.thisClaim).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-4 px-6 text-right font-semibold text-gray-900">
                    ${parseFloat(claim.amountDue).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
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
                  </td>
                  <td className="py-4 px-6 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <Link href={`/project/${projectId}/claim/${claim.id}`}>
                        <button className="text-primary-500 hover:text-primary-700 p-1" title="View Details">
                          <i className="fas fa-eye"></i>
                        </button>
                      </Link>
                      <button className="text-gray-500 hover:text-gray-700 p-1" title="Edit">
                        <i className="fas fa-edit"></i>
                      </button>
                      <button className="text-green-500 hover:text-green-700 p-1" title="Download PDF">
                        <i className="fas fa-download"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
