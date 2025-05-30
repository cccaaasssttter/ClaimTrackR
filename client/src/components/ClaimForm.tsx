import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { insertClaimSchema, type InsertClaim, type Project } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface ClaimFormProps {
  project: Project;
  onClose: () => void;
}

export const ClaimForm: React.FC<ClaimFormProps> = ({ project, onClose }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [calculations, setCalculations] = useState({
    contractWork: 0,
    previousClaims: 0,
    thisClaim: 0,
    gst: 0,
    totalIncGst: 0,
    retentionHeld: 0,
    amountDue: 0,
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<InsertClaim>({
    resolver: zodResolver(insertClaimSchema),
    defaultValues: {
      projectId: project.id,
      status: 'pending',
      previousClaim: '0.00',
    },
  });

  const percentComplete = watch('percentComplete');

  useEffect(() => {
    if (percentComplete) {
      const percent = parseFloat(percentComplete);
      const contractValue = parseFloat(project.totalValue);
      const gstRate = parseFloat(project.gstRate) / 100;
      const retentionRate = parseFloat(project.retentionRate) / 100;

      const contractWork = (contractValue * percent) / 100;
      const previousClaims = parseFloat(watch('previousClaim') || '0');
      const thisClaim = Math.max(0, contractWork - previousClaims);
      const gst = thisClaim * gstRate;
      const totalIncGst = thisClaim + gst;
      const retentionHeld = thisClaim * retentionRate;
      const amountDue = totalIncGst - retentionHeld;

      setCalculations({
        contractWork,
        previousClaims,
        thisClaim,
        gst,
        totalIncGst,
        retentionHeld,
        amountDue,
      });

      // Update form values
      setValue('thisClaim', thisClaim.toFixed(2));
      setValue('totalExGst', thisClaim.toFixed(2));
      setValue('gst', gst.toFixed(2));
      setValue('totalIncGst', totalIncGst.toFixed(2));
      setValue('retentionHeld', retentionHeld.toFixed(2));
      setValue('amountDue', amountDue.toFixed(2));
    }
  }, [percentComplete, project, watch, setValue]);

  const createClaimMutation = useMutation({
    mutationFn: async (data: InsertClaim) => {
      return await apiRequest('POST', '/api/claims', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', project.id, 'claims'] });
      toast({
        title: 'Success',
        description: 'Claim created successfully',
      });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: InsertClaim) => {
    createClaimMutation.mutate(data);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Create New Claim</h3>
              <p className="text-sm text-gray-500">{project.name}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="number">Claim Number</Label>
              <Input
                id="number"
                {...register('number')}
                placeholder="PC-001"
              />
              {errors.number && (
                <p className="text-sm text-red-600 mt-1">{errors.number.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="percentComplete">% Complete</Label>
              <Input
                id="percentComplete"
                type="number"
                min="0"
                max="100"
                step="0.1"
                {...register('percentComplete')}
                placeholder="75.0"
              />
              {errors.percentComplete && (
                <p className="text-sm text-red-600 mt-1">{errors.percentComplete.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="periodFrom">Period From</Label>
              <Input
                id="periodFrom"
                type="date"
                {...register('periodFrom')}
              />
            </div>

            <div>
              <Label htmlFor="periodTo">Period To</Label>
              <Input
                id="periodTo"
                type="date"
                {...register('periodTo')}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Description of work completed"
              rows={3}
            />
          </div>

          {/* Auto-calculated fields */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Calculated Values</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Contract Work:</span>
                <span className="float-right font-medium">${calculations.contractWork.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div>
                <span className="text-gray-600">Previous Claims:</span>
                <span className="float-right font-medium">${calculations.previousClaims.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div>
                <span className="text-gray-600">This Claim (Ex GST):</span>
                <span className="float-right font-medium">${calculations.thisClaim.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div>
                <span className="text-gray-600">GST:</span>
                <span className="float-right font-medium">${calculations.gst.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div>
                <span className="text-gray-600">Total Inc GST:</span>
                <span className="float-right font-medium">${calculations.totalIncGst.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div>
                <span className="text-gray-600">Retention:</span>
                <span className="float-right font-medium text-red-600">-${calculations.retentionHeld.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex justify-between items-center font-semibold">
                <span>Amount Due:</span>
                <span className="text-primary-600">${calculations.amountDue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createClaimMutation.isPending}
            >
              {createClaimMutation.isPending ? 'Creating...' : 'Create Claim'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
