import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { quantitySchema, type QuantityValues } from '@/schemas/quantitySchema';
import { quantityService } from '@/services/quantityService';
import { useToast } from '@/hooks/useToast';
import { FormField } from '@/components/forms/FormField';
import { ADMIN_PATHS } from '@/routes/paths';

const inputClasses =
  'border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand';

export function QuantityFormPage() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<QuantityValues>({
    resolver: zodResolver(quantitySchema),
    defaultValues: { value: '' },
  });

  useEffect(() => {
    if (id) {
      quantityService.getQuantityById(Number(id)).then((quantity) => {
        if (quantity) reset({ value: quantity.value });
      });
    }
  }, [id, reset]);

  async function onSubmit(values: QuantityValues) {
    setIsSubmitting(true);
    try {
      if (isEditMode && id) {
        await quantityService.updateQuantity(Number(id), values);
        toast.success('Quantity updated.');
      } else {
        await quantityService.createQuantity(values);
        toast.success('Quantity created.');
      }
      navigate(ADMIN_PATHS.quantities.list);
    } catch {
      toast.error(isEditMode ? 'Failed to update quantity.' : 'Failed to create quantity.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-semibold text-gray-900">{isEditMode ? 'Edit Quantity' : 'Add Quantity'}</h1>
      <p className="text-gray-500 mt-1">
        {isEditMode ? 'Update this pack-size/quantity.' : 'Add a new pack-size/quantity to the catalog.'}
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 bg-white border border-gray-200 rounded-lg p-6 flex flex-col gap-5">
        <FormField label="Value" error={errors.value?.message} required>
          <input {...register('value')} className={inputClasses} placeholder="e.g. 500ml, Crate-24" />
        </FormField>

        <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-brand hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
          >
            {isSubmitting ? 'Saving...' : isEditMode ? 'Save Changes' : 'Create Quantity'}
          </button>
          <button
            type="button"
            onClick={() => navigate(ADMIN_PATHS.quantities.list)}
            className="text-sm text-gray-600 hover:text-gray-900 px-4 py-2"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
