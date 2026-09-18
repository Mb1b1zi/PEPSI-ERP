import { useState } from 'react';
import { PackageCheck, Clock, XCircle, Boxes } from 'lucide-react';
import { useSupplyReport } from '@/hooks/useSupplyReport';
import { useCatalog } from '@/hooks/useCatalog';
import { getPeriodRange, type ReportPeriod } from '@/lib/reportPeriods';
import { StatCard } from '@/components/cards/StatCard';
import { Table, type Column } from '@/components/tables/Table';
import type { DepotSupplyBreakdown } from '@/hooks/useSupplyReport';

const inputClasses =
  'border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand';

const PERIOD_OPTIONS: { value: ReportPeriod; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'Last 7 Days' },
  { value: 'month', label: 'This Month' },
  { value: 'custom', label: 'Custom Range' },
];

const columns: Column<DepotSupplyBreakdown>[] = [
  { header: 'Depot', render: (d) => <span className="font-medium text-gray-900">{d.depotName}</span> },
  { header: 'Units Dispatched', render: (d) => d.totalAmount.toLocaleString() },
  { header: 'Received', render: (d) => d.receivedCount },
  { header: 'Pending', render: (d) => d.pendingCount },
  { header: 'Rejected', render: (d) => d.rejectedCount },
];

export function SupplyReportPage() {
  const [period, setPeriod] = useState<ReportPeriod>('today');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [depotIdInput, setDepotIdInput] = useState('');
  const { depots, isLoading: isCatalogLoading } = useCatalog();

  function handlePeriodClick(next: ReportPeriod) {
    if (next === 'custom' && (!customFrom || !customTo)) {
      const seed = getPeriodRange(period === 'custom' ? 'today' : period);
      setCustomFrom(seed.dateFrom);
      setCustomTo(seed.dateTo);
    }
    setPeriod(next);
  }

  const range = period === 'custom' ? { dateFrom: customFrom, dateTo: customTo } : getPeriodRange(period);
  const depotId = depotIdInput === '' ? undefined : Number(depotIdInput);
  const report = useSupplyReport({ dateFrom: range.dateFrom, dateTo: range.dateTo, depotId });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-900">Supply Report</h1>
      <p className="text-gray-500 mt-1">Factory dispatches to depots, broken down by depot.</p>

      <div className="mt-6 flex items-end gap-3 flex-wrap">
        <div className="flex gap-2">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handlePeriodClick(opt.value)}
              className={`text-sm px-3 py-2 rounded-md border transition-colors ${
                period === opt.value
                  ? 'bg-brand text-white border-brand'
                  : 'text-gray-600 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {period === 'custom' && (
          <>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">From</label>
              <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} className={inputClasses} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">To</label>
              <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} className={inputClasses} />
            </div>
          </>
        )}

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1.5">Depot</label>
          <select
            value={depotIdInput}
            onChange={(e) => setDepotIdInput(e.target.value)}
            disabled={isCatalogLoading}
            className={inputClasses}
          >
            <option value="">All depots</option>
            {depots.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {(period === 'week' || period === 'month' || period === 'custom') && (
        <div className="mt-6 bg-blue-50 border border-blue-200 text-blue-700 text-sm rounded-md px-4 py-3">
          Multi-day supply reports load one request per day (the Factory API only accepts a single exact
          date, not a range) — this may take a moment for longer ranges.
        </div>
      )}

      {report.error && (
        <div className="mt-6 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-4 py-3">
          {report.error}
        </div>
      )}

      {report.isTruncated && !report.isLoading && (
        <div className="mt-6 bg-amber-50 border border-amber-200 text-amber-700 text-sm rounded-md px-4 py-3">
          This range has more supply records than could be fully summed — totals below reflect only a
          partial set. Narrow the date range or depot filter for an exact total.
        </div>
      )}

      {report.isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-[76px] bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-6">
          <StatCard label="Units Dispatched" value={report.totalAmount.toLocaleString()} icon={<Boxes size={20} />} />
          <StatCard label="Received" value={report.receivedCount} icon={<PackageCheck size={20} />} />
          <StatCard label="Pending" value={report.pendingCount} icon={<Clock size={20} />} />
          <StatCard label="Rejected" value={report.rejectedCount} icon={<XCircle size={20} />} />
        </div>
      )}

      <div className="mt-6">
        {report.isLoading ? (
          <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        ) : (
          <Table
            columns={columns}
            data={report.byDepot}
            getRowKey={(d) => d.depotName}
            emptyMessage="No supply activity in this range."
          />
        )}
      </div>
    </div>
  );
}
