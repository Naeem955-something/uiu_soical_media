const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const User = require('./models/User');
const Post = require('./models/Post');
const Event = require('./models/Event');
const MarketplaceItem = require('./models/MarketplaceItem');
const LostFoundItem = require('./models/LostFoundItem');
const ResourceItem = require('./models/ResourceItem');
const ChatConversation = require('./models/ChatConversation');
const Notification = require('./models/Notification');
const AdminReport = require('./models/AdminReport');
const Community = require('./models/Community');
const Announcement = require('./models/Announcement');

const seedData = async (shouldExit = true) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/uniconnect';
      try {
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });
        console.log('✅ MongoDB Connected for seeding...');
      } catch (connErr) {
        console.warn(`⚠️ External MongoDB offline at ${uri}. Starting embedded MongoMemoryServer...`);
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongod = await MongoMemoryServer.create({ instance: { dbName: 'uniconnect' } });
        const memUri = mongod.getUri();
        await mongoose.connect(memUri.endsWith('/') ? `${memUri}uniconnect` : `${memUri}/uniconnect`);
        console.log('✅ Embedded MongoDB Connected for seeding.');
      }
    }

    // Clear old collections
    await Post.deleteMany();
    await Event.deleteMany();
    await MarketplaceItem.deleteMany();
    await LostFoundItem.deleteMany();
    await ResourceItem.deleteMany();
    await ChatConversation.deleteMany();
    await Notification.deleteMany();
    await AdminReport.deleteMany();
    await User.deleteMany();
    await Community.deleteMany();
    await Announcement.deleteMany();
    console.log('🧹 Cleared existing database records.');

    // 1. Seed Realistic Users
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const createdUsers = await User.create([
      {
        name: 'Student User',
        email: 'student@university.edu',
        password: hashedPassword,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        role: 'STUDENT',
        department: 'Computer Science & Engineering',
        semester: '6th Semester • Junior',
        studentId: 'CS-2024-889',
        reputationScore: 850,
        cgpa: 3.85,
        hideCgpa: false,
        creditsCompleted: 84,
        totalCredits: 120,
        bio: 'Computer Science undergraduate passionate about distributed systems, machine intelligence, and open-source tooling. Student lead on campus hackathon organizers.',
        major: 'Artificial Intelligence & Software Systems',
        expectedGraduation: 'Spring 2027',
        verified: true,
        skills: ['Python', 'PyTorch', 'Data Structures & Algorithms', 'React.js', 'Distributed Systems', 'Docker'],
        tags: ['Dean\'s List', 'Peer Tutor', 'Hackathon Lead'],
        featuredProject: {
          title: 'Autonomous Drone Navigation System',
          description: 'Developing real-time obstacle avoidance and pathfinding algorithms for low-power micro-drones using LiDAR sensors and ROS2.',
          image: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=600&auto=format&fit=crop&q=80',
          githubUrl: 'https://github.com/university/autonomous-drone',
          stars: 128
        },
        researchInterests: [
          { title: 'Artificial Intelligence', subtitle: 'Neural network quantization and edge inference' },
          { title: 'Robotics & Autonomy', subtitle: 'Swarm intelligence and micro-sensor networks' }
        ],
        achievements: [
          { title: "Dean's List 2025", subtitle: 'Top 5% Academic Excellence in School of Engineering', date: 'Dec 2025' },
          { title: 'Hackathon Grand Winner', subtitle: 'Global Univ. Innovation Sprint 2025', date: 'May 2025' },
          { title: 'AWS Certified Cloud Practitioner', subtitle: 'Credential ID: AWS-88219-UNIV', date: 'Feb 2026' }
        ]
      },
      {
        name: 'Dr. Saifur Rahman',
        email: 'faculty@university.edu',
        password: hashedPassword,
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
        role: 'FACULTY',
        department: 'Computer Science & Engineering',
        studentId: 'FAC-1001',
        bio: 'Associate Professor of Computer Science. Faculty Advisor for Machine Learning Club. Research focus: probabilistic graphical models and NLP.',
        verified: true,
        skills: ['NLP', 'Machine Learning', 'Probabilistic Models', 'Python', 'Algorithms']
      },
      {
        name: 'System Administrator',
        email: 'admin@university.edu',
        password: hashedPassword,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
        role: 'ADMIN',
        department: 'Academic Affairs & IT Administration',
        bio: 'Central University Platform Administrator overseeing moderation, course systems, and security governance.',
        verified: true
      },
      {
        name: 'Alex Rivera',
        email: 'alex.r@university.edu',
        password: hashedPassword,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
        role: 'STUDENT',
        department: 'Electrical & Computer Engineering',
        studentId: 'EE-2024-5109',
        bio: 'Robotics enthusiast and hardware hacker. Leads university robot combat team and autonomous vehicle projects.',
        verified: true,
        skills: ['ROS', 'Embedded Systems', 'C/C++', 'PCB Design']
      },
      {
        name: 'Fahima Tonni',
        email: 'fahima.t@university.edu',
        password: hashedPassword,
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200',
        role: 'STUDENT',
        department: 'Computer Science',
        studentId: 'CS-2023-8821',
        bio: 'Lead organizer of AI Research Lab. Published paper on LLM quantization. Teaching assistant for Data Structures.',
        verified: true,
        skills: ['Large Language Models', 'Transformers', 'C++', 'Data Structures']
      },
      {
        name: 'Amena Akter',
        email: 'amena.a@university.edu',
        password: hashedPassword,
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
        role: 'STUDENT',
        department: 'Software Engineering',
        studentId: 'SE-2024-3321',
        bio: 'Full-stack software developer. Student representative in University Curriculum Council.',
        verified: true,
        skills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL']
      }
    ]);
    console.log(`✅ Seeded ${createdUsers.length} active university user accounts.`);

    // 2. Seed Communities
    await Community.create([
      {
        name: 'Machine Learning Club',
        description: 'Exploring the frontiers of neural networks, deep learning, and ethical AI in the heart of our campus.',
        category: 'Technology',
        leaderName: 'Dr. Saifur Rahman',
        leaderEmail: 's.rahman@university.edu',
        membersCount: 1200,
        status: 'Approved',
        bannerImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1400',
        meetingInfo: 'Fridays at 4:00 PM • Lab 402',
        tags: ['AI', 'Python', 'DeepLearning'],
        iconColor: '#2563EB',
        discussions: [
          {
            author: 'Nazmul Haque',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
            category: 'Resource Sharing',
            content: 'Just uploaded our club repository for implementing GANs and Diffusion models from scratch. Check it out and submit pull requests!',
            likes: 24,
            comments: [
              {
                authorName: 'Alex Rivera',
                authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
                text: 'Super helpful! Are the loss metrics tuned for PyTorch 2.0?'
              }
            ]
          }
        ]
      },
      {
        name: 'CSE Department Association',
        description: 'Official student and alumni community of the Computer Science & Engineering department.',
        category: 'Academic',
        leaderName: 'Prof. Robert Davis',
        leaderEmail: 'r.davis@university.edu',
        membersCount: 4500,
        status: 'Approved',
        bannerImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1000',
        meetingInfo: 'Monthly General Assembly',
        tags: ['ComputerScience', 'Engineering', 'Alumni'],
        iconColor: '#7C3AED',
        discussions: [
          {
            author: 'Student User',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
            category: 'Academic Discussion',
            content: 'Does anyone have past midterms for CS-402 Distributed Systems from 2024 or 2025?',
            likes: 12,
            comments: []
          }
        ]
      },
      {
        name: 'AI Research Lab',
        description: 'Undergraduate and postgraduate research group focusing on computer vision and LLMs.',
        category: 'Research',
        leaderName: 'Fahima Tonni',
        leaderEmail: 'fahima.t@university.edu',
        membersCount: 820,
        status: 'Approved',
        bannerImage: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1000',
        meetingInfo: 'Wednesdays at 5:00 PM • Research Center',
        tags: ['Research', 'Papers', 'NLP'],
        iconColor: '#059669',
        discussions: []
      },
      {
        name: 'Robotics & Automation Society',
        description: 'Hardware prototyping, autonomous systems, and embedded robotics sprint competitions.',
        category: 'Technology',
        leaderName: 'Alex Rivera',
        leaderEmail: 'alex.r@university.edu',
        membersCount: 1800,
        status: 'Approved',
        bannerImage: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1000',
        meetingInfo: 'Saturdays at 11:00 AM • Robotics Lab',
        tags: ['Robotics', 'Arduino', 'Hardware'],
        iconColor: '#D97706',
        discussions: []
      }
    ]);
    console.log('✅ Seeded 4 active campus communities.');

    // 3. Seed Posts with Polls, Files, and Comments
    await Post.create([
      {
        authorName: 'Dr. Saifur Rahman',
        authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
        authorBadge: 'FACULTY',
        authorDepartment: 'Computer Science & Engineering',
        title: 'Research Assistant Positions Open: Generative Diffusion & Edge AI',
        content: 'Excited to announce our lab\'s upcoming seminar on Generative Diffusion Models and Edge AI applications! Undergrad research assistant positions are officially open for the Spring semester. Interested students should review the syllabus outline and submit their CVs via the lab portal.',
        fileAttachment: {
          name: 'Edge_AI_Research_Syllabus_2026.pdf',
          size: '2.4 MB • PDF Document',
          url: '#'
        },
        image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
        tags: ['Research', 'MachineLearning', 'EdgeAI', 'FacultyAnnouncement'],
        likes: 42,
        commentsCount: 3,
        comments: [
          {
            author: { name: 'Student User', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100' },
            text: 'Are there any prerequisite course requirements before applying for the assistantship?',
            createdAt: new Date(Date.now() - 3600000)
          },
          {
            author: { name: 'Dr. Saifur Rahman', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100' },
            text: 'Data Structures and basic Linear Algebra are sufficient. Prior enthusiasm for PyTorch or TensorFlow is preferred!',
            createdAt: new Date(Date.now() - 1800000)
          },
          {
            author: { name: 'Fahima Tonni', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100' },
            text: 'Applied! Looking forward to the interview session on Wednesday.',
            createdAt: new Date(Date.now() - 600000)
          }
        ],
        actionButton: {
          label: 'View Lab Details',
          actionType: 'navigate_events'
        }
      },
      {
        authorName: 'Machine Learning Club',
        authorAvatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=200&auto=format&fit=crop&q=80',
        authorBadge: 'CLUB',
        authorDepartment: 'Student Activities Council',
        title: 'Hackathon 2026 Track Poll',
        content: 'Campus Annual Hackathon 2026 is approaching fast! Which primary competition track would your team prefer to build in? Cast your vote so we can finalize mentor and sponsor allocations!',
        tags: ['Hackathon2026', 'CampusLife', 'CodingSprint'],
        likes: 89,
        commentsCount: 2,
        poll: {
          question: 'Preferred Hackathon Domain Track:',
          options: [
            { label: 'Autonomous AI & Intelligent Agents', votes: 64 },
            { label: 'Smart Campus & Sustainable IoT', votes: 32 },
            { label: 'FinTech & Decentralized Systems', votes: 20 },
            { label: 'HealthTech & Diagnostic Assist', votes: 17 }
          ],
          totalVotes: 133,
          endsIn: '2 days remaining'
        },
        comments: [
          {
            author: { name: 'Alex Rivera', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' },
            text: 'AI Agents track will be fiercely competitive this year! Our robotics hardware team is preparing.',
            createdAt: new Date(Date.now() - 7200000)
          },
          {
            author: { name: 'Amena Akter', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' },
            text: 'Will teams have cloud GPU compute credits provided by sponsors?',
            createdAt: new Date(Date.now() - 3600000)
          }
        ],
        actionButton: {
          label: 'Register Team',
          actionType: 'navigate_events'
        }
      },
      {
        authorName: 'Nazmul Haque',
        authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        authorBadge: 'STUDENT',
        authorDepartment: 'Computer Science & Engineering',
        title: 'Midterm Study Group: Distributed Systems & Raft Consensus',
        content: 'Hey everyone! Hosting an open whiteboarding and review session tomorrow evening at Central Library Room 3B for CS-402 Distributed Systems. We will cover Paxos, Raft consensus algorithm, and vector clocks with practice exam problems. Coffee and snacks will be provided!',
        image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80',
        tags: ['CS402', 'ExamPrep', 'StudyGroup', 'DistributedSystems'],
        likes: 31,
        commentsCount: 2,
        comments: [
          {
            author: { name: 'Tanvir Sarker', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100' },
            text: 'Count me in! Raft log compaction is giving me headaches.',
            createdAt: new Date(Date.now() - 5400000)
          },
          {
            author: { name: 'Fahima Tonni', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100' },
            text: 'I just uploaded my clean lecture notes on Raft to the Resources hub as well!',
            createdAt: new Date(Date.now() - 1800000)
          }
        ]
      },
      {
        authorName: 'Prof. Robert Davis',
        authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        authorBadge: 'FACULTY',
        authorDepartment: 'Software Engineering',
        title: 'Senior Capstone Project Milestone 1 Submissions',
        content: 'Reminder to all final year software engineering teams: Capstone Milestone 1 (System Architecture Specification & Wireframes) is due this Friday by 11:59 PM. Please ensure your GitHub repositories have continuous integration workflows configured.',
        tags: ['Capstone2026', 'SoftwareEngineering', 'Deadlines'],
        likes: 54,
        commentsCount: 1,
        comments: [
          {
            author: { name: 'Student User', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100' },
            text: 'Our team submitted our architecture diagram yesterday. Thank you Professor!',
            createdAt: new Date(Date.now() - 7200000)
          }
        ]
      }
    ]);
    console.log('✅ Seeded 4 interactive campus posts with comments, polls, and attachments.');

    // 4. Seed Campus Events
    await Event.create([
      {
        title: 'Hackathon 2026: AI Agents & Autonomous Systems',
        typeBadge: 'HACKATHON',
        date: 'Oct 24, 2026',
        time: '09:00 AM - 09:00 PM',
        location: 'University Auditorium & Main Engineering Hall',
        description: '36-hour sprint creating cutting-edge AI systems, micro-agents, and smart campus tools. Mentors from top tech firms on-site. Free food, mechanical keyboards, and swag bags for all registered participants.',
        image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80',
        registeredCount: 142,
        maxCapacity: 200,
        isFeatured: true
      },
      {
        title: 'Faculty Workshop: Neural Network Interpretability',
        typeBadge: 'WORKSHOP',
        date: 'Nov 02, 2026',
        time: '02:00 PM - 05:00 PM',
        location: 'Innovation Lab 2 • Center for Advanced Computing',
        description: 'Hands-on tutorial exploring attention visualization, integrated gradients, and mechanistic interpretability with PyTorch 2.0. Laptops required.',
        image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80',
        registeredCount: 46,
        maxCapacity: 50,
        isFeatured: false
      },
      {
        title: 'Annual Tech Career Fair & Industry Expo 2026',
        typeBadge: 'SEMINAR',
        date: 'Nov 18, 2026',
        time: '10:00 AM - 05:00 PM',
        location: 'University Sports Complex Main Arena',
        description: 'Connect directly with engineering recruiters, startup founders, and research labs. Bring copies of your digital twin academic resume for on-site summer internship interviews.',
        image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80',
        registeredCount: 310,
        maxCapacity: 500,
        isFeatured: true
      },
      {
        title: 'Robotics Combat League & Autonomous Rover Showcase',
        typeBadge: 'WORKSHOP',
        date: 'Dec 05, 2026',
        time: '01:00 PM - 06:00 PM',
        location: 'Campus Quad & Robotics Arena',
        description: 'Undergraduate robotics competition featuring combat robots and autonomous LiDAR navigation rovers maneuvering through simulated debris fields.',
        image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=80',
        registeredCount: 88,
        maxCapacity: 120,
        isFeatured: false
      }
    ]);
    console.log('✅ Seeded 4 campus events across hackathons, workshops, and career fairs.');

    // 5. Seed Marketplace Items
    await MarketplaceItem.create([
      {
        title: 'Calculus: Early Transcendentals (8th Edition Hardcover)',
        price: 35,
        location: 'Science Library Ground Floor',
        condition: 'LIKE NEW',
        category: 'Books',
        sellerName: 'Student User',
        sellerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
        image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
        description: 'Hardcover textbook used for Calculus I & II. Very clean with minimal pencil highlighting in chapters 1-3. No torn pages.'
      },
      {
        title: 'Texas Instruments TI-84 Plus CE Graphing Calculator',
        price: 65,
        location: 'Engineering Hall 2nd Floor',
        condition: 'USED - GOOD',
        category: 'Electronics',
        sellerName: 'Alex Rivera',
        sellerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
        image: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=600&auto=format&fit=crop&q=80',
        description: 'Color screen graphing calculator. Includes slide cover and original USB charging cable. Battery health is great.'
      },
      {
        title: 'Ergonomic Mesh Study Desk Chair (High Back)',
        price: 45,
        location: 'North Campus Dormitories',
        condition: 'LIKE NEW',
        category: 'Hostel Items',
        sellerName: 'Fahima Tonni',
        sellerAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200',
        image: 'https://images.unsplash.com/photo-1580481077197-98c4d388f86f?w=600&auto=format&fit=crop&q=80',
        description: 'Bought last semester for hostel study desk. Breathable mesh back with adjustable lumbar support and height lever.'
      },
      {
        title: 'Logitech MX Master 3S Wireless Performance Mouse',
        price: 55,
        location: 'Student Union Cafeteria',
        condition: 'LIKE NEW',
        category: 'Electronics',
        sellerName: 'Amena Akter',
        sellerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
        image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop&q=80',
        description: 'Quiet clicks with electromagnetic MagSpeed scrolling. Works via Bluetooth and USB receiver. Box included.'
      },
      {
        title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
        price: 22,
        location: 'Computer Center Lounge',
        condition: 'USED - GOOD',
        category: 'Books',
        sellerName: 'Tanvir Sarker',
        sellerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
        image: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?w=600&auto=format&fit=crop&q=80',
        description: 'The classic book by Robert C. Martin. Essential for software design patterns and coding best practices.'
      },
      {
        title: 'Compact Dorm Mini-Fridge (1.6 cu. ft. with Freezer Shelf)',
        price: 70,
        location: 'East Residence Hall Block C',
        condition: 'USED - GOOD',
        category: 'Hostel Items',
        sellerName: 'Nazmul Haque',
        sellerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
        image: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=600&auto=format&fit=crop&q=80',
        description: 'Whisper-quiet mini fridge, chills quickly. Cleaned and defrosted. Perfect for dorm rooms.'
      }
    ]);
    console.log('✅ Seeded 6 realistic student marketplace listings.');

    // 6. Seed Lost & Found Items
    await LostFoundItem.create([
      {
        title: 'Brown Leather Bi-Fold Wallet (Contains Student ID)',
        statusType: 'Found',
        category: 'Wallet',
        location: 'Central Cafeteria 2nd Floor Dining Hall',
        image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&auto=format&fit=crop&q=80',
        details: 'Found on table near east-facing window. Contains university student card, metro pass, and some cash. Handed to security reception.',
        finderName: 'Campus Security Office'
      },
      {
        title: 'Apple AirPods Pro 2 Charging Case (White)',
        statusType: 'Found',
        category: 'Electronics',
        location: 'Science & Engineering Library 3rd Floor Quiet Zone',
        image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500&auto=format&fit=crop&q=80',
        details: 'Found near study pod #14. The case has a slight scratch on the hinge. Turned in to the 1st floor circulation desk.',
        finderName: 'Library Staff'
      },
      {
        title: 'Navy Blue Engineering Spiral Notebook (CS-301 Algorithms)',
        statusType: 'Lost',
        category: 'Books',
        location: 'Room 402 Lecture Hall',
        image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=500&auto=format&fit=crop&q=80',
        details: 'Contains handwritten lecture notes for Graph Algorithms and Dynamic Programming. My name is written on the inner front cover.',
        finderName: 'Student User'
      },
      {
        title: 'Set of 3 Keys on a Black & Red University Lanyard',
        statusType: 'Found',
        category: 'Keys',
        location: 'North Campus Parking Lot B',
        image: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=500&auto=format&fit=crop&q=80',
        details: 'Includes one car key fob and two hostel locker keys on a braided red university lanyard. Kept with campus dispatch.',
        finderName: 'Parking Security'
      }
    ]);
    console.log('✅ Seeded 4 campus lost & found records.');

    // 7. Seed Academic Resources
    await ResourceItem.create([
      {
        title: 'CS-402: Distributed Systems Comprehensive Lecture Notes',
        courseCode: 'CS-402',
        category: 'Lecture Notes',
        authorName: 'Fahima Tonni',
        authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
        fileSize: '4.8 MB',
        downloads: 185,
        rating: 4.9,
        fileFormat: 'PDF',
        description: 'Complete verified lecture notes covering Raft consensus, Byzantine fault tolerance, vector clocks, and MapReduce architecture.'
      },
      {
        title: 'CS-301: Advanced Data Structures & Algorithm Cheat Sheet',
        courseCode: 'CS-301',
        category: 'Exam Prep',
        authorName: 'Nazmul Haque',
        authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
        fileSize: '2.1 MB',
        downloads: 340,
        rating: 5.0,
        fileFormat: 'PDF',
        description: 'High-yield formula sheet with time complexities, Red-Black Trees, Trie, Segment Trees, and classic dynamic programming patterns.'
      },
      {
        title: 'AI-501: Deep Learning & Vision Transformers Survey',
        courseCode: 'AI-501',
        category: 'Research Papers',
        authorName: 'Dr. Saifur Rahman',
        authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
        fileSize: '6.4 MB',
        downloads: 98,
        rating: 4.8,
        fileFormat: 'PDF',
        description: 'Faculty survey of attention mechanisms, ViT architectures, multi-head self-attention mechanics, and self-supervised learning methods.'
      },
      {
        title: 'SE-305: Full-Stack Web Development React+Express Starter Template',
        courseCode: 'SE-305',
        category: 'Code Templates',
        authorName: 'Student User',
        authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        fileSize: '3.6 MB',
        downloads: 215,
        rating: 4.9,
        fileFormat: 'ZIP',
        description: 'Boilerplate repository with React 19, TypeScript, Express REST API, JWT authentication, and MongoDB connection setup.'
      }
    ]);
    console.log('✅ Seeded 4 academic resource library entries.');

    // 8. Seed Chat Conversations with Full Threads
    await ChatConversation.create([
      {
        name: 'CS 401 Capstone Team',
        type: 'GROUP',
        topic: 'Autonomous Drone Navigation System',
        unreadCount: 2,
        lastMessage: 'Alex Rivera: Pushed the latest ROS2 packages to GitHub repo',
        lastMessageTime: '10:45 AM',
        avatarText: 'CD',
        avatarColor: '#2563EB',
        onlineStatus: true,
        membersOnline: 4,
        aboutText: 'Capstone design team for autonomous aerial drone obstacle avoidance and path planning.',
        membersList: [
          { name: 'Student User', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100', role: 'Team Lead', isOnline: true },
          { name: 'Alex Rivera', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', role: 'Hardware & Sensor Eng', isOnline: true },
          { name: 'Fahima Tonni', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100', role: 'AI Model Specialist', isOnline: false },
          { name: 'Amena Akter', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100', role: 'Documentation & QA', isOnline: true }
        ],
        sharedFiles: [
          { name: 'LiDAR_Sensor_Calibration_v2.pdf', date: 'Yesterday', size: '1.8 MB', type: 'PDF' },
          { name: 'Architecture_Diagram_Milestone1.png', date: '3 days ago', size: '850 KB', type: 'PNG' }
        ],
        recentMedia: [
          'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=300',
          'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=300'
        ],
        messages: [
          {
            senderId: 'alex-1',
            senderName: 'Alex Rivera',
            senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
            content: 'Hey team, I verified the LiDAR sensor serial inputs this morning. Obstacle distance readings are now under 12ms latency.',
            timestamp: '10:30 AM',
            isCurrentUser: false
          },
          {
            senderId: 'u-student-01',
            senderName: 'Student User',
            senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
            content: 'That is awesome progress Alex! Did you commit the ROS2 node changes to our GitHub repository?',
            timestamp: '10:38 AM',
            isCurrentUser: true
          },
          {
            senderId: 'alex-1',
            senderName: 'Alex Rivera',
            senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
            content: 'Pushed the latest ROS2 packages to GitHub repo! Everyone please pull `feature/lidar-sync` before testing.',
            timestamp: '10:45 AM',
            isCurrentUser: false
          }
        ]
      },
      {
        name: 'Dr. Saifur Rahman',
        type: 'DIRECT',
        topic: 'Academic Advising & Research',
        unreadCount: 0,
        lastMessage: 'Dr. Saifur: Looking forward to reviewing your draft tomorrow.',
        lastMessageTime: 'Yesterday',
        avatarText: 'SR',
        avatarColor: '#059669',
        avatarImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        onlineStatus: true,
        aboutText: 'Associate Professor & Research Advisor in Computer Science & Engineering.',
        messages: [
          {
            senderId: 'u-student-01',
            senderName: 'Student User',
            senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
            content: 'Good afternoon Dr. Rahman. I have completed the preliminary survey on transformer model quantization and submitted it for your review.',
            timestamp: 'Yesterday 03:15 PM',
            isCurrentUser: true
          },
          {
            senderId: 'prof-1',
            senderName: 'Dr. Saifur Rahman',
            senderAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
            content: 'Excellent work! Looking forward to reviewing your draft tomorrow during lab hours.',
            timestamp: 'Yesterday 04:20 PM',
            isCurrentUser: false
          }
        ]
      },
      {
        name: 'Alex Rivera',
        type: 'DIRECT',
        topic: 'Campus Marketplace Meetup',
        unreadCount: 1,
        lastMessage: 'Alex: Perfect, see you outside the Engineering Hall at 2 PM!',
        lastMessageTime: '09:15 AM',
        avatarText: 'AR',
        avatarColor: '#D97706',
        avatarImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        onlineStatus: true,
        aboutText: 'Junior student in Electrical & Computer Engineering. Hardware lead on robotics combat team.',
        messages: [
          {
            senderId: 'u-student-01',
            senderName: 'Student User',
            senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
            content: 'Hey Alex, is your TI-84 calculator listing still available for purchase?',
            timestamp: '09:05 AM',
            isCurrentUser: true
          },
          {
            senderId: 'alex-1',
            senderName: 'Alex Rivera',
            senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
            content: 'Yes it is! I have it with me on campus today if you want to inspect it.',
            timestamp: '09:10 AM',
            isCurrentUser: false
          },
          {
            senderId: 'alex-1',
            senderName: 'Alex Rivera',
            senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
            content: 'Perfect, see you outside the Engineering Hall at 2 PM!',
            timestamp: '09:15 AM',
            isCurrentUser: false
          }
        ]
      }
    ]);
    console.log('✅ Seeded 3 active conversation channels with real message threads.');

    // 9. Seed Notifications
    const studentUser = await User.findOne({ email: 'student@university.edu' });
    if (studentUser) {
      await Notification.create([
        {
          userId: studentUser._id,
          title: 'Research Assistant Applications Open',
          description: 'Dr. Saifur Rahman posted a new research assistantship for Spring in the Machine Learning Lab.',
          category: 'academic',
          isRead: false,
          type: 'resource'
        },
        {
          userId: studentUser._id,
          title: 'New Message from Alex Rivera',
          description: '"Pushed the latest ROS2 packages to GitHub repo" in CS 401 Capstone Team.',
          category: 'social',
          isRead: false,
          type: 'chat'
        },
        {
          userId: studentUser._id,
          title: 'Marketplace Interest: TI-84 Calculator',
          description: 'Alex Rivera replied to your inquiry regarding the TI-84 Plus CE Graphing Calculator.',
          category: 'marketplace',
          isRead: false,
          type: 'market'
        },
        {
          userId: studentUser._id,
          title: 'Hackathon 2026 Ticket Confirmed',
          description: 'Your registration for Hackathon 2026 has been verified. You can access your digital QR entrance pass now.',
          category: 'academic',
          isRead: true,
          type: 'event'
        }
      ]);
      console.log('✅ Seeded 4 notifications for student user.');
    }

    // 10. Seed Admin Moderation Reports
    await AdminReport.create([
      {
        reporterInitials: 'TS',
        reporterName: 'Tanvir Sarker',
        reporterRole: 'Student (Computer Science)',
        reportedContent: 'Marketplace listing claiming to sell official final exam question bank copies for $150.',
        locationContext: 'Campus Marketplace • Books & Materials',
        reason: 'Academic integrity violation and fraudulent material solicitation.',
        priority: 'High',
        status: 'Pending'
      },
      {
        reporterInitials: 'RD',
        reporterName: 'Prof. Robert Davis',
        reporterRole: 'Faculty (Software Engineering Chair)',
        reportedContent: 'Automated promotional spam repeatedly posting external non-university Discord links in CSE Association discussion board.',
        locationContext: 'Communities • CSE Department Association',
        reason: 'Unauthorized advertising and off-platform bot spam.',
        priority: 'High',
        status: 'Pending'
      },
      {
        reporterInitials: 'AA',
        reporterName: 'Amena Akter',
        reporterRole: 'Student (Software Engineering)',
        reportedContent: 'Repeated offensive comments directed at project members during group code review session.',
        locationContext: 'Campus Social Feed • Post #482 Comments',
        reason: 'Violating student code of conduct and peer harassment.',
        priority: 'Medium',
        status: 'Reviewed'
      }
    ]);
    console.log('✅ Seeded 3 admin moderation queue reports.');

    // 11. Seed Official Campus Announcements
    await Announcement.create([
      {
        title: 'Fall 2026 Course Registration Schedule & Advising Guidelines',
        content: 'Pre-registration for the upcoming academic semester begins next Monday. Students must schedule an advising session with their faculty mentor to clear registration holds.',
        category: 'Academic',
        targetAudience: 'All',
        priority: 'High',
        authorName: 'Office of the Registrar',
        status: 'Published',
        sentNotification: true
      },
      {
        title: 'Main Science Library Extended 24/7 Hours for Midterm Season',
        content: 'To support students during midterms, Floors 1 through 3 of the Science & Engineering Library will remain open 24 hours a day with valid student ID.',
        category: 'Campus Facilities',
        targetAudience: 'Students',
        priority: 'Normal',
        authorName: 'University Library Council',
        status: 'Published',
        sentNotification: false
      },
      {
        title: 'Annual Undergraduate Research Innovation Grant Applications Open',
        content: 'Grants up to $5,000 per project are available for student-led hardware prototypes, machine learning systems, and sustainable energy projects.',
        category: 'Research Grants',
        targetAudience: 'All',
        priority: 'Urgent',
        authorName: 'Vice Chancellor of Research',
        status: 'Published',
        sentNotification: true
      }
    ]);
    console.log('✅ Seeded 3 official campus announcements.');

    console.log('🎉 Database seeding complete with rich, bustling university activity across all 13 features!');
  } catch (error) {
    console.error(`❌ Seeding Error: ${error.message}`);
    if (shouldExit) process.exit(1);
    throw error;
  }
};

if (require.main === module) {
  seedData(true);
}

module.exports = seedData;
