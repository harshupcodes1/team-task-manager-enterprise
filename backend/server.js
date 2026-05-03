require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Project = require('./models/Project');
const Task = require('./models/Task');

// Database Connection (Optimized for speed and fast-fail)
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 3000, // Fail fast if DB is unreachable
  socketTimeoutMS: 30000,
})
  .then(async () => {
    console.log('MongoDB Connected');
    
    // Database Seeder (Admin + Dummy Users + Projects + Tasks)
    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Admin@123', salt);
      const dummyPassword = await bcrypt.hash('password123', salt);

      // Seed Admin
      let admin = await User.findOne({ email: 'admin@company.com' });
      if (!admin) {
        admin = await User.create({ name: 'System Administrator', email: 'admin@company.com', password: hashedPassword, role: 'ADMIN' });
        console.log('Seeded: Admin');
      }

      // Seed Dummy Users
      const dummyUsersData = [
        { name: 'John Developer', email: 'john@company.com', password: dummyPassword, role: 'MEMBER' },
        { name: 'Sarah Designer', email: 'sarah@company.com', password: dummyPassword, role: 'MEMBER' },
        { name: 'Mike Manager', email: 'mike@company.com', password: dummyPassword, role: 'MEMBER' }
      ];

      const users = {};
      for (const du of dummyUsersData) {
        let u = await User.findOne({ email: du.email });
        if (!u) {
          u = await User.create(du);
          console.log(`Seeded: ${du.name}`);
        }
        users[du.name.split(' ')[0]] = u._id;
      }

      // Seed Project
      let project = await Project.findOne({ name: 'Enterprise ERP Migration' });
      if (!project) {
        project = await Project.create({
          name: 'Enterprise ERP Migration',
          description: 'Migrating legacy ERP system to the new cloud architecture. Critical Q3 initiative.',
          status: 'In Progress',
          createdBy: admin._id
        });
        console.log('Seeded: Project - Enterprise ERP Migration');
        
        // Seed Tasks ONLY if the project was just created
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 7);

        const tasksToSeed = [
          { title: 'Design Figma Mockups', description: 'Create high-fidelity mockups for the new dashboard', status: 'COMPLETED', dueDate: futureDate, project: project._id, assignedTo: users['Sarah'], createdBy: admin._id },
          { title: 'Setup MongoDB Schema', description: 'Design and deploy the initial database schemas', status: 'COMPLETED', dueDate: futureDate, project: project._id, assignedTo: users['John'], createdBy: admin._id },
          { title: 'Develop Authentication API', description: 'Implement JWT based auth endpoints', status: 'IN_PROGRESS', dueDate: futureDate, project: project._id, assignedTo: users['John'], createdBy: admin._id },
          { title: 'Review Security Audit', description: 'Review the latest Pen-Test results and patch vulnerabilities', status: 'PENDING', dueDate: futureDate, project: project._id, assignedTo: admin._id, createdBy: admin._id },
          { title: 'Write API Documentation', description: 'Document all REST endpoints using Swagger', status: 'PENDING', dueDate: futureDate, project: project._id, assignedTo: users['Mike'], createdBy: admin._id },
          { title: 'Client Feedback Sync', description: 'Weekly sync with stakeholders for design approval', status: 'IN_PROGRESS', dueDate: futureDate, project: project._id, assignedTo: users['Sarah'], createdBy: admin._id }
        ];

        for (const t of tasksToSeed) {
          await Task.create(t);
        }
        console.log('Seeded: 6 Realistic Tasks');
      }

    } catch (err) {
      console.error('Failed to seed database:', err);
    }
  })
  .catch(err => console.log('MongoDB Connection Error: ', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/analytics', require('./routes/analytics'));

// Default Route
app.get('/', (req, res) => {
  res.send('Team Task Manager API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
