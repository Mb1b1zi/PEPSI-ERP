import { useEffect, useState } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { userSchema, type UserValues } from '@/schemas/userSchema';
import { userService } from '@/services/userService';
import { useRoles } from '@/hooks/useRoles';
import { useDepotLocations } from '@/hooks/useDepotLocations';
import { useToast } from '@/hooks/useToast';
import { FormField } from '@/components/forms/FormField';
import { ADMIN_PATHS } from '@/routes/paths';

const inputClasses =
  'border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand';
const selectClasses = inputClasses;

export function UserFormPage() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();
  const { roles } = useRoles();
  const { depots } = useDepotLocations();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserValues>({
    resolver: zodResolver(userSchema) as Resolver<UserValues>,
    defaultValues: { name: '', email: '', gender: undefined, contact: '', salary: undefined, roleId: undefined, depotId: undefined },
  });

  useEffect(() => {
    if (id) {
      userService.getUserById(Number(id)).then((user) => {
        if (user) {
          reset({
            name: user.name,
            email: user.email ?? '',
            gender: user.gender,
            contact: user.contact,
            salary: user.salary ?? undefined,
            roleId: user.roleId ?? undefined,
            depotId: user.depotId ?? undefined,
          });
        }
      });
    }
  }, [id, reset]);

  async function onSubmit(values: UserValues) {
    setIsSubmitting(true);
    try {
      const input = {
        name: values.name,
        email: values.email || undefined,
        gender: values.gender,
        contact: values.contact,
        salary: values.salary,
        roleId: values.roleId,
        depotId: values.depotId,
      };
      if (isEditMode && id) {
        await userService.updateUser(Number(id), input);
        toast.success('User updated.');
      } else {
        await userService.createUser(input);
        toast.success('User created.');
      }
      navigate(ADMIN_PATHS.users.list);
    } catch {
      toast.error(isEditMode ? 'Failed to update user.' : 'Failed to create user.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-semibold text-gray-900">
        {isEditMode ? 'Edit User' : 'Add User'}
      </h1>
      <p className="text-gray-500 mt-1">
        {isEditMode ? 'Update user details.' : 'Register a new system user.'}
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 bg-white border border-gray-200 rounded-lg p-6 flex flex-col gap-5">
        <FormField label="Full Name" error={errors.name?.message} required>
          <input {...register('name')} className={inputClasses} placeholder="e.g. Sarah Nakato" />
        </FormField>

        <FormField label="Email Address (optional)" error={errors.email?.message}>
          <input {...register('email')} type="email" className={inputClasses} placeholder="name@pepsicolor.com" />
        </FormField>

        <FormField label="Gender" error={errors.gender?.message} required>
          <select {...register('gender')} className={selectClasses} defaultValue="">
            <option value="" disabled>Select…</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </FormField>

        <FormField label="Contact Number" error={errors.contact?.message} required>
          <input {...register('contact')} className={inputClasses} placeholder="+256 700 000 000" />
        </FormField>

        <FormField label="Salary (optional)" error={errors.salary?.message}>
          <input {...register('salary')} type="number" min={0} step="0.01" className={inputClasses} />
        </FormField>

        <FormField label="Role (optional)" error={errors.roleId?.message}>
          <select {...register('roleId')} className={selectClasses} defaultValue="">
            <option value="">Unassigned</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </FormField>

        <FormField label="Depot (optional)" error={errors.depotId?.message}>
          <select {...register('depotId')} className={selectClasses} defaultValue="">
            <option value="">Unassigned</option>
            {depots.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </FormField>

        <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-brand hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
          >
            {isSubmitting ? 'Saving...' : isEditMode ? 'Save Changes' : 'Create User'}
          </button>
          <button
            type="button"
            onClick={() => navigate(ADMIN_PATHS.users.list)}
            className="text-sm text-gray-600 hover:text-gray-900 px-4 py-2"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
