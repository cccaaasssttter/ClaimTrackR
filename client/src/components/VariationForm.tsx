import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { insertVariationSchema, type InsertVariation } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface VariationFormProps {
  claimId: string;
  onClose: () => void;
}

export const VariationForm: React.FC<VariationFormProps> = ({ claimId, onClose }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<InsertVariation>({
    resolver: zodResolver(insertVariationSchema),
    defaultValues: {
      claimId,
      status: 'pending',
    },
  });

  const createVariationMutation = useMutation({
    mutationFn: async (data: InsertVariation) => {
      return await apiRequest('POST', '/api/variations', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/claims', claimId, 'variations'] });
      toast({
        title: 'Success',
        description: 'Variation added successfully',
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

  const onSubmit = (data: InsertVariation) => {
    createVariationMutation.mutate(data);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Add Variation</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              {...register('description')}
              placeholder="Brief description of the variation"
            />
            {errors.description && (
              <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="amount">Amount ($)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              {...register('amount')}
              placeholder="0.00"
            />
            <p className="text-xs text-gray-500 mt-1">Use negative values for reductions</p>
            {errors.amount && (
              <p className="text-sm text-red-600 mt-1">{errors.amount.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select onValueChange={(value) => setValue('status', value as 'pending' | 'approved' | 'rejected')}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createVariationMutation.isPending}
            >
              {createVariationMutation.isPending ? 'Adding...' : 'Add Variation'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
