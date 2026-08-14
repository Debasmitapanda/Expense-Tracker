import React, { useState, useEffect } from 'react';
import { X, FileText, Check } from 'lucide-react';

export default function NoteModal({ isOpen, onClose, categoryName, initialNote, onSaveNote }) {
  const [noteText, setNoteText] = useState(initialNote || '');

  useEffect(() => {
    setNoteText(initialNote || '');
  }, [initialNote, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveNote(noteText);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 transform transition-all scale-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Add Expense Note</h3>
              <p className="text-xs text-slate-500 font-medium">{categoryName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4">
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">
            Optional Remark / Details
          </label>
          <textarea
            rows={4}
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder={`Add details for ${categoryName} (e.g. Bill No, Shop Name, Specific Items...)`}
            className="w-full text-sm p-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 bg-slate-50/50 placeholder:text-slate-400 font-medium"
            autoFocus
          />
        </div>

        <div className="flex items-center justify-end space-x-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center space-x-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Save Note</span>
          </button>
        </div>
      </div>
    </div>
  );
}
