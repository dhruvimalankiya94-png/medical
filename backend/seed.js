const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const User = require('./models/User');
const HealthProfile = require('./models/HealthProfile');
const HealthRecord = require('./models/HealthRecord');
const DailyTask = require('./models/DailyTask');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding...');

    await User.deleteMany({});
    await HealthProfile.deleteMany({});
    await HealthRecord.deleteMany({});
    await DailyTask.deleteMany({});

    console.log('Old data cleared.');

    const users = await User.create([
      { name: 'Rahul Sharma', email: 'rahul.sharma@email.com', password: 'Password123!', role: 'patient', phone: '9876543210' },
      { name: 'Priya Patel', email: 'priya.patel@email.com', password: 'Password123!', role: 'patient', phone: '9876543211' },
      { name: 'Anjali Shah', email: 'anjali.shah@email.com', password: 'Password123!', role: 'patient', phone: '9876543212' },
      { name: 'Admin User', email: 'admin@healthpulse.com', password: 'Admin123!', role: 'admin', phone: '9876543213' },
    ]);

    console.log(`${users.length} users created.`);

    const profiles = await HealthProfile.create([
      {
        user: users[0]._id,
        dateOfBirth: new Date('1995-06-15'),
        gender: 'male',
        height: 175,
        weight: 72,
        bloodGroup: 'B+',
        phone: '9876543210',
        address: '42 MG Road, Ahmedabad, Gujarat',
        emergencyContact: { name: 'Sunita Sharma', phone: '9876543220', relation: 'Mother' },
        medicalHistory: [{ condition: 'Mild Hypertension', diagnosedDate: new Date('2023-01-10'), status: 'active' }],
        allergies: ['Dust'],
        smokingStatus: 'never',
        alcoholStatus: 'occasional',
        targetWeight: 70,
        dailyWaterGoal: 3.0,
        dailySleepGoal: 8,
        dailyExerciseGoal: 45,
      },
      {
        user: users[1]._id,
        dateOfBirth: new Date('1998-03-22'),
        gender: 'female',
        height: 162,
        weight: 58,
        bloodGroup: 'A+',
        phone: '9876543211',
        address: '15 Park Street, Mumbai, Maharashtra',
        emergencyContact: { name: 'Raj Patel', phone: '9876543221', relation: 'Father' },
        medicalHistory: [],
        allergies: [],
        smokingStatus: 'never',
        alcoholStatus: 'never',
        targetWeight: 55,
        dailyWaterGoal: 2.5,
        dailySleepGoal: 8,
        dailyExerciseGoal: 30,
      },
      {
        user: users[2]._id,
        dateOfBirth: new Date('1992-11-08'),
        gender: 'female',
        height: 158,
        weight: 65,
        bloodGroup: 'O+',
        phone: '9876543212',
        address: '78 Civil Lines, Jaipur, Rajasthan',
        emergencyContact: { name: 'Vikram Shah', phone: '9876543222', relation: 'Husband' },
        medicalHistory: [{ condition: 'Type 2 Diabetes', diagnosedDate: new Date('2022-06-15'), status: 'chronic' }],
        allergies: ['Peanuts'],
        smokingStatus: 'never',
        alcoholStatus: 'never',
        targetWeight: 60,
        dailyWaterGoal: 3.0,
        dailySleepGoal: 7,
        dailyExerciseGoal: 45,
      },
    ]);

    console.log(`${profiles.length} health profiles created.`);

    const today = new Date();
    const records = [];
    const categories = ['daily-log', 'checkup', 'lab-report'];

    for (let dayOffset = 30; dayOffset >= 0; dayOffset--) {
      for (const user of [users[0], users[1], users[2]]) {
        const profile = profiles.find((p) => p.user.toString() === user._id.toString());
        const recordDate = new Date(today);
        recordDate.setDate(recordDate.getDate() - dayOffset);
        recordDate.setHours(9 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 60), 0, 0);

        const baseWeight = profile.weight;
        const weightVariation = (Math.random() - 0.5) * 0.6;
        const weight = Math.round((baseWeight + weightVariation) * 10) / 10;
        const height = profile.height;
        const bmi = Math.round((weight / ((height / 100) ** 2)) * 10) / 10;

        records.push({
          user: user._id,
          recordDate,
          type: categories[Math.floor(Math.random() * categories.length)],
          vitals: {
            bpSystolic: 110 + Math.floor(Math.random() * 30),
            bpDiastolic: 70 + Math.floor(Math.random() * 15),
            heartRate: 65 + Math.floor(Math.random() * 25),
            temperature: 97.5 + Math.random() * 1.5,
            oxygenSaturation: 96 + Math.floor(Math.random() * 4),
            sugarFasting: 85 + Math.floor(Math.random() * 35),
            sugarPostMeal: 110 + Math.floor(Math.random() * 40),
            cholesterol: 170 + Math.floor(Math.random() * 50),
            cholesterolHDL: 40 + Math.floor(Math.random() * 25),
            cholesterolLDL: 90 + Math.floor(Math.random() * 40),
          },
          weight,
          height,
          bmi,
          sleepHours: 5.5 + Math.round(Math.random() * 3.5 * 10) / 10,
          waterIntake: Math.round((1.5 + Math.random() * 2) * 10) / 10,
          exerciseMinutes: Math.floor(Math.random() * 60),
          caloriesIntake: 1400 + Math.floor(Math.random() * 800),
          stepsCount: 3000 + Math.floor(Math.random() * 9000),
          mood: ['great', 'good', 'okay', 'bad'][Math.floor(Math.random() * 4)],
          notes: '',
        });
      }
    }

    await HealthRecord.insertMany(records);
    console.log(`${records.length} health records created.`);

    const taskTitles = {
      exercise: ['Morning Yoga', 'Evening Walk', 'Gym Workout', 'Stretching', 'Suryanamaskar'],
      water: ['Drink 1L Water', 'Drink 2L Water', 'Drink 3L Water'],
      medicine: ['Morning Medication', 'Evening Medication', 'Vitamin D Tablet'],
      walking: ['10 Min Walk', '30 Min Walk', '5000 Steps'],
      sleep: ['Sleep by 10 PM', '8 Hours Sleep', 'No Screen Before Bed'],
      diet: ['Healthy Breakfast', 'No Junk Food', 'Eat Fruits'],
      other: ['Meditation', 'Deep Breathing', 'Read Health Blog'],
    };

    const allTasks = [];
    for (let dayOffset = 14; dayOffset >= 0; dayOffset--) {
      for (const user of users.slice(0, 3)) {
        const taskDate = new Date(today);
        taskDate.setDate(taskDate.getDate() - dayOffset);
        taskDate.setHours(0, 0, 0, 0);

        const numTasks = 4 + Math.floor(Math.random() * 2);
        const categories2 = Object.keys(taskTitles);
        const selectedCats = categories2.sort(() => Math.random() - 0.5).slice(0, numTasks);

        for (const cat of selectedCats) {
          const titles = taskTitles[cat];
          const title = titles[Math.floor(Math.random() * titles.length)];
          const completed = dayOffset === 0 ? false : Math.random() > 0.2;

          allTasks.push({
            user: user._id,
            title,
            category: cat,
            completed,
            taskDate: new Date(taskDate),
          });
        }
      }
    }

    await DailyTask.insertMany(allTasks);
    console.log(`${allTasks.length} daily tasks created.`);

    console.log('\n--- Seed Summary ---');
    console.log(`Users: ${users.length}`);
    console.log(`Health Profiles: ${profiles.length}`);
    console.log(`Health Records: ${records.length}`);
    console.log(`Daily Tasks: ${allTasks.length}`);
    console.log('\nLogin Credentials:');
    console.log('User 1: rahul.sharma@email.com / Password123!');
    console.log('User 2: priya.patel@email.com / Password123!');
    console.log('User 3: anjali.shah@email.com / Password123!');
    console.log('Admin: admin@healthpulse.com / Admin123!');

    process.exit(0);
  } catch (error) {
    console.error('Seed Error:', error);
    process.exit(1);
  }
};

seedData();
