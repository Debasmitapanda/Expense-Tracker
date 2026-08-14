import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import CategoryRow from './components/CategoryRow';
import SummaryCard from './components/SummaryCard';
import NoteModal from './components/NoteModal';
import HistoryModal from './components/HistoryModal';
import { 
  ALL_CATEGORIES, 
  getTodayDateString, 
  loadSavedExpenses, 
  saveExpensesToStorage,
  loadCommittedHistory,
  saveCommittedHistoryToStorage
} from './data/categories';
import { ShieldCheck } from 'lucide-react';

export default function App() {
  const [selectedDate, setSelectedDate] = useState(() => getTodayDateString());
  const [expenses, setExpenses] = useState(() => loadSavedExpenses());
  const [savedHistory, setSavedHistory] = useState(() => loadCommittedHistory());
  
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSavedJustNow, setIsSavedJustNow] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  // Note Modal State
  const [noteModalConfig, setNoteModalConfig] = useState({
    isOpen: false,
    categoryId: null,
    categoryName: '',
    initialNote: ''
  });

  // Persist active draft expenses state to localStorage whenever modified
  useEffect(() => {
    saveExpensesToStorage(expenses);
  }, [expenses]);

  // Persist committed history state to localStorage whenever modified
  useEffect(() => {
    saveCommittedHistoryToStorage(savedHistory);
  }, [savedHistory]);

  // Compute total number of dates committed in history
  const historyCount = Object.keys(savedHistory).length;

  // Helper to retrieve entry data for a category on selectedDate
  const getCategoryEntry = (catId, targetDate) => {
    const key = `${targetDate}_${catId}`;
    if (expenses[key]) return expenses[key];
    
    // Fallback: check if saved history has this entry for targetDate
    if (savedHistory[targetDate]?.entries) {
      const found = savedHistory[targetDate].entries.find(e => e.categoryId === catId);
      if (found) return found;
    }

    // Check if legacy key exists matching date
    const legacy = expenses[catId];
    if (legacy && legacy.date === targetDate) return legacy;

    return undefined;
  };

  // Build mapped object of current entries for active selectedDate
  const currentEntriesMap = {};
  ALL_CATEGORIES.forEach(cat => {
    const entry = getCategoryEntry(cat.id, selectedDate);
    if (entry) {
      currentEntriesMap[cat.id] = entry;
    }
  });

  // Handle entry update for any category row
  const handleChangeEntry = (catId, data) => {
    const categoryObj = ALL_CATEGORIES.find(c => c.id === catId);
    const entryDate = data.date || selectedDate;
    const compositeKey = `${entryDate}_${catId}`;

    setExpenses(prev => {
      const updated = { ...prev };
      delete updated[catId]; // Clear legacy unkeyed entry if present

      if (data.amount === '' && !data.note) {
        delete updated[compositeKey];
      } else {
        updated[compositeKey] = {
          ...updated[compositeKey],
          ...data,
          categoryId: catId,
          categoryName: categoryObj ? categoryObj.name : catId,
          date: entryDate
        };
      }
      return updated;
    });
  };

  // Save current date's log PERMANENTLY into History & LocalStorage
  const handleSaveToHistory = () => {
    // Gather all active entries for selectedDate
    const dateEntries = [];
    let dayTotal = 0;
    let onlineTotal = 0;
    let cashTotal = 0;
    let withdrawTotal = 0;
    let itemCount = 0;

    ALL_CATEGORIES.forEach(cat => {
      const entry = currentEntriesMap[cat.id];
      if (entry && entry.amount !== undefined && entry.amount !== '') {
        const amt = parseFloat(entry.amount);
        if (!isNaN(amt) && amt > 0) {
          const pMode = entry.paymentMode || 'Online';
          const isWithdraw = cat.isCashWithdraw || cat.id === 'cash_withdraw';

          if (isWithdraw) {
            withdrawTotal += amt;
          } else {
            dayTotal += amt;
            itemCount += 1;
            if (pMode === 'Online') {
              onlineTotal += amt;
            } else {
              cashTotal += amt;
            }
          }

          dateEntries.push({
            categoryId: cat.id,
            categoryName: cat.name,
            amount: entry.amount,
            date: selectedDate,
            paymentMode: pMode,
            withdrawOption: entry.withdrawOption || '',
            note: entry.note || '',
            isCashWithdraw: isWithdraw
          });
        }
      }
    });

    if (dateEntries.length === 0) {
      setToastMessage('Please enter at least one expense amount before saving to History.');
      setTimeout(() => setToastMessage(''), 3000);
      return;
    }

    const dayRecord = {
      date: selectedDate,
      totalAmount: dayTotal,
      onlineTotal,
      cashTotal,
      withdrawTotal,
      itemCount,
      entries: dateEntries,
      savedAt: new Date().toISOString()
    };

    setSavedHistory(prev => ({
      ...prev,
      [selectedDate]: dayRecord
    }));

    setIsSavedJustNow(true);
    const formattedDate = new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric'
    });
    setToastMessage(`Saved! ${formattedDate} is now permanently recorded in History.`);

    setTimeout(() => setIsSavedJustNow(false), 2000);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Open note modal for specific category
  const handleOpenNoteModal = (catId, catName, currentNote) => {
    setNoteModalConfig({
      isOpen: true,
      categoryId: catId,
      categoryName: catName,
      initialNote: currentNote || ''
    });
  };

  // Save note from modal
  const handleSaveNote = (noteText) => {
    const catId = noteModalConfig.categoryId;
    if (catId) {
      const currentEntry = getCategoryEntry(catId, selectedDate) || {};
      handleChangeEntry(catId, {
        ...currentEntry,
        date: currentEntry.date || selectedDate,
        note: noteText
      });
    }
  };

  // Reset active draft inputs for current date ONLY (History remains permanently safe)
  const handleResetDay = (targetDate) => {
    setExpenses(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(key => {
        const item = updated[key];
        if (item && item.date === targetDate) {
          delete updated[key];
        }
      });
      return updated;
    });

    const formattedDate = new Date(targetDate + 'T00:00:00').toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric'
    });
    setToastMessage(`Form cleared for ${formattedDate}. Saved history remains safely preserved!`);
    setTimeout(() => setToastMessage(''), 3500);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 pb-36 font-sans antialiased selection:bg-emerald-500 selection:text-white">
      {/* Top Bar Header */}
      <Header
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        onSaveToHistory={handleSaveToHistory}
        onOpenHistory={() => setIsHistoryOpen(true)}
        historyCount={historyCount}
        isSavedJustNow={isSavedJustNow}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-2xl flex items-center space-x-2 animate-bounce max-w-sm text-center">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Expense Form Area - Direct List of All Categories */}
      <main className="max-w-4xl mx-auto px-4 pt-4 sm:pt-6 space-y-3">
        {ALL_CATEGORIES.map(category => (
          <CategoryRow
            key={category.id}
            category={category}
            entryData={currentEntriesMap[category.id]}
            globalSelectedDate={selectedDate}
            onChangeEntry={handleChangeEntry}
            onOpenNoteModal={handleOpenNoteModal}
          />
        ))}
      </main>

      {/* Sticky Bottom Total Summary Card */}
      <SummaryCard
        selectedDate={selectedDate}
        expenses={currentEntriesMap}
        onResetDay={handleResetDay}
      />

      {/* Note Modal */}
      <NoteModal
        isOpen={noteModalConfig.isOpen}
        onClose={() => setNoteModalConfig(prev => ({ ...prev, isOpen: false }))}
        categoryName={noteModalConfig.categoryName}
        initialNote={noteModalConfig.initialNote}
        onSaveNote={handleSaveNote}
      />

      {/* History Log Modal */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        savedHistory={savedHistory}
        onSelectDate={(dateStr) => setSelectedDate(dateStr)}
      />
    </div>
  );
}
