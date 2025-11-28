const express = require('express');
const Razorpay = require('razorpay');
        
const bodyParser = require('body-parser'); // Note: express.json() is newer, but this is fine
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');

const crypto = require('crypto'); // <<< ADDED for security

// Check environment variables
console.log("🔍 Environment variable check:");
console.log("MONGO_DB_URI:", process.env.MONGO_DB_URI ? "✅ Set" : "❌ Missing");
console.log("RAZORPAY_KEY_ID:", process.env.RAZORPAY_KEY_ID ? "✅ Set" : "❌ Missing");
console.log("RAZORPAY_KEY_SECRET:", process.env.RAZORPAY_KEY_SECRET ? "✅ Set" : "❌ Missing");
console.log("RAZORPAY_PLAN_ID:", process.env.RAZORPAY_PLAN_ID ? "✅ Set" : "❌ Missing");

console.log("Attempting to connect to MongoDB...");
console.log("Connection URI format check:", process.env.MONGO_DB_URI ? "✅ URI provided" : "❌ URI missing");

// Add retry logic for MongoDB connection with better error reporting
const connectDB = async () => {
  try {
    console.log("🔗 Attempting MongoDB connection...");
    console.log("🔍 Connection URI (masked):", process.env.MONGO_DB_URI?.replace(/\/\/.*@/, '//***:***@'));
    
    await mongoose.connect(process.env.MONGO_DB_URI, {
      serverSelectionTimeoutMS: 5000, // Fail fast - 5 seconds
      connectTimeoutMS: 5000, // Connection timeout
      socketTimeoutMS: 5000, // Socket timeout
      family: 4, // Use IPv4, skip trying IPv6
      maxPoolSize: 10,
      retryWrites: true,
      w: 'majority'
    });
    console.log("✅ MongoDB connected successfully");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    console.error("🔍 Error code:", err.code);
    console.error("🔍 Error name:", err.name);
    if (err.reason) {
      console.error("🔍 Error reason:", err.reason);
    }
    
    // Common error messages and solutions
    if (err.message.includes('ENOTFOUND')) {
      console.error("💡 Solution: Check your cluster hostname in the connection string");
    } else if (err.message.includes('authentication failed')) {
      console.error("💡 Solution: Check your username and password in MongoDB Atlas");
    } else if (err.message.includes('bad auth')) {
      console.error("💡 Solution: Verify MongoDB user credentials");
    } else if (err.message.includes('timeout')) {
  
  
  
      console.error("💡 Solution: Check Network Access in MongoDB Atlas - add 0.0.0.0/0");


    }
    
    console.log("🔄 Retrying MongoDB connection in 10 seconds...");
    setTimeout(connectDB, 10000); // Retry after 10 seconds
  }
};

connectDB();

const app = express();
app.use(cors({ 
  origin: [
    'http://localhost:5173',
    'https://reiwametta-foundation-frontend.vercel.app',
    'https://reiwametta-foundation.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
  maxAge: 600 // Cache preflight request results for 10 minutes
}));

// Use express.json() instead of bodyParser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Add error handling for JSON parsing
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    console.error('JSON Parse Error:', error.message);
    return res.status(400).json({ error: 'Invalid JSON format' });
  }
  next();
});





// <<< UPDATED SCHEMA >>>
const donationSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  email: { type: String, default: '' },
  contact: { type: String, default: '' },
  address: { type: String, default: '' },
  pincode: { type: String, default: '' },
  amount: { type: Number, required: true },
  isRecurring: { type: Boolean, default: false },
  orderId: String, // <<< ADDED for one-time payments
  subscriptionId: String,
  paymentId: String,
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  message: { type: String, default: '' }
});

const Donation = mongoose.model('Donation', donationSchema);

// Health check endpoint (Your existing code)
app.get('/', (req, res) => {
  const mongoStatus = mongoose.connection.readyState;
  const mongoStatusText = {
    0: '❌ Disconnected',
    1: '✅ Connected', 
    2: '🔄 Connecting',
    3: '⚠️ Disconnecting'
  }[mongoStatus] || '❓ Unknown';

  // Get detailed connection info
  const connectionInfo = {
    host: mongoose.connection.host || 'Not connected',
    name: mongoose.connection.name || 'No database selected',
    port: mongoose.connection.port || 'Unknown',
    readyState: mongoStatus
  };

  res.json({ 
    status: '✅ Backend is running',
    timestamp: new Date().toISOString(),
    mongodb: mongoStatusText,
    // ... (rest of your health check)
  });
});

