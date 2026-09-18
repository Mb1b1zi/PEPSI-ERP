import { useEffect, useState } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import {
  supplyCreateSchema,
  supplyDecideSchema,
  type SupplyCreateValues,
  type SupplyDecideValues,
} from '@/schemas/supplySchema';
import { factoryService } from '@/services/factoryService';
import { getApiErrorMessage } from '@/lib/apiClient';
import { useCatalog } from '@/hooks/useCatalog';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/hooks/useAuth';
import { FormField } from '@/components/forms/FormField';
import { FACTORY_PATHS } from '@/routes/paths';
import type { SupplyRecord } from '@/types/factory';

const inputClasses =
  'border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand';
const selectClasses = inputClasses;

function CreateSupplyForm() {
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const { products, quantities, depots, isLoading: isCatalogLoading, error: catalogError } = useCatalog();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SupplyCreateValues>({ resolver: zodResolver(supplyCreateSchema) as Resolver<SupplyCreateValues> });

  async function onSubmit(values: SupplyCreateValues) {
    setIsSubmitting(true);
    try {
      // supplier_id is a required personnel id on the real backend — the logged-in user
      // recording the dispatch is the natural default, since there's no supplier picker
      // (nothing in this app models "suppliers" as a distinct concept from personnel).
      await factoryService.createSupply({ ...values, supplierId: user?.personnelId ?? 0 });
      toast.success('Supply record created.');
      navigate(FACTORY_PATHS.supplies.list);
    } catch (err) {
      const message = err instanceof Error ? err.message : getApiErrorMessage(err, 'Failed to create supply record.');
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 bg-white border border-gray-200 rounded-lg p-6 flex flex-col gap-5">
      <FormField label="Product" error={errors.productId?.message} required>
        {isCatalogLoading ? (
          <div className="h-[38px] bg-gray-100 rounded-md animate-pulse" />
        ) : catalogError ? (
          <p className="text-sm text-red-600">Failed to load products: {catalogError}</p>
        ) : (
          <select {...register('productId')} className={selectClasses} defaultValue="">
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
          <select {...register('quantityId')} className={selectClasses} defaultValue="">
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
        <input {...register('amount')} type="number" min={1} className={inputClasses} placeholder="e.g. 80" />
      </FormField>

      <FormField label="Depot" error={errors.depotId?.message} required>
        {isCatalogLoading ? (
          <div className="h-[38px] bg-gray-100 rounded-md animate-pulse" />
        ) : catalogError ? (
          <p className="text-sm text-red-600">Failed to load depots: {catalogError}</p>
        ) : (
          <select {...register('depotId')} className={selectClasses} defaultValue="">
            <option value="" disabled>
              Select a depot…
            </option>
            {depots.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        )}
      </FormField>

      <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
        <button
          type="submit"
          disabled={isSubmitting || isCatalogLoading}
          className="bg-brand hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
        >
          {isSubmitting ? 'Saving...' : 'Create Supply'}
        </button>
        <button
          type="button"
          onClick={() => navigate(FACTORY_PATHS.supplies.list)}
          className="text-sm text-gray-600 hover:text-gray-900 px-4 py-2"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function DecideSupplyForm({ record }: { record: SupplyRecord }) {
  const navigate = useNavigate();
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SupplyDecideValues>({
    resolver: zodResolver(supplyDecideSchema) as Resolver<SupplyDecideValues>,
    defaultValues: {
      status: record.status === 'pending' ? 'received' : record.status,
      rejectionReason: record.rejectionReason ?? '',
    },
  });
  const status = watch('status');

  async function onSubmit(values: SupplyDecideValues) {
    setIsSubmitting(true);
    try {
      await factoryService.updateSupply(record.id, values);
      toast.success('Supply record updated.');
      navigate(FACTORY_PATHS.supplies.list);
    } catch (err) {
      const message = err instanceof Error ? err.message : getApiErrorMessage(err, 'Failed to update supply record.');
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 bg-white border border-gray-200 rounded-lg p-6 flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 bg-gray-50 rounded-md p-4">
        <div><span className="text-gray-400">Product</span><div className="text-gray-900 font-medium">{record.productName}</div></div>
        <div><span className="text-gray-400">Quantity</span><div className="text-gray-900 font-medium">{record.quantityValue}</div></div>
        <div><span className="text-gray-400">Amount</span><div className="text-gray-900 font-medium">{record.amount}</div></div>
      </div>

      <FormField label="Status" error={errors.status?.message} required>
        <select {...register('status')} className={selectClasses}>
          <option value="received">Received</option>
          <option value="rejected">Rejected</option>
        </select>
      </FormField>

      {status === 'rejected' && (
        <FormField label="Rejection Reason" error={errors.rejectionReason?.message} required>
          <input {...register('rejectionReason')} className={inputClasses} placeholder="e.g. Damaged in transit" />
        </FormField>
      )}

      <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-brand hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
        >
          {isSubmitting ? 'Saving...' : 'Save Decision'}
        </button>
        <button
          type="button"
          onClick={() => navigate(FACTORY_PATHS.supplies.list)}
          className="text-sm text-gray-600 hover:text-gray-900 px-4 py-2"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export function SupplyFormPage() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const [record, setRecord] = useState<SupplyRecord | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Fetches by id (GET /factory/supplies/{id}) rather than relying on state passed from the
  // list page, so a direct URL/refresh still loads the record correctly.
  useEffect(() => {
    if (id) {
      factoryService
        .getSupplyById(Number(id))
        .then(setRecord)
        .catch((err) => setLoadError(getApiErrorMessage(err, 'Failed to load supply record.')));
    }
  }, [id]);

  if (isEditMode && loadError) {
    return (
      <div className="p-6 max-w-2xl">
        <h1 className="text-2xl font-semibold text-gray-900">Decide Supply Record</h1>
        <div className="mt-6 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-4 py-3">{loadError}</div>
      </div>
    );
  }

  if (isEditMode && !record) {
    return (
      <div className="p-6 max-w-2xl">
        <h1 className="text-2xl font-semibold text-gray-900">Decide Supply Record</h1>
        <div className="mt-6 bg-white border border-gray-200 rounded-lg p-6 space-y-3">
          <div className="h-10 bg-gray-100 rounded animate-pulse" />
          <div className="h-10 bg-gray-100 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-semibold text-gray-900">{isEditMode ? 'Decide Supply Record' : 'Add Supply'}</h1>
      <p className="text-gray-500 mt-1">
        {isEditMode
          ? 'Mark this pending supply as received or rejected.'
          : 'Dispatch a supply from factory stock and decrease available quantity.'}
      </p>

      {isEditMode && record ? <DecideSupplyForm record={record} /> : <CreateSupplyForm />}
    </div>
  );
}
