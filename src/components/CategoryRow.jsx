import React from 'react';
import { 
  Carrot, ShoppingCart, Milk, Apple, Shirt, Fuel, ShieldCheck, 
  Stethoscope, HeartHandshake, Gift, GraduationCap, Plane, 
  Banknote, Zap, Flame, UserCheck, Droplets, Smartphone, 
  Wifi, FileText, Calendar, CreditCard, BanknoteIcon, Edit3, MessageSquare
} from 'lucide-react';

const ICON_MAP = {
  Carrot, ShoppingCart, Milk, Apple, Shirt, Fuel, ShieldCheck, 
  Stethoscope, HeartHandshake, Gift, GraduationCap, Plane, 
  Banknote, Zap, Flame, UserCheck, Droplets, Smartphone, 
  Wifi, FileText
};

export default function CategoryRow({ 
  category, 
  entryData, 
  globalSelectedDate, 
  onChangeEntry, 
  onOpenNoteModal 
}) {
  const IconComponent = ICON_MAP[category.iconName] || FileText;

  // Determine if entry belongs to currently selected global date
  const isMatchingDate = entryData?.date === globalSelectedDate;

  // Values for this category row automatically default to globalSelectedDate
  const rowDate = entryData?.date || globalSelectedDate;
  const rowAmount = isMatchingDate && entryData?.amount !== undefined ? entryData.amount : '';
  const rowNote = isMatchingDate && entryData?.note ? entryData.note : '';
  const rowPaymentMode = isMatchingDate && entryData?.paymentMode ? entryData.paymentMode : 'Online';
  const rowWithdrawOption = isMatchingDate && entryData?.withdrawOption ? entryData.withdrawOption : (category.isCashWithdraw ? category.options[0] : '');

  const hasAmount = rowAmount !== '' && parseFloat(rowAmount) > 0;
  const hasNote = Boolean(rowNote.trim());

  const handleAmountChange = (e) => {
    const val = e.target.value;
    if (val === '' || (!isNaN(val) && parseFloat(val) >= 0)) {
      onChangeEntry(category.id, {
        date: rowDate,
        amount: val,
        paymentMode: rowPaymentMode,
        withdrawOption: rowWithdrawOption,
        note: rowNote
      });
    }
  };

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    onChangeEntry(category.id, {
      date: newDate,
      amount: rowAmount,
      paymentMode: rowPaymentMode,
      withdrawOption: rowWithdrawOption,
      note: rowNote
    });
  };

  const handlePaymentModeChange = (mode) => {
    onChangeEntry(category.id, {
      date: rowDate,
      amount: rowAmount,
      paymentMode: mode,
      withdrawOption: rowWithdrawOption,
      note: rowNote
    });
  };

  const handleWithdrawOptionChange = (e) => {
    onChangeEntry(category.id, {
      date: rowDate,
      amount: rowAmount,
      paymentMode: rowPaymentMode,
      withdrawOption: e.target.value,
      note: rowNote
    });
  };

  return (
    <div className={`group relative p-3 sm:p-4 rounded-2xl border transition-all duration-200 ${
      hasAmount 
        ? 'bg-emerald-50/40 border-emerald-300/80 shadow-xs' 
        : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-xs'
    }`}>
      <div className="flex flex-col gap-3">
        {/* Category Header Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
              hasAmount 
                ? 'bg-emerald-600 text-white shadow-xs' 
                : 'bg-slate-100 text-slate-700 group-hover:bg-emerald-100 group-hover:text-emerald-700'
            }`}>
              <IconComponent className="w-4.5 h-4.5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800 leading-tight">
                {category.name}
              </h4>
              {category.isCashWithdraw && (
                <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md inline-block mt-0.5">
                  Select Source Bank/Post
                </span>
              )}
            </div>
          </div>

          {/* Right Action: Online / Cash Toggle & Note Icon */}
          <div className="flex items-center space-x-2">
            {/* Online / Cash Mode Toggle */}
            <div className="bg-slate-100 p-0.5 rounded-xl flex items-center border border-slate-200/80 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => handlePaymentModeChange('Online')}
                className={`px-2 py-0.5 rounded-lg transition-all ${
                  rowPaymentMode === 'Online'
                    ? 'bg-white text-emerald-700 shadow-xs font-extrabold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Online
              </button>
              <button
                type="button"
                onClick={() => handlePaymentModeChange('Cash')}
                className={`px-2 py-0.5 rounded-lg transition-all ${
                  rowPaymentMode === 'Cash'
                    ? 'bg-white text-amber-700 shadow-xs font-extrabold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Cash
              </button>
            </div>

            {/* Note Icon Trigger */}
            <button
              type="button"
              onClick={() => onOpenNoteModal(category.id, category.name, rowNote)}
              title={hasNote ? `Note: ${rowNote}` : "Add note"}
              className={`relative p-2 rounded-xl border transition-all ${
                hasNote
                  ? 'bg-amber-50 text-amber-600 border-amber-300 shadow-xs'
                  : 'bg-slate-50 text-slate-400 border-slate-200/80 hover:text-slate-700 hover:bg-slate-100'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              {hasNote && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-white" />
              )}
            </button>
          </div>
        </div>

        {/* Special Dropdown for Cash Withdraw Category */}
        {category.isCashWithdraw && (
          <div className="mt-0.5">
            <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">
              Withdrawal Account / Source
            </label>
            <select
              value={rowWithdrawOption}
              onChange={handleWithdrawOptionChange}
              className="w-full bg-blue-50/60 border border-blue-200 text-slate-800 font-bold text-xs rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
            >
              {category.options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Inputs Row: Date & Amount */}
        <div className="grid grid-cols-1 xs:grid-cols-2 gap-2.5 pt-1 border-t border-slate-100">
          {/* Date Picker */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Expense Date
            </label>
            <div className="relative flex items-center">
              <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
              <input
                type="date"
                value={rowDate}
                onChange={handleDateChange}
                className="w-full pl-8 pr-2 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Amount Input (Keyboard input only - scroll disabled) */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Amount (₹)
            </label>
            <div className="relative flex items-center">
              <span className={`absolute left-2.5 font-bold text-sm pointer-events-none ${
                hasAmount ? 'text-emerald-600' : 'text-slate-400'
              }`}>
                ₹
              </span>
              <input
                type="number"
                step="any"
                min="0"
                placeholder="0.00"
                value={rowAmount}
                onChange={handleAmountChange}
                onWheel={(e) => e.target.blur()}
                className={`w-full pl-7 pr-2.5 py-1.5 text-sm font-bold rounded-xl border focus:outline-none focus:ring-2 transition-all ${
                  hasAmount 
                    ? 'bg-white text-emerald-800 border-emerald-400 focus:ring-emerald-500/40 shadow-xs' 
                    : 'bg-slate-50 text-slate-800 border-slate-200 focus:ring-emerald-500/40 focus:border-emerald-500'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Note preview badge if present */}
        {hasNote && (
          <div className="text-[11px] font-medium text-slate-600 bg-amber-50/70 border border-amber-200/60 rounded-xl px-2.5 py-1.5 flex items-start space-x-1.5 mt-0.5">
            <Edit3 className="w-3 h-3 text-amber-600 mt-0.5 shrink-0" />
            <span className="italic truncate">{rowNote}</span>
          </div>
        )}
      </div>
    </div>
  );
}
