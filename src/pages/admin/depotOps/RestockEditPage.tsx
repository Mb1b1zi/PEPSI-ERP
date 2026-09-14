import { useEffect, useState } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { updateRestockSchema, type UpdateRestockValues } from '@/schemas/restockSchema';
import { depotService } from '@/services/depotService';
import { getApiErrorMessage } from '@/lib/apiClient';
import { FormField } from '@/components/forms/FormField';
import { ADMIN_PATHS } from '@/routes/paths';
import type { RestockEntry } from '@/types/restock';

const inputClasses =
  'border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand';

export function RestockEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [entry, setEntry] = useState<RestockEntry | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateRestockValues>({
    resolver: zodResolver(updateRestockSchema) as Resolver<UpdateRestockValues>,
  });

  useEffect(() => {
    if (!id) return;
    depotService
      .getRestockById(Number(id))
      .then((data) => {
        setEntry(data);
        reset({ quantityDelivered: data.quantityDelivered });
      })
      .catch((err) => setLoadError(getApiErrorMessage(err, 'Failed to load restock entry.')));
  }, [id, reset]);

  async function onSubmit(values: UpdateRestockValues) {
    if (!id) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await depotService.updateRestock(Number(id), values);
      navigate(ADMIN_PATHS.depotOps.restock.list);
    } catch (err) {
      setSubmitError(getApiErrorMessage(err, 'Failed to update restock entry.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-semibold text-gray-900">Edit Delivered Quantity</h1>
      <p className="text-gray-500 mt-1">Corrects the recorded amount; the depot's current stock is re-synced automatically.</p>

      {loadError && (
        <div className="mt-6 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-4 py-3">{loadError}</div>
      )}

      {entry && (
        <div className="mt-6 grid grid-cols-2 gap-4 text-sm text-gray-600 bg-gray-50 rounded-md p-4">
          <div><span className="text-gray-400">Depot</span><div className="text-gray-900 font-medium">{entry.depotName}</div></div>
          <div><span className="text-gray-400">Product</span><div className="text-gray-900 font-medium">{entry.productName}</div></div>
        </div>
      )}

      {entry && (
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 bg-white border border-gray-200 rounded-lg p-6 flex flex-col gap-5">
          <FormField label="Quantity Delivered" error={errors.quantityDelivered?.message} required>
            <input {...register('quantityDelivered')} type="number" min={1} className={inputClasses} />
          </FormField>

          {submitError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-4 py-3">{submitError}</div>
          )}

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
              onClick={() => navigate(ADMIN_PATHS.depotOps.restock.list)}
              className="text-sm text-gray-600 hover:text-gray-900 px-4 py-2"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
