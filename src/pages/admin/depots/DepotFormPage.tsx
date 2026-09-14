import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { depotSchema, type DepotValues } from '@/schemas/depotSchema';
import { depotLocationService } from '@/services/depotLocationService';
import { useToast } from '@/hooks/useToast';
import { FormField } from '@/components/forms/FormField';
import { ADMIN_PATHS } from '@/routes/paths';

const inputClasses =
  'border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand';

export function DepotFormPage() {
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
  } = useForm<DepotValues>({
    resolver: zodResolver(depotSchema),
    defaultValues: { name: '' },
  });

  useEffect(() => {
    if (id) {
      depotLocationService.getDepotById(Number(id)).then((depot) => {
        if (depot) reset({ name: depot.name });
      });
    }
  }, [id, reset]);

  async function onSubmit(values: DepotValues) {
    setIsSubmitting(true);
    try {
      if (isEditMode && id) {
        await depotLocationService.updateDepot(Number(id), values);
        toast.success('Depot updated.');
      } else {
        await depotLocationService.createDepot(values);
        toast.success('Depot created.');
      }
      navigate(ADMIN_PATHS.depots.list);
    } catch {
      toast.error(isEditMode ? 'Failed to update depot.' : 'Failed to create depot.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-semibold text-gray-900">{isEditMode ? 'Edit Depot' : 'Add Depot'}</h1>
      <p className="text-gray-500 mt-1">
        {isEditMode ? 'Update this depot location.' : 'Add a new depot location.'}
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 bg-white border border-gray-200 rounded-lg p-6 flex flex-col gap-5">
        <FormField label="Name" error={errors.name?.message} required>
          <input {...register('name')} className={inputClasses} placeholder="e.g. Nakawa Depot" />
        </FormField>

        <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-brand hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
          >
            {isSubmitting ? 'Saving...' : isEditMode ? 'Save Changes' : 'Create Depot'}
          </button>
          <button
            type="button"
            onClick={() => navigate(ADMIN_PATHS.depots.list)}
            className="text-sm text-gray-600 hover:text-gray-900 px-4 py-2"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
