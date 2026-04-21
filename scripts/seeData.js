const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const Hostel = require('../models/Hostel');
const Room = require('../models/Room');
const User = require('../models/User');
const Notice = require('../models/Notice');

dotenv.config();

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing data
        await Hostel.deleteMany({});
        await Room.deleteMany({});
        await User.deleteMany({});
        await Notice.deleteMany({});

        console.log('Cleared existing data');

        // Create Hostels
        const hostels = await Hostel.insertMany([
            { name: 'Sunrise Hostel', location: 'North Campus', description: 'Modern hostel with excellent facilities' },
            { name: 'Sunset Hostel', location: 'South Campus', description: 'Peaceful environment with garden view' },
            { name: 'Green View Hostel', location: 'East Campus', description: 'Eco-friendly hostel with solar power' }
        ]);
        console.log('Hostels created');

        // Create Rooms
        const rooms = [];
        for (const hostel of hostels) {
            for (let i = 1; i <= 5; i++) {
                const room = await Room.create({
                    room_number: `${i}01`,
                    hostel_id: hostel._id,
                    capacity: 2,
                    occupied: i === 1 ? 1 : 0,
                    floor: i,
                    room_type: 'double',
                    price: 5000,
                    amenities: ['AC', 'WiFi', 'Attached Bathroom']
                });
                rooms.push(room);
            }
        }
        console.log('Rooms created');

        // Create Admin User
        const hashedPassword = await bcrypt.hash('admin123', 10);
        const admin = await User.create({
            username: 'admin',
            password: hashedPassword,
            full_name: 'System Administrator',
            email: 'admin@hostel.com',
            phone: '1234567890',
            role: 'admin'
        });
        console.log('Admin user created - Username: admin, Password: admin123');

        // Create Sample Student
        const student = await User.create({
            username: 'student1',
            password: await bcrypt.hash('student123', 10),
            full_name: 'John Doe',
            email: 'student@example.com',
            phone: '9876543210',
            role: 'student',
            hostel_id: hostels[0]._id,
            room_id: rooms[0]._id
        });
        console.log('Sample student created - Username: student1, Password: student123');

        // Update room occupied count
        await Room.findByIdAndUpdate(rooms[0]._id, { occupied: 1 });
        console.log('Room occupied count updated');

        // Create Sample Notices
        await Notice.insertMany([
            {
                title: 'Welcome to Smart Hostel',
                content: 'Welcome to the new academic year! Please complete your registration.',
                priority: 'important',
                posted_by: admin._id,
                is_active: true
            },
            {
                title: 'Maintenance Work',
                content: 'Electrical maintenance work on Sunday from 10 AM to 2 PM.',
                priority: 'normal',
                posted_by: admin._id,
                is_active: true
            },
            {
                title: 'Hostel Meeting',
                content: 'All students must attend the hostel meeting on Friday at 5 PM.',
                priority: 'urgent',
                posted_by: admin._id,
                is_active: true
            }
        ]);
        console.log('Notices created');

        console.log('\n✅ Database seeded successfully!');
        console.log('\n📝 Login Credentials:');
        console.log('Admin - Username: admin, Password: admin123');
        console.log('Student - Username: student1, Password: student123');
        console.log('\n🏢 Hostels created:');
        hostels.forEach(h => console.log(`- ${h.name} (${h.location})`));

        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();