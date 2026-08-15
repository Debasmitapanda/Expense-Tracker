import React from 'react';
import { Calendar, ChevronLeft, ChevronRight, Wallet, History, Save, Check, User, LogOut } from 'lucide-react';
import { getTodayDateString } from '../data/categories';

export default function Header({ 
  selectedDate, 
  setSelectedDate, 
  onSaveToHistory,
  onOpenHistory,
  historyCount = 0,
  isSavedJustNow = false,
  currentUser = null,
  onLogout
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
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 py-3.5">
        {/* Top Title & Navbar Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5">
          {/* Logo, Title & User Info */}
          <div className="flex items-center justify-between w-full md:w-auto">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-500/20 text-white shrink-0">
                <Wallet className="w-5.5 h-5.5" />
              </div>
              <div>
                <h1 className="text-base sm:text-xl font-black text-slate-900 tracking-tight leading-none">
                  Daily Expense Billing Tracker
                </h1>
                {currentUser && (
                  <div className="flex items-center space-x-1.5 mt-1">
                    <span className="bg-emerald-100 text-emerald-800 text-[11px] font-black px-2 py-0.5 rounded-full flex items-center space-x-1">
                      <User className="w-3 h-3" />
                      <span>{currentUser.name}</span>
                    </span>
                    <button
                      onClick={onLogout}
                      title="Log Out"
                      className="text-[11px] font-bold text-slate-500 hover:text-rose-600 flex items-center space-x-0.5 px-1 py-0.5 rounded-md hover:bg-rose-50 transition-colors"
                    >
                      <LogOut className="w-3 h-3" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Actions: Save & History */}
            <div className="flex items-center space-x-2 md:hidden">
              <button
                type="button"
                onClick={onSaveToHistory}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center space-x-1.5 transition-all cursor-pointer ${
                  isSavedJustNow 
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md'
                }`}
                title="Save current date expenses to History"
              >
                {isSavedJustNow ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                <span>{isSavedJustNow ? 'Saved!' : 'Save'}</span>
              </button>

              <button
                type="button"
                onClick={onOpenHistory}
                className="relative px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-900 font-extrabold border border-slate-200 transition-all flex items-center space-x-1 cursor-pointer text-xs sm:text-sm"
                title="View History Log"
              >
                <History className="w-4 h-4 text-emerald-700" />
                <span>History</span>
                {historyCount > 0 && (
                  <span className="bg-emerald-600 text-white text-xs font-black px-2 py-0.5 rounded-full">
                    {historyCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Global Date Selector Bar & Desktop Buttons */}
          <div className="flex items-center justify-between md:justify-end gap-2.5 w-full md:w-auto">
            {/* Date Selector Pill */}
            <div className="flex items-center bg-slate-100/90 p-2 rounded-2xl border border-slate-200 justify-between flex-1 md:flex-initial">
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={handlePrevDay}
                  title="Previous Day"
                  className="p-2 rounded-xl hover:bg-white text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                <div className="relative flex items-center px-2 space-x-2 cursor-pointer">
                  <Calendar className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <span className="text-xs sm:text-sm font-extrabold text-slate-900 select-none whitespace-nowrap">
                    {formattedDateString}
                  </span>
                </div>

                <button
                  onClick={handleNextDay}
                  title="Next Day"
                  className="p-2 rounded-xl hover:bg-white text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <div className="h-5 w-px bg-slate-300 mx-2"></div>

              <div className="flex items-center space-x-1">
                <button
                  onClick={handleSetToday}
                  className={`text-xs font-extrabold px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    selectedDate === getTodayDateString()
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-white'
                  }`}
                >
                  Today
                </button>
                <button
                  onClick={handleSetYesterday}
                  className="text-xs font-extrabold px-3 py-1.5 rounded-xl text-slate-700 hover:bg-white transition-all hidden xs:block cursor-pointer"
                >
                  Yesterday
                </button>
              </div>
            </div>

            {/* Desktop Action Buttons: Save & History */}
            <div className="hidden md:flex items-center space-x-2.5">
              {/* Save Button */}
              <button
                type="button"
                onClick={onSaveToHistory}
                className={`px-4.5 py-2.5 rounded-2xl text-xs sm:text-sm font-black text-white flex items-center space-x-2 transition-all shadow-md cursor-pointer ${
                  isSavedJustNow 
                    ? 'bg-emerald-700 shadow-emerald-700/30 scale-[1.02]' 
                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-600/20'
                }`}
                title="Save current expenses to History"
              >
                {isSavedJustNow ? <Check className="w-4.5 h-4.5" /> : <Save className="w-4.5 h-4.5" />}
                <span>{isSavedJustNow ? 'Saved to History!' : 'Save to History'}</span>
              </button>

              {/* History Button */}
              <button
                type="button"
                onClick={onOpenHistory}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-extrabold border border-slate-200 transition-all cursor-pointer"
                title="View History Logs"
              >
                <History className="w-4.5 h-4.5 text-emerald-600" />
                <span className="text-xs sm:text-sm">History</span>
                {historyCount > 0 && (
                  <span className="bg-emerald-600 text-white text-xs font-black px-2 py-0.5 rounded-full">
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
