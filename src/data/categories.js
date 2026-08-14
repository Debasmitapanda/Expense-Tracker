// Predefined categories configuration for Daily Expense Billing Tracker

export const CASH_WITHDRAW_OPTIONS = [
  'Post',
  'SBI (MCC)',
  'SBI (CBT)',
  'ICICI',
  'IOB',
  'Other'
];

export const CATEGORY_SECTIONS = [
  {
    id: 'daily_essentials',
    title: 'Daily Essentials & Shopping',
    description: 'Food, household items, travel, and personal expenses',
    iconName: 'ShoppingBag',
    color: 'emerald',
    badge: 'Daily',
    categories: [
      { id: 'veg', name: 'Vegetables', iconName: 'Carrot' },
      { id: 'groceries', name: 'Groceries', iconName: 'ShoppingCart' },
      { id: 'milk', name: 'Milk', iconName: 'Milk' },
      { id: 'fresh_food', name: 'Fruit / Egg / Meat / Fish', iconName: 'Apple' },
      { id: 'cloth_canteen', name: 'Cloth / Shoe / Canteen', iconName: 'Shirt' },
      { id: 'petrol', name: 'Petrol', iconName: 'Fuel' },
      { id: 'vehicle_insurance', name: 'Vehicle Insurance', iconName: 'ShieldCheck' },
      { id: 'medicine', name: 'Medicine / Treatment', iconName: 'Stethoscope' },
      { id: 'puja_donation', name: 'Puja & Donation', iconName: 'HeartHandshake' },
      { id: 'party_gift', name: 'Party & Gift', iconName: 'Gift' },
      { id: 'education', name: 'Education', iconName: 'GraduationCap' },
      { id: 'travel', name: 'Travel', iconName: 'Plane' }
    ]
  },
  {
    id: 'utilities_section',
    title: 'Utilities Section',
    description: 'Monthly utility bills and maintenance',
    iconName: 'Zap',
    color: 'amber',
    badge: 'Bills',
    categories: [
      { id: 'gas', name: 'Gas', iconName: 'Flame' },
      { id: 'guard', name: 'Guard', iconName: 'UserCheck' },
      { id: 'water_bill', name: 'Water Bill', iconName: 'Droplets' }
    ]
  },
  {
    id: 'recharge_section',
    title: 'Recharge Section',
    description: 'Mobile connection & broadband recharges',
    iconName: 'Smartphone',
    color: 'purple',
    badge: 'Recharge',
    categories: [
      { id: 'mobile_recharge', name: 'Mobile Recharge', iconName: 'Smartphone' },
      { id: 'wifi_recharge', name: 'WiFi Recharge', iconName: 'Wifi' }
    ]
  },
  {
    id: 'other_section',
    title: 'Other Categories',
    description: 'Miscellaneous expense lines',
    iconName: 'MoreHorizontal',
    color: 'slate',
    badge: 'Other',
    categories: [
      { id: 'other_1', name: 'Other 1', iconName: 'FileText' },
      { id: 'other_2', name: 'Other 2', iconName: 'FileText' },
      { id: 'other_3', name: 'Other 3', iconName: 'FileText' }
    ]
  },
  {
    id: 'cash_withdraw_section',
    title: 'Cash Withdraw',
    description: 'Bank and postal cash withdrawals (Excluded from Expense Total)',
    iconName: 'BuildingBank',
    color: 'blue',
    badge: 'Cash Transfer',
    isCashWithdrawSection: true,
    categories: [
      {
        id: 'cash_withdraw',
        name: 'Cash Withdraw',
        iconName: 'Banknote',
        isCashWithdraw: true,
        options: CASH_WITHDRAW_OPTIONS
      }
    ]
  }
];

// Flat array of all categories for quick lookup
export const ALL_CATEGORIES = CATEGORY_SECTIONS.flatMap(section => 
  section.categories.map(cat => ({
    ...cat,
    sectionId: section.id,
    sectionTitle: section.title
  }))
);

// Storage Keys
export const STORAGE_KEY_DRAFT = 'gpay_expense_tracker_draft_v2';
export const STORAGE_KEY_HISTORY = 'gpay_expense_history_committed_v3';

export function getTodayDateString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function loadSavedExpenses() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DRAFT);
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    console.error('Failed to parse saved draft expenses:', err);
    return {};
  }
}

export function saveExpensesToStorage(expenses) {
  try {
    localStorage.setItem(STORAGE_KEY_DRAFT, JSON.stringify(expenses));
  } catch (err) {
    console.error('Failed to save draft expenses to localStorage:', err);
  }
}

export function loadCommittedHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_HISTORY);
    if (raw) return JSON.parse(raw);
    
    // Fallback: check if draft data contains items to seed initial history
    const drafts = loadSavedExpenses();
    const seeded = {};
    Object.values(drafts).forEach(item => {
      if (item && item.date && item.amount) {
        if (!seeded[item.date]) seeded[item.date] = { date: item.date, entries: [] };
        seeded[item.date].entries.push(item);
      }
    });
    return seeded;
  } catch (err) {
    console.error('Failed to load committed history:', err);
    return {};
  }
}

export function saveCommittedHistoryToStorage(historyObj) {
  try {
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(historyObj));
  } catch (err) {
    console.error('Failed to save history to localStorage:', err);
  }
}
