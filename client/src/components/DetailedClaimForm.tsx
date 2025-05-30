import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { insertClaimSchema, type InsertClaim, type Project } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const claimItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  contractValue: z.string().min(1, 'Contract value is required'),
  percentComplete: z.string().min(0).max(100, 'Percentage must be between 0 and 100'),
});

const variationSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.string().min(0, 'Quantity must be positive'),
  rate: z.string().min(0, 'Rate must be positive'),
});

const creditSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  amount: z.string().min(0, 'Amount must be positive'),
});

const detailedClaimSchema = z.object({
  number: z.string().min(1, 'Claim number is required'),
  monthEnding: z.string().optional(),
  contactPerson: z.string().optional(),
  subcontractReference: z.string().optional(),
  paymentReceived: z.string().default('0.00'),
  description: z.string().optional(),
  items: z.array(claimItemSchema).min(1, 'At least one claim item is required'),
  variations: z.array(variationSchema).optional(),
  credits: z.array(creditSchema).optional(),
});

type DetailedClaimForm = z.infer<typeof detailedClaimSchema>;

interface DetailedClaimFormProps {
  project: Project;
  onClose: () => void;
}

export const DetailedClaimForm: React.FC<DetailedClaimFormProps> = ({ project, onClose }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [calculations, setCalculations] = useState({
    totalWorksCompleted: 0,
    totalVariations: 0,
    totalCredits: 0,
    subTotal: 0,
    gst: 0,
    totalIncGst: 0,
  });

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<DetailedClaimForm>({
    resolver: zodResolver(detailedClaimSchema),
    defaultValues: {
      paymentReceived: '0.00',
      items: [
        { description: 'FOOTINGS', contractValue: '0.00', percentComplete: '0.00' },
        { description: 'WAREHOUSE', contractValue: '0.00', percentComplete: '0.00' },
        { description: 'OFFICE', contractValue: '0.00', percentComplete: '0.00' },
        { description: 'CARPARK', contractValue: '0.00', percentComplete: '0.00' },
        { description: 'CROSSOVER', contractValue: '0.00', percentComplete: '0.00' },
      ],
      variations: [],
      credits: [],
    },
  });

  const { fields: itemFields, append: appendItem, remove: removeItem } = useFieldArray({
    control,
    name: 'items',
  });

  const { fields: variationFields, append: appendVariation, remove: removeVariation } = useFieldArray({
    control,
    name: 'variations',
  });

  const { fields: creditFields, append: appendCredit, remove: removeCredit } = useFieldArray({
    control,
    name: 'credits',
  });

  const watchedItems = watch('items');
  const watchedVariations = watch('variations');
  const watchedCredits = watch('credits');
  const watchedPaymentReceived = watch('paymentReceived');

  useEffect(() => {
    // Calculate claim totals
    const totalWorksCompleted = watchedItems?.reduce((sum, item) => {
      const contractValue = parseFloat(item.contractValue || '0');
      const percentComplete = parseFloat(item.percentComplete || '0');
      return sum + (contractValue * percentComplete / 100);
    }, 0) || 0;

    const totalVariations = watchedVariations?.reduce((sum, variation) => {
      const quantity = parseFloat(variation.quantity || '0');
      const rate = parseFloat(variation.rate || '0');
      return sum + (quantity * rate);
    }, 0) || 0;

    const totalCredits = watchedCredits?.reduce((sum, credit) => {
      return sum + parseFloat(credit.amount || '0');
    }, 0) || 0;

    const paymentReceived = parseFloat(watchedPaymentReceived || '0');
    const subTotal = totalWorksCompleted + totalVariations - totalCredits - paymentReceived;
    const gstRate = parseFloat(project.gstRate) / 100;
    const gst = subTotal * gstRate;
    const totalIncGst = subTotal + gst;

    setCalculations({
      totalWorksCompleted,
      totalVariations,
      totalCredits,
      subTotal,
      gst,
      totalIncGst,
    });
  }, [watchedItems, watchedVariations, watchedCredits, watchedPaymentReceived, project.gstRate]);

  const createClaimMutation = useMutation({
    mutationFn: async (data: DetailedClaimForm) => {
      // Create the main claim
      const claimData: InsertClaim = {
        projectId: project.id,
        number: data.number,
        monthEnding: data.monthEnding ? new Date(data.monthEnding) : null,
        contactPerson: data.contactPerson || null,
        subcontractReference: data.subcontractReference || null,
        totalWorksCompleted: calculations.totalWorksCompleted.toFixed(2),
        paymentReceived: data.paymentReceived,
        deductions: calculations.totalCredits.toFixed(2),
        subTotal: calculations.subTotal.toFixed(2),
        gst: calculations.gst.toFixed(2),
        totalIncGst: calculations.totalIncGst.toFixed(2),
        description: data.description || null,
        createdBy: "00000000-0000-0000-0000-000000000000",
      };

      const claim = await apiRequest('POST', '/api/claims', claimData);

      // Create claim items
      for (let index = 0; index < data.items.length; index++) {
        const item = data.items[index];
        const contractValue = parseFloat(item.contractValue);
        const percentComplete = parseFloat(item.percentComplete);
        const claimToDate = contractValue * percentComplete / 100;
        
        await apiRequest('POST', '/api/claim-items', {
          claimId: claim.id,
          description: item.description,
          contractValue: item.contractValue,
          percentComplete: item.percentComplete,
          claimToDate: claimToDate.toFixed(2),
          previousClaim: '0.00',
          thisClaim: claimToDate.toFixed(2),
          leftToClaim: (contractValue - claimToDate).toFixed(2),
          sortOrder: index,
        });
      }

      // Create variations
      for (const variation of data.variations || []) {
        const quantity = parseFloat(variation.quantity);
        const rate = parseFloat(variation.rate);
        const variationValue = quantity * rate;
        
        await apiRequest('POST', '/api/variations', {
          claimId: claim.id,
          description: variation.description,
          quantity: variation.quantity,
          rate: variation.rate,
          variationValue: variationValue.toFixed(2),
          subtotal: variationValue.toFixed(2),
        });
      }

      // Create credits
      for (const credit of data.credits || []) {
        await apiRequest('POST', '/api/credits', {
          claimId: claim.id,
          description: credit.description,
          amount: credit.amount,
        });
      }

      return claim;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', project.id, 'claims'] });
      toast({
        title: 'Success',
        description: 'Progress claim created successfully',
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

  const onSubmit = (data: DetailedClaimForm) => {
    createClaimMutation.mutate(data);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Create Progress Claim</h3>
              <p className="text-sm text-gray-500">{project.name}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-8">
          {/* Header Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="number">Progress Claim No.</Label>
              <Input
                id="number"
                {...register('number')}
                placeholder="1"
              />
              {errors.number && (
                <p className="text-sm text-red-600 mt-1">{errors.number.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="monthEnding">Month Ending</Label>
              <Input
                id="monthEnding"
                type="date"
                {...register('monthEnding')}
              />
            </div>


          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="subcontractReference">Subcontract Reference</Label>
              <Input
                id="subcontractReference"
                {...register('subcontractReference')}
                placeholder="1083"
              />
            </div>

            <div>
              <Label htmlFor="paymentReceived">Payment Received to Date</Label>
              <Input
                id="paymentReceived"
                type="number"
                step="0.01"
                {...register('paymentReceived')}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Claim Items Section */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900">Contract Items</h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendItem({ description: '', contractValue: '0.00', percentComplete: '0.00' })}
              >
                <i className="fas fa-plus mr-2"></i>
                Add Item
              </Button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-2 font-medium text-gray-700">Description</th>
                    <th className="text-right py-2 px-2 font-medium text-gray-700">Contract Value</th>
                    <th className="text-right py-2 px-2 font-medium text-gray-700">% Complete</th>
                    <th className="text-right py-2 px-2 font-medium text-gray-700">This Claim</th>
                    <th className="text-center py-2 px-2 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {itemFields.map((field, index) => {
                    const contractValue = parseFloat(watchedItems?.[index]?.contractValue || '0');
                    const percentComplete = parseFloat(watchedItems?.[index]?.percentComplete || '0');
                    const thisClaim = contractValue * percentComplete / 100;
                    
                    return (
                      <tr key={field.id} className="border-b border-gray-100">
                        <td className="py-2 px-2">
                          <Input
                            {...register(`items.${index}.description`)}
                            placeholder="Item description"
                            className="w-full"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <Input
                            type="number"
                            step="0.01"
                            {...register(`items.${index}.contractValue`)}
                            placeholder="0.00"
                            className="text-right"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            {...register(`items.${index}.percentComplete`)}
                            placeholder="0.00"
                            className="text-right"
                          />
                        </td>
                        <td className="py-2 px-2 text-right font-medium">
                          ${thisClaim.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2 px-2 text-center">
                          {itemFields.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <i className="fas fa-trash"></i>
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-300 bg-gray-100">
                    <td className="py-3 px-2 font-bold text-gray-900">Total Contract Value:</td>
                    <td className="py-3 px-2 text-right font-bold text-gray-900">
                      ${watchedItems?.reduce((total, item) => {
                        return total + parseFloat(item?.contractValue || '0');
                      }, 0).toLocaleString('en-US', { minimumFractionDigits: 0 })}
                    </td>
                    <td className="py-3 px-2"></td>
                    <td className="py-3 px-2 text-right font-bold text-gray-900">
                      ${watchedItems?.reduce((total, item) => {
                        const contractValue = parseFloat(item?.contractValue || '0');
                        const percentComplete = parseFloat(item?.percentComplete || '0');
                        return total + (contractValue * percentComplete / 100);
                      }, 0).toLocaleString('en-US', { minimumFractionDigits: 0 })}
                    </td>
                    <td className="py-3 px-2"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Variations Section */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900">Variations</h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendVariation({ description: '', quantity: '0.00', rate: '0.00' })}
              >
                <i className="fas fa-plus mr-2"></i>
                Add Variation
              </Button>
            </div>
            
            {variationFields.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-2 font-medium text-gray-700">Description</th>
                      <th className="text-right py-2 px-2 font-medium text-gray-700">Qty</th>
                      <th className="text-right py-2 px-2 font-medium text-gray-700">Rate</th>
                      <th className="text-right py-2 px-2 font-medium text-gray-700">Value</th>
                      <th className="text-center py-2 px-2 font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {variationFields.map((field, index) => {
                      const quantity = parseFloat(watchedVariations?.[index]?.quantity || '0');
                      const rate = parseFloat(watchedVariations?.[index]?.rate || '0');
                      const value = quantity * rate;
                      
                      return (
                        <tr key={field.id} className="border-b border-gray-100">
                          <td className="py-2 px-2">
                            <Input
                              {...register(`variations.${index}.description`)}
                              placeholder="Variation description"
                              className="w-full"
                            />
                          </td>
                          <td className="py-2 px-2">
                            <Input
                              type="number"
                              step="0.01"
                              {...register(`variations.${index}.quantity`)}
                              placeholder="0.00"
                              className="text-right"
                            />
                          </td>
                          <td className="py-2 px-2">
                            <Input
                              type="number"
                              step="0.01"
                              {...register(`variations.${index}.rate`)}
                              placeholder="0.00"
                              className="text-right"
                            />
                          </td>
                          <td className="py-2 px-2 text-right font-medium">
                            ${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-2 px-2 text-center">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeVariation(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <i className="fas fa-trash"></i>
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Credits Section */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900">Credits/Deductions</h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendCredit({ description: '', amount: '0.00' })}
              >
                <i className="fas fa-plus mr-2"></i>
                Add Credit
              </Button>
            </div>
            
            {creditFields.length > 0 && (
              <div className="space-y-3">
                {creditFields.map((field, index) => (
                  <div key={field.id} className="flex items-center space-x-3">
                    <div className="flex-1">
                      <Input
                        {...register(`credits.${index}.description`)}
                        placeholder="Credit description"
                      />
                    </div>
                    <div className="w-32">
                      <Input
                        type="number"
                        step="0.01"
                        {...register(`credits.${index}.amount`)}
                        placeholder="0.00"
                        className="text-right"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCredit(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <i className="fas fa-trash"></i>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Financial Summary */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Claim Summary</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Works Completed:</span>
                  <span className="font-medium">${calculations.totalWorksCompleted.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Variations:</span>
                  <span className="font-medium">${calculations.totalVariations.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Credits:</span>
                  <span className="font-medium text-red-600">-${calculations.totalCredits.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Received:</span>
                  <span className="font-medium text-red-600">-${parseFloat(watchedPaymentReceived || '0').toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sub Total:</span>
                  <span className="font-medium">${calculations.subTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">GST ({project.gstRate}%):</span>
                  <span className="font-medium">${calculations.gst.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-blue-200">
              <div className="flex justify-between items-center font-bold text-lg">
                <span>Total Inc GST:</span>
                <span className="text-blue-700">${calculations.totalIncGst.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Additional Notes</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Any additional notes or descriptions"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createClaimMutation.isPending}
            >
              {createClaimMutation.isPending ? 'Creating...' : 'Create Progress Claim'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};