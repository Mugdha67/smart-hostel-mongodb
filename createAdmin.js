const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        // Check if admin already exists
        const existingAdmin = await User.findOne({ username: 'admin' });
        
        if (existingAdmin) {
            console.log('Admin already exists!');
            console.log('Username: admin');
            console.log('Password: admin123');
            process.exit(0);
        }
        
        // Create new admin
        const hashedPassword = await bcrypt.hash('admin123', 10);
        const admin = new User({
            username: 'admin',
            password: hashedPassword,
            full_name: 'System Administrator',
            email: 'admin@hostel.com',
            phone: '+880123456789',
            role: 'admin'
        });
        
        await admin.save();
        console.log('✅ Admin created successfully!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('👑 ADMIN LOGIN CREDENTIALS:');
        console.log('   Username: admin');
        console.log('   Password: admin123');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

createAdmin();