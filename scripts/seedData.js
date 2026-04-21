const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config();

// Import models
const Hostel = require('../models/Hostel');
const Room = require('../models/Room');
const User = require('../models/User');
const Notice = require('../models/Notice');

const seedDatabase = async () => {
    try {
        // MongoDB connection string
        const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://mugdha67:naimamylove@cluster0.lgpilht.mongodb.net/hostel_management?retryWrites=true&w=majority';
        
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(mongoURI);
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        console.log('🗑️  Clearing existing data...');
        await Hostel.deleteMany({});
        await Room.deleteMany({});
        await User.deleteMany({});
        await Notice.deleteMany({});
        console.log('✅ Cleared existing data');

        // Create Hostels
        console.log('🏢 Creating hostels...');
        const hostels = await Hostel.insertMany([
            { 
                name: 'Sunrise Hostel', 
                location: 'North Campus', 
                description: 'Modern hostel with excellent facilities near academic buildings' 
            },
            { 
                name: 'Sunset Hostel', 
                location: 'South Campus', 
                description: 'Peaceful environment with garden view and sports complex' 
            },
            { 
                name: 'Green View Hostel', 
                location: 'East Campus', 
                description: 'Eco-friendly hostel with solar power and organic garden' 
            }
        ]);
        console.log(`✅ Created ${hostels.length} hostels`);

        // Create Rooms for each hostel
        console.log('🚪 Creating rooms...');
        const rooms = [];
        for (const hostel of hostels) {
            for (let i = 1; i <= 5; i++) {
                const room = await Room.create({
                    room_number: `${i}01`,
                    hostel_id: hostel._id,
                    capacity: 2,
                    occupied: i === 1 ? 1 : 0,
                    floor: i,
                    room_type: i === 1 ? 'single' : 'double',
                    price: i === 1 ? 6000 : 5000,
                    amenities: ['AC', 'WiFi', 'Attached Bathroom', 'Study Table']
                });
                rooms.push(room);
            }
        }
        console.log(`✅ Created ${rooms.length} rooms`);

        // Create Admin User
        console.log('👑 Creating admin user...');
        const adminPassword = await bcrypt.hash('admin123', 10);
        const admin = await User.create({
            username: 'admin',
            password: adminPassword,
            full_name: 'System Administrator',
            email: 'admin@hostel.com',
            phone: '+880123456789',
            role: 'admin'
        });
        console.log('✅ Admin user created - Username: admin, Password: admin123');

        // Create Sample Student 1
        console.log('🎓 Creating student users...');
        const studentPassword = await bcrypt.hash('student123', 10);
        const student1 = await User.create({
            username: 'student1',
            password: studentPassword,
            full_name: 'John Doe',
            email: 'student1@example.com',
            phone: '+880987654321',
            role: 'student',
            hostel_id: hostels[0]._id,
            room_id: rooms[0]._id
        });
        
        // Update room occupied count
        await Room.findByIdAndUpdate(rooms[0]._id, { occupied: 1 });
        
        // Create Sample Student 2
        const student2 = await User.create({
            username: 'student2',
            password: studentPassword,
            full_name: 'Jane Smith',
            email: 'student2@example.com',
            phone: '+880987654322',
            role: 'student',
            hostel_id: hostels[1]._id,
            room_id: rooms[5]._id
        });
        console.log('✅ Student users created');

        // Create Notices
        console.log('📢 Creating notices...');
        await Notice.insertMany([
            {
                title: 'Welcome to Smart Hostel Management System',
                content: 'Welcome to the new academic year! Please complete your profile and check your room allocation. All students must submit their documents by March 15th.',
                priority: 'important',
                posted_by: admin._id,
                target_audience: 'all',
                is_active: true
            },
            {
                title: 'Maintenance Work - Sunday',
                content: 'Electrical maintenance work will be conducted on Sunday from 10:00 AM to 2:00 PM. Power will be shut down during this time.',
                priority: 'normal',
                posted_by: admin._id,
                target_audience: 'all',
                is_active: true
            },
            {
                title: 'URGENT: Hostel Meeting',
                content: 'All students must attend the mandatory hostel meeting on Friday at 5:00 PM in the common hall.',
                priority: 'urgent',
                posted_by: admin._id,
                target_audience: 'students',
                is_active: true
            }
        ]);
        console.log('✅ Notices created');

        // Success message
        console.log('\n✅ ========================================');
        console.log('🎉 DATABASE SEEDED SUCCESSFULLY! 🎉');
        console.log('========================================');
        console.log('\n📝 Login Credentials:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('👑 ADMIN ACCOUNT:');
        console.log('   Username: admin');
        console.log('   Password: admin123');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🎓 STUDENT ACCOUNTS:');
        console.log('   Username: student1');
        console.log('   Password: student123');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('   Username: student2');
        console.log('   Password: student123');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('\n🏢 HOSTELS CREATED: 3');
        console.log('🚪 ROOMS CREATED: 15');
        console.log('📢 NOTICES CREATED: 3');
        console.log('👥 USERS CREATED: 3 (1 admin + 2 students)');
        console.log('\n🌐 MongoDB: Connected successfully');
        console.log('✅ You can now deploy to Render!');
        console.log('========================================\n');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ ERROR SEEDING DATABASE:');
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('Error message:', error.message);
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        if (error.message.includes('MongoNetworkError')) {
            console.error('\n💡 TROUBLESHOOTING:');
            console.error('1. Check your internet connection');
            console.error('2. Verify MongoDB Atlas connection string');
            console.error('3. Check if IP address is whitelisted (0.0.0.0/0)');
            console.error('4. Go to MongoDB Atlas → Network Access → Add IP: 0.0.0.0/0');
        }
        
        process.exit(1);
    }
};

// Run the seed function
seedDatabase();