import React, { useState } from 'react';
import { X, History, Calendar, Download, ArrowRight, FileSpreadsheet, Building2, Filter } from 'lucide-react';
import { exportDailyExpensesPDF, exportMonthlyExpensesPDF } from '../utils/pdfExport';

export default function HistoryModal({ 
  isOpen, 
  onClose, 
  savedHistory = {}, 
  onSelectDate 
}) {
  const [selectedMonthKey, setSelectedMonthKey] = useState('ALL');
  const [isExportingMonthly, setIsExportingMonthly] = useState(false);

  if (!isOpen) return null;

  // Process all saved history entries into daily summary objects
  const dailySummariesMap = {};

  Object.entries(savedHistory).forEach(([key, record]) => {
    if (!record || !record.date) return;
    const dateKey = record.date;

    if (!dailySummariesMap[dateKey]) {
      dailySummariesMap[dateKey] = {
        date: dateKey,
        totalAmount: 0,
        onlineTotal: 0,
        cashTotal: 0,
        withdrawTotal: 0,
        itemCount: 0,
        entries: []
      };
    }

    // If record contains precomputed entries or individual items
    const entriesList = record.entries || (Array.isArray(record) ? record : []);
    
    entriesList.forEach(entry => {
      if (!entry || entry.amount === undefined || entry.amount === '') return;
      const amt = parseFloat(entry.amount);
      if (isNaN(amt) || amt <= 0) return;

      const catId = entry.categoryId || key;
      const pMode = entry.paymentMode || 'Online';
      const isWithdraw = catId === 'cash_withdraw' || entry.isCashWithdraw;

      if (isWithdraw) {
        dailySummariesMap[dateKey].withdrawTotal += amt;
      } else {
        dailySummariesMap[dateKey].totalAmount += amt;
        dailySummariesMap[dateKey].itemCount += 1;
        if (pMode === 'Online') {
          dailySummariesMap[dateKey].onlineTotal += amt;
        } else {
          dailySummariesMap[dateKey].cashTotal += amt;
        }
      }

      dailySummariesMap[dateKey].entries.push({
        ...entry,
        categoryId: catId,
        categoryName: entry.categoryName || catId,
        amount: entry.amount,
        paymentMode: pMode,
        isCashWithdraw: isWithdraw
      });
    });
  });

  // Convert map to array sorted newest first
  const allDailySummaries = Object.values(dailySummariesMap).sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  // Extract available months e.g. "2026-08" -> "August 2026"
  const availableMonthsMap = {};
  allDailySummaries.forEach(item => {
    const d = new Date(item.date + 'T00:00:00');
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const monthLabel = d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
    if (!availableMonthsMap[monthKey]) {
      availableMonthsMap[monthKey] = monthLabel;
    }
  });

  // Filter daily summaries by selected month
  const filteredDailySummaries = allDailySummaries.filter(item => {
    if (selectedMonthKey === 'ALL') return true;
    return item.date.startsWith(selectedMonthKey);
  });

  // Compute overall totals for current view / month filter
  let viewTotal = 0;
  let viewOnline = 0;
  let viewCash = 0;
  let viewWithdraw = 0;
  let viewDaysCount = filteredDailySummaries.length;

  filteredDailySummaries.forEach(day => {
    viewTotal += day.totalAmount;
    viewOnline += day.onlineTotal;
    viewCash += day.cashTotal;
    viewWithdraw += day.withdrawTotal;
  });

  const activeMonthLabel = selectedMonthKey === 'ALL' 
    ? 'All Months' 
    : (availableMonthsMap[selectedMonthKey] || selectedMonthKey);

  const handleDownloadDayPDF = async (daySummary) => {
    await exportDailyExpensesPDF({
      selectedDate: daySummary.date,
      dayEntries: daySummary.entries,
      totalAmount: daySummary.totalAmount,
      withdrawTotal: daySummary.withdrawTotal,
      onlineTotal: daySummary.onlineTotal,
      cashTotal: daySummary.cashTotal,
      itemCount: daySummary.itemCount
    });
  };

  const handleDownloadMonthlyPDF = async () => {
    setIsExportingMonthly(true);
    await exportMonthlyExpensesPDF({
      monthLabel: activeMonthLabel,
      sortedDaySummaries: filteredDailySummaries,
      monthlyTotal: viewTotal,
      monthlyOnline: viewOnline,
      monthlyCash: viewCash,
      monthlyWithdraw: viewWithdraw,
      totalDaysLogged: viewDaysCount
    });
    setIsExportingMonthly(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 shrink-0">
              <History className="w-5.5 h-5.5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-800 tracking-tight">
                Permanent Expense History & Monthly Logs
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Saved history is permanently stored. Filter by month & download monthly reports.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Month Selector & Summary Bar */}
        <div className="p-4 bg-emerald-900 text-white border-b border-emerald-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Month Dropdown Selector */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-emerald-300 shrink-0" />
              <span className="text-xs font-bold text-emerald-200">Select Month:</span>
              <select
                value={selectedMonthKey}
                onChange={(e) => setSelectedMonthKey(e.target.value)}
                className="bg-emerald-800/90 text-white font-extrabold text-xs px-3 py-1.5 rounded-xl border border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer"
              >
                <option value="ALL">All Months ({allDailySummaries.length} days)</option>
                {Object.entries(availableMonthsMap).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Download Monthly Statement Button */}
            <button
              onClick={handleDownloadMonthlyPDF}
              disabled={filteredDailySummaries.length === 0 || isExportingMonthly}
              className="px-4 py-2 rounded-xl text-xs font-extrabold bg-white text-emerald-900 hover:bg-emerald-50 transition-all shadow-md flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-emerald-700" />
              <span>{isExportingMonthly ? 'Generating Monthly PDF...' : `Download ${activeMonthLabel} PDF`}</span>
            </button>
          </div>

          {/* Monthly Totals Overview Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-emerald-800/80">
            <div className="bg-emerald-800/50 p-2.5 rounded-xl border border-emerald-700/60">
              <span className="text-[10px] text-emerald-200 uppercase font-bold block">Total Expense</span>
              <span className="text-base font-black text-white">₹{viewTotal.toLocaleString('en-IN')}</span>
            </div>

            <div className="bg-emerald-800/50 p-2.5 rounded-xl border border-emerald-700/60">
              <span className="text-[10px] text-emerald-200 uppercase font-bold block">Online Spent</span>
              <span className="text-sm font-extrabold text-emerald-100">₹{viewOnline.toLocaleString('en-IN')}</span>
            </div>

            <div className="bg-emerald-800/50 p-2.5 rounded-xl border border-emerald-700/60">
              <span className="text-[10px] text-emerald-200 uppercase font-bold block">Cash Spent</span>
              <span className="text-sm font-extrabold text-amber-200">₹{viewCash.toLocaleString('en-IN')}</span>
            </div>

            <div className="bg-emerald-800/50 p-2.5 rounded-xl border border-emerald-700/60">
              <span className="text-[10px] text-blue-200 uppercase font-bold block">Cash Withdrawals</span>
              <span className="text-sm font-extrabold text-blue-200">₹{viewWithdraw.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Daily History List (Only showing total of each date) */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1 bg-slate-50/40">
          {filteredDailySummaries.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <FileSpreadsheet className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-slate-700">No Saved History Found</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                Click <strong>Save to History</strong> in the top navbar after entering your daily expenses to permanently store your record here!
              </p>
            </div>
          ) : (
            filteredDailySummaries.map((item) => {
              const formattedDate = new Date(item.date + 'T00:00:00').toLocaleDateString('en-IN', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              });

              return (
                <div
                  key={item.date}
                  className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  {/* Left info: Date & Totals */}
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center space-x-1 text-xs font-extrabold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-xl">
                        <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{formattedDate}</span>
                      </span>
                      <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                        {item.itemCount} {item.itemCount === 1 ? 'Expense' : 'Expenses'}
                      </span>
                    </div>

                    {/* Total Amount & Cash/Online Breakdown */}
                    <div className="flex items-baseline space-x-3 pt-1">
                      <span className="text-xl font-black text-slate-900">
                        ₹{item.totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </span>

                      <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
                        <span className="text-emerald-700">Online: ₹{item.onlineTotal.toLocaleString('en-IN')}</span>
                        <span>•</span>
                        <span className="text-amber-700">Cash: ₹{item.cashTotal.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    {item.withdrawTotal > 0 && (
                      <div className="text-[11px] font-bold text-blue-700 bg-blue-50/80 px-2 py-0.5 rounded-md inline-flex items-center space-x-1 border border-blue-200/60">
                        <Building2 className="w-3 h-3 text-blue-600" />
                        <span>Withdrawal: ₹{item.withdrawTotal.toLocaleString('en-IN')} (Excluded from Total)</span>
                      </div>
                    )}
                  </div>

                  {/* Right Actions: Download Data & Select Date */}
                  <div className="flex items-center space-x-2 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => handleDownloadDayPDF(item)}
                      className="px-3 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer"
                      title="Download PDF summary of this day"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Data</span>
                    </button>

                    <button
                      onClick={() => {
                        onSelectDate(item.date);
                        onClose();
                      }}
                      className="px-3 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 rounded-xl transition-all flex items-center space-x-1 cursor-pointer"
                      title="Open this date in editor"
                    >
                      <span>Open Date</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500 font-medium">
          <span>Saved Days in View: <strong>{filteredDailySummaries.length}</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 font-bold text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
