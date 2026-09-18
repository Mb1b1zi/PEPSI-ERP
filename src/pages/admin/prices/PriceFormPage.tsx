import { useEffect, useState } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { priceSchema, type PriceValues } from '@/schemas/priceSchema';
import { priceService } from '@/services/priceService';
import { useCatalog } from '@/hooks/useCatalog';
import { useToast } from '@/hooks/useToast';
import { FormField } from '@/components/forms/FormField';
import { ADMIN_PATHS } from '@/routes/paths';

const inputClasses =
  'border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand disabled:bg-gray-100 disabled:text-gray-500';

/**
 * Edit mode locks the Quantity select — PriceUpdate only allows changing `amount` (see
 * types/price.ts), quantity_id can't be changed after creation on the real backend.
 */
export function PriceFormPage() {
  const { quantityId } = useParams();
  const isEditMode = Boolean(quantityId);
  const navigate = useNavigate();
  const toast = useToast();
  const { quantities, isLoading: isCatalogLoading } = useCatalog();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PriceValues>({
    resolver: zodResolver(priceSchema) as Resolver<PriceValues>,
    defaultValues: { quantityId: 0, amount: 0 },
  });

  useEffect(() => {
    if (quantityId) {
      priceService.getPriceByQuantityId(Number(quantityId)).then((price) => {
        if (price) reset({ quantityId: price.quantityId, amount: price.amount });
      });
    }
  }, [quantityId, reset]);

  async function onSubmit(values: PriceValues) {
    setIsSubmitting(true);
    try {
      if (isEditMode && quantityId) {
        await priceService.updatePrice(Number(quantityId), { amount: values.amount });
        toast.success('Price updated.');
      } else {
        await priceService.createPrice(values);
        toast.success('Price created.');
      }
      navigate(ADMIN_PATHS.prices.list);
    } catch {
      toast.error(isEditMode ? 'Failed to update price.' : 'Failed to create price.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-semibold text-gray-900">{isEditMode ? 'Edit Price' : 'Add Price'}</h1>
      <p className="text-gray-500 mt-1">
        {isEditMode ? 'Update the amount for this quantity.' : 'Set a price for a pack-size/quantity.'}
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 bg-white border border-gray-200 rounded-lg p-6 flex flex-col gap-5">
        <FormField label="Quantity" error={errors.quantityId?.message} required>
          {isCatalogLoading ? (
            <div className="h-[38px] bg-gray-100 rounded-md animate-pulse" />
          ) : (
            <select {...register('quantityId')} className={inputClasses} disabled={isEditMode} defaultValue="">
              <option value="" disabled>
                Select a quantity…
              </option>
              {quantities.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.value}
                </option>
              ))}
            </select>
          )}
        </FormField>

        <FormField label="Amount" error={errors.amount?.message} required>
          <input {...register('amount')} type="number" min="1" step="1" className={inputClasses} placeholder="e.g. 1500" />
        </FormField>

        <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-brand hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
          >
            {isSubmitting ? 'Saving...' : isEditMode ? 'Save Changes' : 'Create Price'}
          </button>
          <button
            type="button"
            onClick={() => navigate(ADMIN_PATHS.prices.list)}
            className="text-sm text-gray-600 hover:text-gray-900 px-4 py-2"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
