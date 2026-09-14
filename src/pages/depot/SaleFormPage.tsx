import { useEffect, useState } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import {
  saleCreateSchema,
  saleUpdateSchema,
  type SaleCreateValues,
  type SaleUpdateValues,
} from '@/schemas/saleSchema';
import { depotService } from '@/services/depotService';
import { getApiErrorMessage } from '@/lib/apiClient';
import { useCatalog } from '@/hooks/useCatalog';
import { useToast } from '@/hooks/useToast';
import { FormField } from '@/components/forms/FormField';
import { DEPOT_PATHS } from '@/routes/paths';
import type { SaleRecord } from '@/types/sale';

const inputClasses =
  'border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand';
const selectClasses = inputClasses;

function CreateSaleForm() {
  const navigate = useNavigate();
  const toast = useToast();
  const { depots, products, quantities, isLoading: isCatalogLoading, error: catalogError } = useCatalog();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SaleCreateValues>({ resolver: zodResolver(saleCreateSchema) as Resolver<SaleCreateValues> });

  async function onSubmit(values: SaleCreateValues) {
    setIsSubmitting(true);
    try {
      await depotService.createSale(values);
      toast.success('Sale recorded.');
      navigate(DEPOT_PATHS.sales.list);
    } catch (err) {
      const message = err instanceof Error ? err.message : getApiErrorMessage(err, 'Failed to record sale.');
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 bg-white border border-gray-200 rounded-lg p-6 flex flex-col gap-5">
      <FormField label="Depot" error={errors.depotId?.message} required>
        {isCatalogLoading ? (
          <div className="h-[38px] bg-gray-100 rounded-md animate-pulse" />
        ) : catalogError ? (
          <p className="text-sm text-red-600">Failed to load depots: {catalogError}</p>
        ) : (
          <select {...register('depotId')} className={selectClasses} defaultValue="">
            <option value="" disabled>Select a depot…</option>
            {depots.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        )}
      </FormField>

      <FormField label="Product" error={errors.productId?.message} required>
        {isCatalogLoading ? (
          <div className="h-[38px] bg-gray-100 rounded-md animate-pulse" />
        ) : catalogError ? (
          <p className="text-sm text-red-600">Failed to load products: {catalogError}</p>
        ) : (
          <select {...register('productId')} className={selectClasses} defaultValue="">
            <option value="" disabled>Select a product…</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
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
          <select {...register('quantityId')} className={selectClasses} defaultValue="">
            <option value="" disabled>Select a quantity…</option>
            {quantities.map((q) => (
              <option key={q.id} value={q.id}>{q.value}</option>
            ))}
          </select>
        )}
      </FormField>

      <FormField label="Quantity Sold" error={errors.quantitySold?.message} required>
        <input {...register('quantitySold')} type="number" min={1} className={inputClasses} placeholder="e.g. 20" />
      </FormField>

      <FormField label="Sold By ID (optional)" error={errors.soldById?.message}>
        <input {...register('soldById')} type="number" min={1} className={inputClasses} placeholder="e.g. 8" />
      </FormField>

      <FormField label="Amount Sold (optional — auto-priced if left blank)" error={errors.amountSold?.message}>
        <input {...register('amountSold')} type="number" min={0} step="0.01" className={inputClasses} />
      </FormField>

      <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
        <button
          type="submit"
          disabled={isSubmitting || isCatalogLoading}
          className="bg-brand hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
        >
          {isSubmitting ? 'Saving...' : 'Record Sale'}
        </button>
        <button
          type="button"
          onClick={() => navigate(DEPOT_PATHS.sales.list)}
          className="text-sm text-gray-600 hover:text-gray-900 px-4 py-2"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function EditSaleForm({ id }: { id: string }) {
  const navigate = useNavigate();
  const toast = useToast();
  const [sale, setSale] = useState<SaleRecord | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SaleUpdateValues>({ resolver: zodResolver(saleUpdateSchema) as Resolver<SaleUpdateValues> });

  useEffect(() => {
    depotService
      .getSaleById(Number(id))
      .then((data) => {
        setSale(data);
        reset({ quantitySold: data.quantitySold, amountSold: data.soldAmount });
      })
      .catch((err) => setLoadError(getApiErrorMessage(err, 'Failed to load sale.')));
  }, [id, reset]);

  async function onSubmit(values: SaleUpdateValues) {
    setIsSubmitting(true);
    try {
      await depotService.updateSale(Number(id), values);
      toast.success('Sale updated.');
      navigate(DEPOT_PATHS.sales.list);
    } catch (err) {
      const message = err instanceof Error ? err.message : getApiErrorMessage(err, 'Failed to update sale.');
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loadError) {
    return <div className="mt-6 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-4 py-3">{loadError}</div>;
  }

  if (!sale) return null;

  return (
    <>
      <div className="mt-6 grid grid-cols-2 gap-4 text-sm text-gray-600 bg-gray-50 rounded-md p-4">
        <div><span className="text-gray-400">Depot</span><div className="text-gray-900 font-medium">{sale.depotName}</div></div>
        <div><span className="text-gray-400">Product</span><div className="text-gray-900 font-medium">{sale.productName}</div></div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 bg-white border border-gray-200 rounded-lg p-6 flex flex-col gap-5">
        <FormField label="Quantity Sold" error={errors.quantitySold?.message} required>
          <input {...register('quantitySold')} type="number" min={1} className={inputClasses} />
        </FormField>
        <FormField label="Amount Sold" error={errors.amountSold?.message} required>
          <input {...register('amountSold')} type="number" min={0} step="0.01" className={inputClasses} />
        </FormField>

        <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-brand hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => navigate(DEPOT_PATHS.sales.list)}
            className="text-sm text-gray-600 hover:text-gray-900 px-4 py-2"
          >
            Cancel
          </button>
        </div>
      </form>
    </>
  );
}

export function SaleFormPage() {
  const { id } = useParams();
  const isEditMode = Boolean(id);

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-semibold text-gray-900">{isEditMode ? 'Edit Sale' : 'Add Sale'}</h1>
      <p className="text-gray-500 mt-1">
        {isEditMode ? 'Update the recorded quantity and amount.' : 'Record a sale and decrease depot stock.'}
      </p>

      {isEditMode && id ? <EditSaleForm id={id} /> : <CreateSaleForm />}
    </div>
  );
}
