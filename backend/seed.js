const mongoose = require('mongoose');
const Quest = require('./models/Quest');
const dotenv = require('dotenv');

dotenv.config();

const quests = [
  {
    title: "Morning Sprint",
    description: "Complete a 20-minute run to start your day with high energy.",
    xpReward: 300,
    type: 'daily',
    requirement: { type: 'duration', value: 20 }
  },
  {
    title: "Iron Lifter",
    description: "Burn 500 calories in a single weightlifting session.",
    xpReward: 500,
    type: 'weekly',
    requirement: { type: 'calories', value: 500 }
  },
  {
    title: "Hydration Master",
    description: "Drink 3 liters of water daily for 3 days straight.",
    xpReward: 200,
    type: 'daily',
    requirement: { type: 'streak', value: 3 }
  },
  {
    title: "The Colossus",
    description: "BOSS CHALLENGE: Complete 5 workouts this week.",
    xpReward: 2000,
    type: 'boss',
    requirement: { type: 'workouts', value: 5 }
  }
];

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected for seeding');
    await Quest.deleteMany({});
    await Quest.insertMany(quests);
    console.log('Quests seeded successfully');
    process.exit();
  })
  .catch(err => {
    console.error('Seeding error:', err);
    process.exit(1);
  });
