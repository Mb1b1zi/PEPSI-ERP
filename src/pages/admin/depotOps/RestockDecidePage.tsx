import { useState } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import {
  confirmRestockSchema,
  rejectRestockSchema,
  type ConfirmRestockValues,
  type RejectRestockValues,
} from '@/schemas/restockSchema';
import { depotService } from '@/services/depotService';
import { getApiErrorMessage } from '@/lib/apiClient';
import { FormField } from '@/components/forms/FormField';
import { Badge } from '@/components/badges/Badge';
import { ADMIN_PATHS } from '@/routes/paths';
import type { RestockEntry } from '@/types/restock';

const inputClasses =
  'border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand';

type Action = 'confirm' | 'reject';

function ResultBanner({ result }: { result: RestockEntry }) {
  return (
    <div className="mt-6 bg-gray-50 border border-gray-200 rounded-md px-4 py-3 flex items-center gap-3">
      <span className="text-sm text-gray-600">Result:</span>
      <Badge label={result.status} color={result.status === 'confirmed' ? 'green' : 'red'} />
      {result.rejectionReason && <span className="text-sm text-gray-500">— {result.rejectionReason}</span>}
    </div>
  );
}

function ConfirmForm({ onResult }: { onResult: (r: RestockEntry) => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ConfirmRestockValues>({
    resolver: zodResolver(confirmRestockSchema) as Resolver<ConfirmRestockValues>,
  });

  async function onSubmit(values: ConfirmRestockValues) {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const result = await depotService.confirmRestock(values.supplyHistoryId, {
        depotId: values.depotId,
        quantityReceived: values.quantityReceived,
        supplierId: values.supplierId,
        confirmedById: values.confirmedById,
      });
      onResult(result);
    } catch (err) {
      setSubmitError(getApiErrorMessage(err, 'Failed to confirm delivery.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 bg-white border border-gray-200 rounded-lg p-6 flex flex-col gap-5">
      <FormField label="Supply History ID" error={errors.supplyHistoryId?.message} required>
        <input {...register('supplyHistoryId')} type="number" min={1} className={inputClasses} placeholder="e.g. 20" />
      </FormField>
      <FormField label="Depot ID" error={errors.depotId?.message} required>
        <input {...register('depotId')} type="number" min={1} className={inputClasses} placeholder="e.g. 3" />
      </FormField>
      <FormField label="Quantity Received" error={errors.quantityReceived?.message} required>
        <input {...register('quantityReceived')} type="number" min={1} className={inputClasses} placeholder="e.g. 60" />
      </FormField>
      <FormField label="Supplier ID (optional)" error={errors.supplierId?.message}>
        <input {...register('supplierId')} type="number" min={1} className={inputClasses} placeholder="e.g. 8" />
      </FormField>
      <FormField label="Confirmed By ID (optional)" error={errors.confirmedById?.message}>
        <input {...register('confirmedById')} type="number" min={1} className={inputClasses} placeholder="e.g. 8" />
      </FormField>

      {submitError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-4 py-3">{submitError}</div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="self-start bg-brand hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
      >
        {isSubmitting ? 'Submitting...' : 'Confirm Delivery'}
      </button>
    </form>
  );
}

function RejectForm({ onResult }: { onResult: (r: RestockEntry) => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RejectRestockValues>({
    resolver: zodResolver(rejectRestockSchema) as Resolver<RejectRestockValues>,
  });

  async function onSubmit(values: RejectRestockValues) {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const result = await depotService.rejectRestock(values.supplyHistoryId, {
        depotId: values.depotId,
        reason: values.reason,
        confirmedById: values.confirmedById,
        quantityReceived: values.quantityReceived,
        supplierId: values.supplierId,
      });
      onResult(result);
    } catch (err) {
      setSubmitError(getApiErrorMessage(err, 'Failed to reject delivery.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 bg-white border border-gray-200 rounded-lg p-6 flex flex-col gap-5">
      <FormField label="Supply History ID" error={errors.supplyHistoryId?.message} required>
        <input {...register('supplyHistoryId')} type="number" min={1} className={inputClasses} placeholder="e.g. 20" />
      </FormField>
      <FormField label="Depot ID" error={errors.depotId?.message} required>
        <input {...register('depotId')} type="number" min={1} className={inputClasses} placeholder="e.g. 3" />
      </FormField>
      <FormField label="Reason" error={errors.reason?.message} required>
        <input {...register('reason')} className={inputClasses} placeholder="e.g. Truck broke down, crates never arrived" />
      </FormField>
      <FormField label="Quantity Received (optional)" error={errors.quantityReceived?.message}>
        <input {...register('quantityReceived')} type="number" min={1} className={inputClasses} />
      </FormField>
      <FormField label="Supplier ID (optional)" error={errors.supplierId?.message}>
        <input {...register('supplierId')} type="number" min={1} className={inputClasses} />
      </FormField>
      <FormField label="Confirmed By ID (optional)" error={errors.confirmedById?.message}>
        <input {...register('confirmedById')} type="number" min={1} className={inputClasses} />
      </FormField>

      {submitError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-4 py-3">{submitError}</div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="self-start bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
      >
        {isSubmitting ? 'Submitting...' : 'Reject Delivery'}
      </button>
    </form>
  );
}

export function RestockDecidePage() {
  const navigate = useNavigate();
  const [action, setAction] = useState<Action>('confirm');
  const [result, setResult] = useState<RestockEntry | null>(null);

  const tabClasses = (active: boolean) =>
    `px-4 py-2 text-sm font-medium rounded-md transition-colors ${
      active ? 'bg-brand text-white' : 'text-gray-600 hover:bg-gray-100'
    }`;

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-semibold text-gray-900">Confirm/Reject Delivery</h1>
      <p className="text-gray-500 mt-1">
        Decide a factory dispatch (<code>supply_history_id</code>) as received or rejected at a depot.
      </p>

      <div className="mt-6 flex items-center gap-2">
        <button
          type="button"
          className={tabClasses(action === 'confirm')}
          onClick={() => {
            setAction('confirm');
            setResult(null);
          }}
        >
          Confirm
        </button>
        <button
          type="button"
          className={tabClasses(action === 'reject')}
          onClick={() => {
            setAction('reject');
            setResult(null);
          }}
        >
          Reject
        </button>
      </div>

      {action === 'confirm' ? <ConfirmForm onResult={setResult} /> : <RejectForm onResult={setResult} />}

      {result && <ResultBanner result={result} />}

      <div className="mt-4">
        <button
          type="button"
          onClick={() => navigate(ADMIN_PATHS.depotOps.restock.list)}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          Back to Restock History
        </button>
      </div>
    </div>
  );
}
