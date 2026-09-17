import { useState } from 'react';
import { ShoppingCart, DollarSign, Receipt } from 'lucide-react';
import { useSalesReport } from '@/hooks/useSalesReport';
import { useCatalog } from '@/hooks/useCatalog';
import { getPeriodRange, type ReportPeriod } from '@/lib/reportPeriods';
import { StatCard } from '@/components/cards/StatCard';
import { Table, type Column } from '@/components/tables/Table';
import type { DepotSalesBreakdown } from '@/hooks/useSalesReport';

const inputClasses =
  'border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand';

const PERIOD_OPTIONS: { value: ReportPeriod; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'Last 7 Days' },
  { value: 'month', label: 'This Month' },
  { value: 'custom', label: 'Custom Range' },
];

const columns: Column<DepotSalesBreakdown>[] = [
  { header: 'Depot', render: (d) => <span className="font-medium text-gray-900">{d.depotName}</span> },
  { header: 'Units Sold', render: (d) => d.totalUnits },
  { header: 'Revenue', render: (d) => d.totalRevenue.toLocaleString() },
  { header: 'Sales Recorded', render: (d) => d.saleCount },
];

export function SalesReportPage() {
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
  const report = useSalesReport({ dateFrom: range.dateFrom, dateTo: range.dateTo, depotId });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-900">Sales Report</h1>
      <p className="text-gray-500 mt-1">Revenue and units sold, broken down by depot.</p>

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

      {report.error && (
        <div className="mt-6 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-4 py-3">
          {report.error}
        </div>
      )}

      {report.isTruncated && !report.isLoading && (
        <div className="mt-6 bg-amber-50 border border-amber-200 text-amber-700 text-sm rounded-md px-4 py-3">
          This range has more sales than could be fully summed — totals below reflect only the first{' '}
          {report.saleCount.toLocaleString()} records. Narrow the date range or depot filter for an exact total.
        </div>
      )}

      {report.isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-[76px] bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <StatCard label="Total Revenue" value={report.totalRevenue.toLocaleString()} icon={<DollarSign size={20} />} />
          <StatCard label="Units Sold" value={report.totalUnits} icon={<ShoppingCart size={20} />} />
          <StatCard label="Sales Recorded" value={report.saleCount} icon={<Receipt size={20} />} />
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
            emptyMessage="No sales recorded in this range."
          />
        )}
      </div>
    </div>
  );
}
