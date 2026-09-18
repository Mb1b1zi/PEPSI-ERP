import { useState } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { productionSchema, type ProductionValues } from '@/schemas/productionSchema';
import { factoryService } from '@/services/factoryService';
import { getApiErrorMessage } from '@/lib/apiClient';
import { useCatalog } from '@/hooks/useCatalog';
import { useToast } from '@/hooks/useToast';
import { FormField } from '@/components/forms/FormField';
import { FACTORY_PATHS } from '@/routes/paths';
import type { ProductionRecord } from '@/types/factory';

const inputClasses =
  'border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand';
const selectClasses = inputClasses;

/** `datetime-local` gives "2026-09-14T10:00" with no seconds/timezone; the API wants a full ISO timestamp. */
function toIsoOrUndefined(localValue: string | undefined): string | undefined {
  if (!localValue) return undefined;
  const date = new Date(localValue);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

/** Reverse of the above, for pre-filling the datetime-local input when editing. */
function toDatetimeLocal(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function ProductionFormPage() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const location = useLocation();
  const existingRecord = location.state as ProductionRecord | null;
  const toast = useToast();
  const { products, quantities, isLoading: isCatalogLoading, error: catalogError } = useCatalog();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductionValues>({
    resolver: zodResolver(productionSchema) as Resolver<ProductionValues>,
    defaultValues: existingRecord
      ? {
          productId: existingRecord.productId,
          quantityId: existingRecord.quantityId ?? undefined,
          quantityProduced: existingRecord.quantityProduced,
          productionDate: toDatetimeLocal(existingRecord.productionDate),
        }
      : { productId: undefined, quantityId: undefined, quantityProduced: undefined, productionDate: '' },
  });

  if (isEditMode && !existingRecord) {
    return (
      <div className="p-6 max-w-2xl">
        <h1 className="text-2xl font-semibold text-gray-900">Edit Production Record</h1>
        <div className="mt-6 bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-md px-4 py-3">
          This record wasn't passed from the list page. Open it from{' '}
          <button onClick={() => navigate(FACTORY_PATHS.production.list)} className="underline font-medium">
            Production History
          </button>{' '}
          to edit it.
        </div>
      </div>
    );
  }

  async function onSubmit(values: ProductionValues) {
    setIsSubmitting(true);
    try {
      const input = {
        productId: values.productId,
        quantityId: values.quantityId,
        quantityProduced: values.quantityProduced,
        productionDate: toIsoOrUndefined(values.productionDate),
      };
      if (isEditMode && existingRecord) {
        await factoryService.updateProduction(existingRecord.id, input);
        toast.success('Production record updated.');
      } else {
        await factoryService.createProduction(input);
        toast.success('Production record created.');
      }
      navigate(FACTORY_PATHS.production.list);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to save production record.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-semibold text-gray-900">
        {isEditMode ? 'Edit Production Record' : 'Record Production'}
      </h1>
      <p className="text-gray-500 mt-1">
        {isEditMode ? 'Update this production record.' : 'Record a production run and increase factory stock.'}
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 bg-white border border-gray-200 rounded-lg p-6 flex flex-col gap-5">
        <FormField label="Product" error={errors.productId?.message} required>
          {isCatalogLoading ? (
            <div className="h-[38px] bg-gray-100 rounded-md animate-pulse" />
          ) : catalogError ? (
            <p className="text-sm text-red-600">Failed to load products: {catalogError}</p>
          ) : (
            <select {...register('productId')} className={selectClasses} defaultValue={existingRecord?.productId ?? ''}>
              <option value="" disabled>
                Select a product…
              </option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          )}
        </FormField>

        <FormField label="Quantity" error={errors.quantityId?.message} required>
          {isCatalogLoading ? (
            <div className="h-[38px] bg-gray-100 rounded-md animate-pulse" />
          ) : catalogError ? (
            <p className="text-sm text-red-600">Failed to load quantities: {catalogError}</p>
          ) : (
            <select {...register('quantityId')} className={selectClasses} defaultValue={existingRecord?.quantityId ?? ''}>
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

        <FormField label="Quantity Produced" error={errors.quantityProduced?.message} required>
          <input {...register('quantityProduced')} type="number" min={1} className={inputClasses} placeholder="e.g. 200" />
        </FormField>

        <FormField label="Production Date (optional)" error={errors.productionDate?.message}>
          <input {...register('productionDate')} type="datetime-local" className={inputClasses} />
        </FormField>

        <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
          <button
            type="submit"
            disabled={isSubmitting || isCatalogLoading}
            className="bg-brand hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
          >
            {isSubmitting ? 'Saving...' : isEditMode ? 'Save Changes' : 'Record Production'}
          </button>
          <button
            type="button"
            onClick={() => navigate(FACTORY_PATHS.production.list)}
            className="text-sm text-gray-600 hover:text-gray-900 px-4 py-2"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
