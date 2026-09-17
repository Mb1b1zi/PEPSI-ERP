import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation, useNavigate, type Location } from 'react-router-dom';
import { loginSchema, type LoginValues } from '@/schemas/loginSchema';
import { useAuth } from '@/hooks/useAuth';
import { FormField } from '@/components/forms/FormField';
import { getApiErrorMessage } from '@/lib/apiClient';
import { getDefaultLandingPath } from '@/lib/roleLanding';

const inputClasses =
  'border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand';

interface LocationState {
  from?: Location;
}

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(values: LoginValues) {
    setFormError(null);
    setIsSubmitting(true);
    try {
      const user = await login(values.email, values.password);
      const state = location.state as LocationState | null;
      const redirectTo = state?.from ? `${state.from.pathname}${state.from.search}` : getDefaultLandingPath(user);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setFormError(getApiErrorMessage(err, 'Invalid email or password.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-gray-900 text-center">Pepsi Color ERP</h1>
        <p className="text-gray-500 mt-1 text-center">Sign in to continue.</p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-6 bg-white border border-gray-200 rounded-lg p-6 flex flex-col gap-5"
        >
          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-4 py-3">
              {formError}
            </div>
          )}

          <FormField label="Email Address" error={errors.email?.message} required>
            <input
              {...register('email')}
              type="email"
              className={inputClasses}
              placeholder="name@pepsicolor.com"
              autoFocus
            />
          </FormField>

          <FormField label="Password" error={errors.password?.message} required>
            <input {...register('password')} type="password" className={inputClasses} placeholder="••••••••" />
          </FormField>

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-brand hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
