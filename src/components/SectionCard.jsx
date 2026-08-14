import React, { useState } from 'react';
import { 
  ShoppingBag, Building2, Zap, Smartphone, MoreHorizontal, 
  ChevronDown, ChevronUp, Layers 
} from 'lucide-react';
import CategoryRow from './CategoryRow';

const SECTION_ICONS = {
  ShoppingBag,
  BuildingBank: Building2,
  Zap,
  Smartphone,
  MoreHorizontal
};

export default function SectionCard({ 
  section, 
  expenses, 
  globalSelectedDate, 
  onChangeEntry, 
  onOpenNoteModal 
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const SectionIcon = SECTION_ICONS[section.iconName] || Layers;

  // Calculate filled count and total sum for this section for globalSelectedDate
  let sectionTotal = 0;
  let filledCount = 0;

  section.categories.forEach(cat => {
    const entry = expenses[cat.id];
    // Entry belongs to selected date if entry date matches global date OR entry date not explicitly changed
    const entryDate = entry?.date || globalSelectedDate;
    if (entryDate === globalSelectedDate && entry?.amount !== undefined && entry.amount !== '') {
      const amt = parseFloat(entry.amount);
      if (!isNaN(amt) && amt > 0) {
        sectionTotal += amt;
        filledCount += 1;
      }
    }
  });

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* Section Header */}
      <div 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="px-5 py-4 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between cursor-pointer select-none"
      >
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white shadow-xs ${
            section.color === 'emerald' ? 'bg-gradient-to-br from-emerald-500 to-teal-600' :
            section.color === 'blue' ? 'bg-gradient-to-br from-blue-500 to-indigo-600' :
            section.color === 'amber' ? 'bg-gradient-to-br from-amber-500 to-orange-600' :
            section.color === 'purple' ? 'bg-gradient-to-br from-purple-500 to-pink-600' :
            'bg-gradient-to-br from-slate-600 to-slate-800'
          }`}>
            <SectionIcon className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-extrabold text-slate-800 tracking-tight">
                {section.title}
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-700">
                {section.badge}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium hidden sm:block">
              {section.description}
            </p>
          </div>
        </div>

        {/* Section Right Summary & Collapse Toggle */}
        <div className="flex items-center space-x-3">
          {sectionTotal > 0 && (
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase text-slate-400 block leading-none">
                {section.isCashWithdrawSection ? 'Withdrawal Total' : 'Section Total'}
              </span>
              <span className={`text-sm font-extrabold ${section.isCashWithdrawSection ? 'text-blue-700' : 'text-emerald-700'}`}>
                ₹{sectionTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </span>
              {section.isCashWithdrawSection && (
                <span className="text-[9px] font-bold text-slate-400 block">Excluded from total</span>
              )}
            </div>
          )}

          <div className="flex items-center space-x-1.5">
            {filledCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center">
                {filledCount}
              </span>
            )}
            <button
              type="button"
              className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            >
              {isCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Section Category Rows Grid */}
      {!isCollapsed && (
        <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 bg-slate-50/30">
          {section.categories.map((cat) => (
            <CategoryRow
              key={cat.id}
              category={cat}
              entryData={expenses[cat.id]}
              globalSelectedDate={globalSelectedDate}
              onChangeEntry={onChangeEntry}
              onOpenNoteModal={onOpenNoteModal}
            />
          ))}
        </div>
      )}
    </div>
  );
}
