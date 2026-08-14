import React from 'react';
import { Calendar, ChevronLeft, ChevronRight, Wallet, History, Save, Check } from 'lucide-react';
import { getTodayDateString } from '../data/categories';

export default function Header({ 
  selectedDate, 
  setSelectedDate, 
  onSaveToHistory,
  onOpenHistory,
  historyCount = 0,
  isSavedJustNow = false
}) {
  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleSetToday = () => {
    setSelectedDate(getTodayDateString());
  };

  const handleSetYesterday = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const formattedDateString = new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-xs">
      <div className="max-w-4xl mx-auto px-4 py-3">
        {/* Top Title & Navbar Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Logo & Title */}
          <div className="flex items-center justify-between w-full md:w-auto">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-500/20 text-white shrink-0">
                <Wallet className="w-5 h-5" />
              </div>
              <div className="flex items-center space-x-1.5">
                <h1 className="text-base sm:text-xl font-bold text-slate-800 tracking-tight leading-none">
                  Daily Expense Billing Tracker
                </h1>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full tracking-wider uppercase hidden xs:inline-block">
                  gPay UI
                </span>
              </div>
            </div>

            {/* Mobile Actions: Save & History */}
            <div className="flex items-center space-x-1.5 md:hidden">
              <button
                type="button"
                onClick={onSaveToHistory}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center space-x-1 transition-all cursor-pointer ${
                  isSavedJustNow 
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                }`}
                title="Save current date expenses to History"
              >
                {isSavedJustNow ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                <span>{isSavedJustNow ? 'Saved!' : 'Save'}</span>
              </button>

              <button
                type="button"
                onClick={onOpenHistory}
                className="relative px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-800 font-bold border border-slate-200/80 transition-all flex items-center space-x-1 cursor-pointer text-xs"
                title="View History Log"
              >
                <History className="w-3.5 h-3.5 text-emerald-700" />
                <span>History</span>
                {historyCount > 0 && (
                  <span className="bg-emerald-600 text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
                    {historyCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Global Date Selector Bar & Desktop Buttons */}
          <div className="flex items-center justify-between md:justify-end gap-2 w-full md:w-auto">
            {/* Date Selector Pill */}
            <div className="flex items-center bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80 justify-between flex-1 md:flex-initial">
              <div className="flex items-center space-x-1">
                <button
                  onClick={handlePrevDay}
                  title="Previous Day"
                  className="p-1.5 rounded-xl hover:bg-white text-slate-600 hover:text-slate-900 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                <div className="relative flex items-center px-2 space-x-1.5 cursor-pointer">
                  <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <span className="text-xs font-bold text-slate-800 select-none whitespace-nowrap">
                    {formattedDateString}
                  </span>
                </div>

                <button
                  onClick={handleNextDay}
                  title="Next Day"
                  className="p-1.5 rounded-xl hover:bg-white text-slate-600 hover:text-slate-900 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="h-4 w-px bg-slate-300 mx-1.5"></div>

              <div className="flex items-center space-x-1">
                <button
                  onClick={handleSetToday}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-xl transition-all ${
                    selectedDate === getTodayDateString()
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-white'
                  }`}
                >
                  Today
                </button>
                <button
                  onClick={handleSetYesterday}
                  className="text-[11px] font-bold px-2.5 py-1 rounded-xl text-slate-600 hover:bg-white transition-all hidden xs:block"
                >
                  Yesterday
                </button>
              </div>
            </div>

            {/* Desktop Action Buttons: Save & History */}
            <div className="hidden md:flex items-center space-x-2">
              {/* Save Button */}
              <button
                type="button"
                onClick={onSaveToHistory}
                className={`px-4 py-2 rounded-2xl text-xs font-extrabold text-white flex items-center space-x-1.5 transition-all shadow-md cursor-pointer ${
                  isSavedJustNow 
                    ? 'bg-emerald-700 shadow-emerald-700/30 scale-[1.02]' 
                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-600/20'
                }`}
                title="Save current expenses to History"
              >
                {isSavedJustNow ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                <span>{isSavedJustNow ? 'Saved to History!' : 'Save to History'}</span>
              </button>

              {/* History Button */}
              <button
                type="button"
                onClick={onOpenHistory}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200/80 text-slate-800 font-bold border border-slate-200 transition-all cursor-pointer"
                title="View History Logs"
              >
                <History className="w-4 h-4 text-emerald-600" />
                <span className="text-xs">History</span>
                {historyCount > 0 && (
                  <span className="bg-emerald-600 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
                    {historyCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
