import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { productSchema, type ProductValues } from '@/schemas/productSchema';
import { productService } from '@/services/productService';
import { useToast } from '@/hooks/useToast';
import { FormField } from '@/components/forms/FormField';
import { ADMIN_PATHS } from '@/routes/paths';

const inputClasses =
  'border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand';

export function ProductFormPage() {
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
  } = useForm<ProductValues>({
    resolver: zodResolver(productSchema),
    defaultValues: { name: '' },
  });

  useEffect(() => {
    if (id) {
      productService.getProductById(Number(id)).then((product) => {
        if (product) reset({ name: product.name });
      });
    }
  }, [id, reset]);

  async function onSubmit(values: ProductValues) {
    setIsSubmitting(true);
    try {
      if (isEditMode && id) {
        await productService.updateProduct(Number(id), values);
        toast.success('Product updated.');
      } else {
        await productService.createProduct(values);
        toast.success('Product created.');
      }
      navigate(ADMIN_PATHS.products.list);
    } catch {
      toast.error(isEditMode ? 'Failed to update product.' : 'Failed to create product.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-semibold text-gray-900">{isEditMode ? 'Edit Product' : 'Add Product'}</h1>
      <p className="text-gray-500 mt-1">
        {isEditMode ? 'Update this product.' : 'Add a new product to the catalog.'}
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 bg-white border border-gray-200 rounded-lg p-6 flex flex-col gap-5">
        <FormField label="Name" error={errors.name?.message} required>
          <input {...register('name')} className={inputClasses} placeholder="e.g. Pepsi 500ml" />
        </FormField>

        <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-brand hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
          >
            {isSubmitting ? 'Saving...' : isEditMode ? 'Save Changes' : 'Create Product'}
          </button>
          <button
            type="button"
            onClick={() => navigate(ADMIN_PATHS.products.list)}
            className="text-sm text-gray-600 hover:text-gray-900 px-4 py-2"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
