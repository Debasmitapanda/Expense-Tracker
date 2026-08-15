import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from './models/User.js';
import Draft from './models/Draft.js';
import History from './models/History.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/expense_tracker';
const JWT_SECRET = process.env.JWT_SECRET || 'expense_tracker_secret_key_2026';

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// MongoDB Connection
let isConnected = false;
mongoose.set('strictQuery', false);

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    isConnected = true;
    console.log(`[MongoDB Connected] Target DB URI: ${MONGODB_URI}`);
  } catch (err) {
    isConnected = false;
    console.error(`[MongoDB Connection Error] ${err.message}`);
  }
}

connectDB();

mongoose.connection.on('connected', () => { isConnected = true; });
mongoose.connection.on('disconnected', () => { isConnected = false; });
mongoose.connection.on('error', (err) => { 
  isConnected = false; 
  console.error('[MongoDB Runtime Error]', err); 
});

// Authentication Middleware
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Access token required. Please log in.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Session expired or invalid. Please log in again.' });
  }
};

// --- AUTHENTICATION API ---

// Register / Signup
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, name, password } = req.body;
    if (!username || !password || !name) {
      return res.status(400).json({ success: false, error: 'Username, Name, and Password are required.' });
    }

    const cleanUsername = username.trim().toLowerCase();
    const existingUser = await User.findOne({ username: cleanUsername });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'Username already taken. Please choose another.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      username: cleanUsername,
      name: name.trim(),
      password: hashedPassword
    });

    const token = jwt.sign(
      { id: newUser._id, username: newUser.username, name: newUser.name },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        name: newUser.name
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Username and Password are required.' });
    }

    const cleanUsername = username.trim().toLowerCase();
    const user = await User.findOne({ username: cleanUsername });
    if (!user) {
      return res.status(400).json({ success: false, error: 'Invalid username or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, error: 'Invalid username or password.' });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username, name: user.name },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get Current Logged-in User
app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }
    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        name: user.name
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  const readyState = mongoose.connection.readyState;
  res.json({
    status: readyState === 1 ? 'connected' : 'disconnected',
    readyState,
    database: mongoose.connection.name || 'expense_tracker'
  });
});

// --- DRAFT EXPENSES API (Protected by Auth) ---

// Fetch user's draft entries
app.get('/api/drafts', authMiddleware, async (req, res) => {
  try {
    const draftsList = await Draft.find({ userId: req.user.id });
    const draftsMap = {};
    draftsList.forEach(item => {
      draftsMap[item.compositeKey] = {
        categoryId: item.categoryId,
        categoryName: item.categoryName,
        amount: item.amount,
        date: item.date,
        paymentMode: item.paymentMode,
        withdrawOption: item.withdrawOption,
        note: item.note
      };
    });
    res.json({ success: true, drafts: draftsMap });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Bulk sync user's draft entries
app.post('/api/drafts/sync', authMiddleware, async (req, res) => {
  try {
    const { drafts } = req.body;
    if (!drafts || typeof drafts !== 'object') {
      return res.status(400).json({ success: false, error: 'Invalid drafts object' });
    }

    const userId = req.user.id;
    const keysInRequest = Object.keys(drafts);
    
    // Clear out user's existing drafts that are no longer in the request
    await Draft.deleteMany({ userId, compositeKey: { $nin: keysInRequest } });

    // Upsert each item for this user
    const bulkOps = keysInRequest.map(key => {
      const item = drafts[key];
      return {
        updateOne: {
          filter: { userId, compositeKey: key },
          update: {
            $set: {
              userId,
              compositeKey: key,
              date: item.date,
              categoryId: item.categoryId,
              categoryName: item.categoryName || item.categoryId,
              amount: item.amount,
              paymentMode: item.paymentMode || 'Online',
              withdrawOption: item.withdrawOption || '',
              note: item.note || ''
            }
          },
          upsert: true
        }
      };
    });

    if (bulkOps.length > 0) {
      await Draft.bulkWrite(bulkOps);
    }

    res.json({ success: true, count: keysInRequest.length });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Reset user's drafts for a specific date
app.delete('/api/drafts/date/:date', authMiddleware, async (req, res) => {
  try {
    const { date } = req.params;
    const result = await Draft.deleteMany({ userId: req.user.id, date });
    res.json({ success: true, deletedCount: result.deletedCount });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- COMMITTED HISTORY API (Protected by Auth) ---

// Fetch user's history records
app.get('/api/history', authMiddleware, async (req, res) => {
  try {
    const historyList = await History.find({ userId: req.user.id }).sort({ date: -1 });
    const historyMap = {};
    historyList.forEach(record => {
      historyMap[record.date] = {
        date: record.date,
        totalAmount: record.totalAmount,
        onlineTotal: record.onlineTotal,
        cashTotal: record.cashTotal,
        withdrawTotal: record.withdrawTotal,
        itemCount: record.itemCount,
        entries: record.entries,
        savedAt: record.savedAt
      };
    });
    res.json({ success: true, history: historyMap });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Save or update user's history record for a date
app.post('/api/history', authMiddleware, async (req, res) => {
  try {
    const { record } = req.body;
    if (!record || !record.date) {
      return res.status(400).json({ success: false, error: 'Invalid history record object' });
    }

    const userId = req.user.id;
    const updated = await History.findOneAndUpdate(
      { userId, date: record.date },
      {
        userId,
        date: record.date,
        totalAmount: record.totalAmount || 0,
        onlineTotal: record.onlineTotal || 0,
        cashTotal: record.cashTotal || 0,
        withdrawTotal: record.withdrawTotal || 0,
        itemCount: record.itemCount || 0,
        entries: record.entries || [],
        savedAt: record.savedAt || new Date()
      },
      { upsert: true, new: true }
    );

    res.json({ success: true, record: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Restore user's history from backup JSON
app.post('/api/history/restore', authMiddleware, async (req, res) => {
  try {
    const { historyObj } = req.body;
    if (!historyObj || typeof historyObj !== 'object') {
      return res.status(400).json({ success: false, error: 'Invalid history object' });
    }

    const userId = req.user.id;
    const records = Object.values(historyObj);
    const bulkOps = records.map(record => ({
      updateOne: {
        filter: { userId, date: record.date },
        update: {
          $set: {
            userId,
            date: record.date,
            totalAmount: record.totalAmount || 0,
            onlineTotal: record.onlineTotal || 0,
            cashTotal: record.cashTotal || 0,
            withdrawTotal: record.withdrawTotal || 0,
            itemCount: record.itemCount || 0,
            entries: record.entries || [],
            savedAt: record.savedAt || new Date()
          }
        },
        upsert: true
      }
    }));

    if (bulkOps.length > 0) {
      await History.bulkWrite(bulkOps);
    }

    res.json({ success: true, count: records.length });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete user's history record for a specific date
app.delete('/api/history/:date', authMiddleware, async (req, res) => {
  try {
    const { date } = req.params;
    const result = await History.deleteOne({ userId: req.user.id, date });
    res.json({ success: true, deletedCount: result.deletedCount });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- SERVE STATIC FRONTEND IN PRODUCTION ---
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, '../dist');

app.use(express.static(distPath));

app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    return res.sendFile(path.join(distPath, 'index.html'));
  }
  next();
});

// Start Express Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Express Backend Server] Running on http://0.0.0.0:${PORT}`);
});
