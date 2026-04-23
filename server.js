const express = require('express');
const session = require('express-session');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration - Fixed for production
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 
    }
}));

// Import routes - FIXED: Make sure all are functions, not objects
const authRoutes = require('./routes/auth');
const complaintRoutes = require('./routes/complaints');
const leaveRoutes = require('./routes/leaveRequests');
const noticeRoutes = require('./routes/notices');
const roomRoutes = require('./routes/rooms');
const userRoutes = require('./routes/users');

// Check if hostelRoutes exists, if not create a simple one
let hostelRoutes;
try {
    hostelRoutes = require('./routes/hostels');
} catch (error) {
    console.log('hostels route not found, creating simple version');
    const express = require('express');
    hostelRoutes = express.Router();
    hostelRoutes.get('/', (req, res) => {
        res.json([{ name: 'Abrar Fahad Hall' }, { name: 'Osman Hadi Hall' }, { name: 'Mannan Hall' }, { name: 'Zia Hall' }]);
    });
}

// Use routes - FIXED: Make sure each is a valid middleware
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/users', userRoutes);
app.use('/api/hostels', hostelRoutes);

// Serve HTML pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin-dashboard.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});