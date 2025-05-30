import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { VariationForm } from './VariationForm';
import { Button } from '@/components/ui/button';
import { type Variation } from '@shared/schema';

interface VariationListProps {
  claimId: string;
}

export const VariationList: React.FC<VariationListProps> = ({ claimId }) => {
  const [showVariationForm, setShowVariationForm] = useState(false);

  const { data: variations, isLoading } = useQuery<Variation[]>({
    queryKey: ['/api/claims', claimId, 'variations'],
    queryFn: async () => {
      const res = await fetch(`/api/claims/${claimId}/variations`);
      if (!res.ok) throw new Error('Failed to load variations');
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Variations</h3>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const totalVariations = variations?.reduce((sum, variation) => sum + parseFloat(variation.amount), 0) || 0;

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Variations</h3>
            <Button onClick={() => setShowVariationForm(true)} size="sm">
              <i className="fas fa-plus mr-2"></i>
              Add Variation
            </Button>
          </div>
        </div>
        
        <div className="p-6">
          {variations && variations.length === 0 ? (
            <div className="text-center py-8">
              <i className="fas fa-exchange-alt text-4xl text-gray-300 mb-4"></i>
              <h4 className="text-lg font-medium text-gray-900">No variations</h4>
              <p className="text-gray-500 mb-4">Add variations to track changes to the original scope</p>
              <Button onClick={() => setShowVariationForm(true)} size="sm">
                Add First Variation
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {variations?.map((variation) => (
                <div key={variation.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{variation.description}</h4>
                      <p className="text-xs text-gray-400 mt-2">
                        Added {new Date(variation.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="ml-4 text-right">
                      <p className={`font-semibold ${
                        parseFloat(variation.amount) >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {parseFloat(variation.amount) >= 0 ? '+' : ''}${parseFloat(variation.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
                        variation.status === 'approved' 
                          ? 'bg-green-100 text-green-800'
                          : variation.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {variation.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {variations && variations.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Total Variations:</span>
                    <span className={`font-bold ${
                      totalVariations >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {totalVariations >= 0 ? '+' : ''}${totalVariations.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showVariationForm && (
        <VariationForm 
          claimId={claimId}
          onClose={() => setShowVariationForm(false)} 
        />
      )}
    </>
  );
};
