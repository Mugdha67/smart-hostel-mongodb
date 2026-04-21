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
        // Connect to MongoDB
        const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://mugdha67:naimamylove@cluster0.lgpilht.mongodb.net/hostel_management?retryWrites=true&w=majority';
        
        await mongoose.connect(mongoURI);
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        await Hostel.deleteMany({});
        await Room.deleteMany({});
        await User.deleteMany({});
        await Notice.deleteMany({});
        console.log('🗑️  Cleared existing data');

        // Create Hostels
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
        console.log('🏢 Hostels created:', hostels.length);

        // Create Rooms for each hostel
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
        console.log('🚪 Rooms created:', rooms.length);

        // Create Admin User
        const adminPassword = await bcrypt.hash('admin123', 10);
        const admin = await User.create({
            username: 'admin',
            password: adminPassword,
            full_name: 'System Administrator',
            email: 'admin@hostel.com',
            phone: '+880123456789',
            role: 'admin'
        });
        console.log('👑 Admin user created - Username: admin, Password: admin123');

        // Create Sample Student
        const studentPassword = await bcrypt.hash('student123', 10);
        const student = await User.create({
            username: 'student1',
            password: studentPassword,
            full_name: 'John Doe',
            email: 'student@example.com',
            phone: '+880987654321',
            role: 'student',
            hostel_id: hostels[0]._id,
            room_id: rooms[0]._id
        });
        console.log('🎓 Student user created - Username: student1, Password: student123');

        // Update room occupied count
        await Room.findByIdAndUpdate(rooms[0]._id, { occupied: 1 });
        
        // Create Sample Student 2
        const student2Password = await bcrypt.hash('student123', 10);
        const student2 = await User.create({
            username: 'student2',
            password: student2Password,
            full_name: 'Jane Smith',
            email: 'jane@example.com',
            phone: '+880987654322',
            role: 'student',
            hostel_id: hostels[1]._id,
            room_id: rooms[5]._id
        });
        console.log('🎓 Student2 created - Username: student2, Password: student123');

        // Create Notices
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
                content: 'Electrical maintenance work will be conducted on Sunday from 10:00 AM to 2:00 PM. Power will be shut down during this time. Please plan accordingly.',
                priority: 'normal',
                posted_by: admin._id,
                target_audience: 'all',
                is_active: true
            },
            {
                title: 'URGENT: Hostel Meeting',
                content: 'All students must attend the mandatory hostel meeting on Friday at 5:00 PM in the common hall. Attendance is compulsory. New rules and regulations will be discussed.',
                priority: 'urgent',
                posted_by: admin._id,
                target_audience: 'students',
                is_active: true
            },
            {
                title: 'Holiday Notice - Independence Day',
                content: 'Hostel will remain open but no classes on March 26th. Cultural program will be organized in the evening. All are welcome to participate.',
                priority: 'normal',
                posted_by: admin._id,
                target_audience: 'all',
                is_active: true
            },
            {
                title: 'Room Cleaning Schedule',
                content: 'New room cleaning schedule has been posted on the notice board. Please check your assigned days and cooperate with the cleaning staff.',
                priority: 'normal',
                posted_by: admin._id,
                target_audience: 'students',
                is_active: true
            }
        ]);
        console.log('📢 Notices created');

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
        console.log('\n🏢 HOSTELS CREATED:');
        hostels.forEach(h => console.log(`   • ${h.name} (${h.location})`));
        console.log('\n🚪 ROOMS CREATED:', rooms.length);
        console.log('📢 NOTICES CREATED: 5');
        console.log('\n🌐 MongoDB Atlas Connection String:');
        console.log(`   ${mongoURI}`);
        console.log('\n✅ You can now deploy to Render!');
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
            console.error('4. Verify username and password are correct');
        }
        
        process.exit(1);
    }
};

// Run the seed function
seedDatabase();