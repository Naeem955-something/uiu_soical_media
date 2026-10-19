const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String, default: '' },
  role: { type: String, enum: ['STUDENT', 'FACULTY', 'ADMIN'], default: 'STUDENT' },
  department: { type: String, default: '' },
  semester: { type: String, default: '' },
  studentId: { type: String, default: '' },
  reputationScore: { type: Number, default: 0 },
  cgpa: { type: Number, default: 0 },
  hideCgpa: { type: Boolean, default: false },
  creditsCompleted: { type: Number, default: 0 },
  totalCredits: { type: Number, default: 0 },
  bio: { type: String, default: '' },
  major: { type: String, default: '' },
  expectedGraduation: { type: String, default: '' },
  verified: { type: Boolean, default: false },
  isBlocked: { type: Boolean, default: false },
  skills: { type: [String], default: [] },
  tags: { type: [String], default: [] },
  featuredProject: {
    title: { type: String, default: 'Autonomous Drone Navigation' },
    description: { type: String, default: 'Developing a pathfinding algorithm for low-power micro-drones using LiDAR sensors and real-time obstacle avoidance.' },
    image: { type: String, default: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=500&auto=format&fit=crop&q=80' },
    githubUrl: { type: String, default: 'https://github.com' },
    stars: { type: Number, default: 128 }
  },
  researchInterests: [{
    title: { type: String, default: '' },
    subtitle: { type: String, default: '' }
  }],
  achievements: [{
    title: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    date: { type: String, default: '' }
  }]
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  if (!this.password.startsWith('$2a$') && !this.password.startsWith('$2b$')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
