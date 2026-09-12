import { useEffect, useState } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { userCreateSchema, userEditSchema, type UserCreateValues } from '@/schemas/userSchema';
import { userService, type UpdateUserInput } from '@/services/userService';
import { FormField } from '@/components/forms/FormField';
import { ADMIN_PATHS } from '@/routes/paths';

type UserFormValues = UserCreateValues;

const inputClasses =
  'border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand';

export function UserFormPage() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(isEditMode ? userEditSchema : userCreateSchema) as Resolver<UserFormValues>,
    defaultValues: { name: '', email: '', contact: '', password: '' },
  });

  useEffect(() => {
    if (id) {
      userService.getUserById(id).then((user) => {
        if (user) {
          reset({ name: user.name, email: user.email, contact: user.contact, password: '' });
        }
      });
    }
  }, [id, reset]);

  async function onSubmit(values: UserFormValues) {
    setIsSubmitting(true);
    try {
      if (isEditMode && id) {
        const { password, ...rest } = values;
        const payload: UpdateUserInput = password ? { ...rest, password } : rest;
        await userService.updateUser(id, payload);
      } else {
        await userService.createUser(values);
      }
      navigate(ADMIN_PATHS.users.list);
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
        {isEditMode ? 'Update user details.' : 'Register a new system user.'} Roles are assigned afterward under Roles & Permissions.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 bg-white border border-gray-200 rounded-lg p-6 flex flex-col gap-5">
        <FormField label="Full Name" error={errors.name?.message} required>
          <input {...register('name')} className={inputClasses} placeholder="e.g. Sarah Nakato" />
        </FormField>

        <FormField label="Email Address" error={errors.email?.message} required>
          <input {...register('email')} type="email" className={inputClasses} placeholder="name@pepsicolor.com" />
        </FormField>

        <FormField label="Contact Number" error={errors.contact?.message} required>
          <input {...register('contact')} className={inputClasses} placeholder="+256 700 000 000" />
        </FormField>

        <FormField label={isEditMode ? 'New Password (leave blank to keep current)' : 'Password'} error={errors.password?.message} required={!isEditMode}>
          <input {...register('password')} type="password" className={inputClasses} placeholder="••••••••" />
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