// Test Razorpay connection endpoint (Your existing code)
app.get('/test-razorpay', async (req, res) => {
  try {
    console.log('🧪 Testing Razorpay connection...');
    
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ 
        error: 'Razorpay credentials not configured',
        key_id: process.env.RAZORPAY_KEY_ID ? 'Set' : 'Missing',
        key_secret: process.env.RAZORPAY_KEY_SECRET ? 'Set' : 'Missing'
      });
    }

    // Initialize razorpay here for the test
    const testRazorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    
    const result = await testRazorpay.payments.all({ count: 1 });
    
    res.json({
      status: '✅ Razorpay connection successful',
      key_id: process.env.RAZORPAY_KEY_ID.substring(0, 12) + '...',
      test_result: 'API accessible'
    });
  } catch (error) {
    console.error('❌ Razorpay test failed:', error);
    res.status(500).json({
      error: 'Razorpay connection failed',
      message: error.message,
      key_id: process.env.RAZORPAY_KEY_ID ? process.env.RAZORPAY_KEY_ID.substring(0, 12) + '...' : 'Not set'
    });
  }
});

// Initialize Razorpay instance for real payments
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID, // set in .env
  key_secret: process.env.RAZORPAY_KEY_SECRET, // set in .env
});

console.log('🔑 Razorpay Key ID configured:', process.env.RAZORPAY_KEY_ID ? 'YES' : 'NO');
console.log('🔐 Razorpay Secret configured:', process.env.RAZORPAY_KEY_SECRET ? 'YES' : 'NO');


