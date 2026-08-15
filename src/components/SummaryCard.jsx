import React, { useState } from 'react';
import { 
  Download, RotateCcw, IndianRupee, AlertTriangle, 
  CheckCircle, Smartphone, CreditCard, Banknote, Sparkles, Building2 
} from 'lucide-react';
import { exportDailyExpensesPDF } from '../utils/pdfExport';

export default function SummaryCard({ 
  selectedDate, 
  expenses, 
  onResetDay 
}) {
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Compute metrics for the selected date
  let dayTotal = 0;
  let onlineTotal = 0;
  let cashTotal = 0;
  let itemCount = 0;
  let withdrawTotal = 0;
  let totalEntriesCount = 0;
  const dayEntriesList = [];

  Object.entries(expenses).forEach(([catId, entry]) => {
    const entryDate = entry?.date || selectedDate;
    if (entryDate === selectedDate && entry?.amount !== undefined && entry.amount !== '') {
      const amt = parseFloat(entry.amount);
      if (!isNaN(amt) && amt > 0) {
        totalEntriesCount += 1;

        if (catId === 'cash_withdraw') {
          // Cash Withdraw is excluded from total expense calculation
          withdrawTotal += amt;
        } else {
          dayTotal += amt;
          itemCount += 1;

          const pMode = entry.paymentMode || 'Online';
          if (pMode === 'Online') {
            onlineTotal += amt;
          } else {
            cashTotal += amt;
          }
        }

        dayEntriesList.push({
          categoryId: catId,
          categoryName: entry.categoryName || catId,
          amount: entry.amount,
          date: entryDate,
          paymentMode: entry.paymentMode || 'Online',
          withdrawOption: entry.withdrawOption || '',
          note: entry.note || '',
          isCashWithdraw: catId === 'cash_withdraw'
        });
      }
    }
  });

  const formattedDate = new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  const handleDownloadPDF = async () => {
    setIsExporting(true);
    await exportDailyExpensesPDF({
      selectedDate,
      dayEntries: dayEntriesList,
      totalAmount: dayTotal,
      withdrawTotal,
      onlineTotal,
      cashTotal,
      itemCount
    });
    setIsExporting(false);
  };

  const handleConfirmReset = () => {
    onResetDay(selectedDate);
    setShowConfirmReset(false);
  };

  return (
    <>
      {/* Sticky Bottom Summary Container */}
      <div className="fixed bottom-0 left-0 right-0 z-40 p-3.5 sm:p-5 bg-white/95 backdrop-blur-md border-t border-emerald-100 shadow-[0_-8px_30px_rgba(0,0,0,0.14)] transition-all">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3.5">
          {/* Metrics Left */}
          <div className="w-full md:w-auto flex items-center justify-between md:justify-start gap-4 sm:gap-6">
            <div className="flex items-center space-x-3.5">
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-600/30 gpay-glow shrink-0">
                <IndianRupee className="w-7 h-7 stroke-[2.5]" />
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs sm:text-sm font-extrabold text-slate-500 uppercase tracking-wider">
                    Total ({formattedDate})
                  </span>
                  <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    {itemCount} {itemCount === 1 ? 'Expense' : 'Expenses'}
                  </span>
                </div>
                
                <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none mt-1">
                  ₹{dayTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            {/* Online vs Cash & Withdraw Chips */}
            <div className="hidden xs:flex flex-col gap-1 border-l border-slate-200 pl-4">
              <div className="flex items-center space-x-1.5 text-xs sm:text-sm font-bold text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span>Online:</span>
                <span className="font-black text-slate-900">₹{onlineTotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex items-center space-x-1.5 text-xs sm:text-sm font-bold text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span>Cash:</span>
                <span className="font-black text-slate-900">₹{cashTotal.toLocaleString('en-IN')}</span>
              </div>
              {withdrawTotal > 0 && (
                <div className="flex items-center space-x-1.5 text-xs font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Withdraw:</span>
                  <span className="font-black">₹{withdrawTotal.toLocaleString('en-IN')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Buttons Right */}
          <div className="w-full md:w-auto flex items-center justify-end space-x-2.5">
            {/* Reset Day Button */}
            <button
              type="button"
              onClick={() => setShowConfirmReset(true)}
              disabled={totalEntriesCount === 0}
              className={`px-4 py-3 rounded-2xl text-xs sm:text-sm font-extrabold transition-all flex items-center space-x-1.5 ${
                totalEntriesCount > 0
                  ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 cursor-pointer shadow-xs'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-60'
              }`}
              title="Clear all entries for this date"
            >
              <RotateCcw className="w-4.5 h-4.5" />
              <span className="hidden xs:inline">Reset Day</span>
            </button>

            {/* Download Today as PDF Button */}
            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={isExporting}
              className="flex-1 md:flex-none px-5 py-3 rounded-2xl text-xs sm:text-sm font-black text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md shadow-emerald-600/25 hover:shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Download className="w-4.5 h-4.5" />
              <span>{isExporting ? 'Generating PDF...' : 'Download Today as PDF'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Reset Day */}
      {showConfirmReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-800">
              Reset Entries for {formattedDate}?
            </h3>

            <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">
              This will clear all {totalEntriesCount} item(s) entered for <strong>{selectedDate}</strong>. Other dates will not be affected.
            </p>

            <div className="flex items-center justify-end space-x-2.5 mt-6">
              <button
                type="button"
                onClick={() => setShowConfirmReset(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmReset}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md shadow-rose-600/20 transition-all"
              >
                Yes, Reset Day
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