// ===================================================
// <<< 1. NEW ENDPOINT for One-Time Custom Payments >>>
// ===================================================
app.post('/create-order', async (req, res) => {
  try {
    const { amount } = req.body;

    // Validate the amount
    if (!amount || Number(amount) <= 0) {
      console.log('❌ /create-order: Invalid amount received', amount);
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const amountInPaise = Number(amount) * 10; // Convert to paise
    console.log(`Creating order for amount: ${amountInPaise} paise`);

    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `receipt_donation_${Date.now()}` // Unique receipt ID
    };

    // Use `await` for the promise
    const order = await razorpay.orders.create(options);

    if (!order) {
      console.log('❌ /create-order: Razorpay order creation failed');
      return res.status(500).json({ error: 'Razorpay order creation failed' });
    }

    console.log('✅ Order created:', order.id);
    
    // Send the full order object back (frontend needs id, amount, currency)
    res.json(order); 

  } catch (err) {
    console.error('❌ Error creating one-time order:', err.message);
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});


// POST /create-subscription (Your existing code, unchanged)
app.post('/create-subscription', async (req, res) => {
  try {
    console.log('🔁 Create subscription request body:', req.body);

    if (!process.env.RAZORPAY_PLAN_ID) {
      console.error('❌ RAZORPAY_PLAN_ID not configured');
      return res.status(500).json({ error: 'Plan ID not configured on server' });
    }

    const { name, email, contact } = req.body || {};

    const subscriptionOptions = {
      plan_id: process.env.RAZORPAY_PLAN_ID,
      customer_notify: 1,
    };

    const totalCountFromBody = (req.body && typeof req.body.total_count !== 'undefined') ? Number(req.body.total_count) : undefined;
    const totalCountFromEnv = process.env.RAZORPAY_SUBSCRIPTION_CYCLES ? Number(process.env.RAZORPAY_SUBSCRIPTION_CYCLES) : undefined;
    const totalCount = totalCountFromBody || totalCountFromEnv || 12;
    subscriptionOptions.total_count = totalCount;
    console.log('ℹ️ Subscription total_count set to', totalCount);

    console.log('➡️ Creating subscription with options:', subscriptionOptions);

    const subscription = await razorpay.subscriptions.create(subscriptionOptions);
    console.log('✅ Subscription created:', subscription.id);

    res.json({ success: true, subscriptionId: subscription.id, subscription });
  } catch (err) {
    console.error('❌ Error creating subscription:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});


// =================================================================
// <<< 2. REPLACED/SECURED ENDPOINT for Saving ALL Payments >>>
// =================================================================
app.post('/save-payment', async (req, res) => {
  try {
    console.log('💰 Received payment data:', req.body);
    
    // Destructure all expected fields from the frontend
    const { 
      paymentId, 
      orderId,         // For one-time
      subscriptionId,  // For recurring
      signature,       // The signature from Razorpay
      isRecurring,     // Frontend MUST send this boolean
      amount,          // Amount in Rupees (e.g., 500)
      name, email, contact, address, pincode, message
    } = req.body;

    // --- 1. VERIFY SIGNATURE ---
    if (!paymentId || !signature) {
      console.log('❌ /save-payment: Missing paymentId or signature');
      return res.status(400).json({ error: 'Payment verification failed: Missing required fields' });
    }
    
    let body_text;
    
    if (isRecurring) {
      // --- Handle Recurring Payment Verification ---
      if (!subscriptionId) {
        console.log('❌ /save-payment: Missing subscriptionId for recurring payment');
        return res.status(400).json({ error: 'Missing subscriptionId for recurring payment' });
      }
      // For subscriptions, the body is paymentId + "|" + subscriptionId
      body_text = paymentId + "|" + subscriptionId;
      
    } else {
      // --- Handle One-Time Payment Verification ---
      if (!orderId) {
        console.log('❌ /save-payment: Missing orderId for one-time payment');
        return res.status(400).json({ error: 'Missing orderId for one-time payment' });
      }
      // For one-time orders, the body is orderId + "|" + paymentId
      body_text = orderId + "|" + paymentId;
    }

    // Generate the expected signature
    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body_text)
        .digest('hex');

    // Compare signatures
    if (expectedSignature !== signature) {
        console.log('❌ Payment verification failed: Signature mismatch');
        console.log('Received:', signature);
        console.log('Expected:', expectedSignature);
        return res.status(400).json({ error: 'Invalid payment signature' });
    }

    console.log('✅ Payment signature verified successfully.');

    // --- 2. SAVE TO DATABASE ---
    if (mongoose.connection.readyState !== 1) {
      console.log('⚠️ MongoDB not connected, payment verified but not saved');
      return res.status(503).json({ 
        success: false,
        error: 'Database not available',
        message: 'Payment verified but database not available for saving'
      });
    }
    
    console.log('✅ Creating donation record...');
    const donation = new Donation({
      name: String(name || ''),
      email: String(email || ''),
      contact: String(contact || ''),
      address: String(address || ''),
      pincode: String(pincode || ''),
      amount: Number(amount), // Amount in Rupees
      isRecurring: Boolean(isRecurring),
      orderId: isRecurring ? undefined : String(orderId),
      subscriptionId: isRecurring ? String(subscriptionId) : undefined,
      paymentId: String(paymentId),
      status: 'completed',
      message: String(message || '')
    });
    
    console.log('💾 Saving to database...');
    const savedDonation = await donation.save();
    console.log('✅ Donation saved to database with ID:', savedDonation._id);
    
    res.json({ 
      success: true, 
      message: 'Donation verified and saved successfully',
      donationId: savedDonation._id,
      paymentId: paymentId
    });

  } catch (err) {
    console.error('❌ Error saving payment:', err.message);
    console.error('📋 Full error:', err);
    res.status(500).json({ 
      success: false, 
      error: err.message,
      details: err.name
    });
  }
});


// GET /donations (Your existing code, unchanged)
app.get('/donations', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ 
        error: 'Database not connected',
        mongodb_state: mongoose.connection.readyState
      });
    }
    
    const donations = await Donation.find().sort({ createdAt: -1 });
    console.log(`📊 Fetched ${donations.length} donations from database`);
    res.json({
      success: true,
      count: donations.length,
      donations: donations
    });
  } catch (err) {
    console.error('Error fetching donations:', err);
    res.status(500).json({ error: err.message });
  }
});

// Test database connection endpoint (Your existing code, unchanged)
app.get('/test-db', async (req, res) => {
  try {
    console.log('🧪 Testing database connection...');
    
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        status: 'Database not connected',
        // ... (rest of your test-db endpoint)
      });
    }

    const testDoc = new Donation({
      name: 'Test User',
      email: 'test@example.com',
      amount: 1,
      isRecurring: false,
      paymentId: 'test_payment_' + Date.now(),
      status: 'test'
    });
    
    const saved = await testDoc.save();
    console.log('✅ Test document saved with ID:', saved._id);

    await Donation.deleteOne({ _id: saved._id });
    console.log('🗑️ Test document deleted');
    
    res.json({
      status: '✅ Database connection working',
      test_result: 'Successfully created and deleted test document',
      mongodb_state: mongoose.connection.readyState
    });
  } catch (err) {
    console.error('❌ Database test failed:', err);
    res.status(500).json({
      status: 'Database test failed',
      error: err.message,
      mongodb_state: mongoose.connection.readyState
    });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
