import { 
  User, 
  Post, 
  EventItem, 
  MarketplaceItem, 
  LostFoundItem, 
  ResourceItem, 
  ChatConversation, 
  NotificationItem, 
  AdminReport 
} from '../types';

export const initialUser: User = {
  id: 'u-student-01',
  name: 'Student User',
  email: 'student@university.edu',
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
    description: 'Developing a real-time obstacle avoidance and pathfinding algorithm for low-power micro-drones using LiDAR sensors and ROS2.',
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
};

export const initialPosts: Post[] = [
  {
    id: 'post-1',
    authorName: 'Dr. Saifur Rahman',
    authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
    authorBadge: 'FACULTY',
    authorDepartment: 'Computer Science & Engineering',
    timeAgo: '15m ago',
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
    userLiked: false,
    commentsCount: 3,
    commentsList: [
      {
        id: 'c-1',
        authorName: 'Student User',
        authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        text: 'Are there any prerequisite course requirements before applying for the assistantship?',
        timeAgo: '10m ago'
      },
      {
        id: 'c-2',
        authorName: 'Dr. Saifur Rahman',
        authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
        text: 'Data Structures and basic Linear Algebra are sufficient. Prior enthusiasm for PyTorch or TensorFlow is preferred!',
        timeAgo: '6m ago'
      },
      {
        id: 'c-3',
        authorName: 'Fahima Tonni',
        authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
        text: 'Applied! Looking forward to the interview session on Wednesday.',
        timeAgo: '2m ago'
      }
    ],
    actionButton: {
      label: 'View Lab Details',
      actionType: 'navigate_events'
    }
  },
  {
    id: 'post-2',
    authorName: 'Machine Learning Club',
    authorAvatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=200&auto=format&fit=crop&q=80',
    authorBadge: 'CLUB',
    authorDepartment: 'Student Activities Council',
    timeAgo: '1h ago',
    title: 'Hackathon 2026 Track Poll',
    content: 'Campus Annual Hackathon 2026 is approaching fast! Which primary competition track would your team prefer to build in? Cast your vote so we can finalize mentor and sponsor allocations!',
    tags: ['Hackathon2026', 'CampusLife', 'CodingSprint'],
    likes: 89,
    userLiked: true,
    commentsCount: 2,
    poll: {
      question: 'Preferred Hackathon Domain Track:',
      options: [
        { id: 'opt-1', label: 'Autonomous AI & Intelligent Agents', votes: 64, percentage: 48 },
        { id: 'opt-2', label: 'Smart Campus & Sustainable IoT', votes: 32, percentage: 24 },
        { id: 'opt-3', label: 'FinTech & Decentralized Systems', votes: 20, percentage: 15 },
        { id: 'opt-4', label: 'HealthTech & Diagnostic Assist', votes: 17, percentage: 13 }
      ],
      totalVotes: 133,
      userVotedOptionId: 'opt-1',
      endsIn: '2 days remaining'
    },
    commentsList: [
      {
        id: 'c-4',
        authorName: 'Alex Rivera',
        authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
        text: 'AI Agents track will be fiercely competitive this year! Our robotics hardware team is preparing.',
        timeAgo: '45m ago'
      },
      {
        id: 'c-5',
        authorName: 'Amena Akter',
        authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
        text: 'Will teams have cloud GPU compute credits provided by sponsors?',
        timeAgo: '20m ago'
      }
    ],
    actionButton: {
      label: 'Register Team',
      actionType: 'navigate_events'
    }
  },
  {
    id: 'post-3',
    authorName: 'Nazmul Haque',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    authorBadge: 'STUDENT',
    authorDepartment: 'Computer Science & Engineering',
    timeAgo: '3h ago',
    title: 'Midterm Study Group: Distributed Systems & Raft Consensus',
    content: 'Hey everyone! Hosting an open whiteboarding and review session tomorrow evening at Central Library Room 3B for CS-402 Distributed Systems. We will cover Paxos, Raft consensus algorithm, and vector clocks with practice exam problems. Coffee and snacks will be provided!',
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80',
    tags: ['CS402', 'ExamPrep', 'StudyGroup', 'DistributedSystems'],
    likes: 31,
    userLiked: false,
    commentsCount: 2,
    commentsList: [
      {
        id: 'c-6',
        authorName: 'Tanvir Sarker',
        authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
        text: 'Count me in! Raft log compaction is giving me headaches.',
        timeAgo: '2h ago'
      },
      {
        id: 'c-7',
        authorName: 'Fahima Tonni',
        authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
        text: 'I just uploaded my clean lecture notes on Raft to the Resources hub as well!',
        timeAgo: '1h ago'
      }
    ]
  },
  {
    id: 'post-4',
    authorName: 'Prof. Robert Davis',
    authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    authorBadge: 'FACULTY',
    authorDepartment: 'Software Engineering',
    timeAgo: '5h ago',
    title: 'Senior Capstone Project Milestone 1 Submissions',
    content: 'Reminder to all final year software engineering teams: Capstone Milestone 1 (System Architecture Specification & Wireframes) is due this Friday by 11:59 PM. Please ensure your GitHub repositories have continuous integration workflows configured.',
    tags: ['Capstone2026', 'SoftwareEngineering', 'Deadlines'],
    likes: 54,
    userLiked: false,
    commentsCount: 1,
    commentsList: [
      {
        id: 'c-8',
        authorName: 'Student User',
        authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        text: 'Our team submitted our architecture diagram yesterday. Thank you Professor!',
        timeAgo: '3h ago'
      }
    ]
  }
];

export const initialEvents: EventItem[] = [
  {
    id: 'ev-1',
    title: 'Hackathon 2026: AI Agents & Autonomous Systems',
    typeBadge: 'HACKATHON',
    date: 'Oct 24, 2026',
    time: '09:00 AM - 09:00 PM',
    location: 'University Auditorium & Main Engineering Hall',
    description: '36-hour sprint creating cutting-edge AI systems, micro-agents, and smart campus tools. Mentors from top tech firms on-site. Free food, mechanical keyboards, and swag bags for all registered participants.',
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80',
    registeredCount: 142,
    maxCapacity: 200,
    isFeatured: true,
    userRegistered: true,
    userRole: 'Participant',
    status: 'Confirmed'
  },
  {
    id: 'ev-2',
    title: 'Faculty Workshop: Neural Network Interpretability',
    typeBadge: 'WORKSHOP',
    date: 'Nov 02, 2026',
    time: '02:00 PM - 05:00 PM',
    location: 'Innovation Lab 2 • Center for Advanced Computing',
    description: 'Hands-on tutorial exploring attention visualization, integrated gradients, and mechanistic interpretability with PyTorch 2.0. Laptops required.',
    image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80',
    registeredCount: 46,
    maxCapacity: 50,
    isFeatured: false,
    userRegistered: true,
    userRole: 'Attendee',
    status: 'Confirmed'
  },
  {
    id: 'ev-3',
    title: 'Annual Tech Career Fair & Industry Expo 2026',
    typeBadge: 'SEMINAR',
    date: 'Nov 18, 2026',
    time: '10:00 AM - 05:00 PM',
    location: 'University Sports Complex Main Arena',
    description: 'Connect directly with engineering recruiters, startup founders, and research labs. Bring copies of your digital twin academic resume for on-site summer internship interviews.',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80',
    registeredCount: 310,
    maxCapacity: 500,
    isFeatured: true,
    userRegistered: false
  },
  {
    id: 'ev-4',
    title: 'Robotics Combat League & Autonomous Rover Showcase',
    typeBadge: 'WORKSHOP',
    date: 'Dec 05, 2026',
    time: '01:00 PM - 06:00 PM',
    location: 'Campus Quad & Robotics Arena',
    description: 'Undergraduate robotics competition featuring combat robots and autonomous LiDAR navigation rovers maneuvering through simulated debris fields.',
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=80',
    registeredCount: 88,
    maxCapacity: 120,
    isFeatured: false,
    userRegistered: false
  }
];

export const initialMarketplaceItems: MarketplaceItem[] = [
  {
    id: 'mkt-1',
    title: 'Calculus: Early Transcendentals (8th Edition Hardcover)',
    price: 35,
    location: 'Science Library Ground Floor',
    condition: 'LIKE NEW',
    category: 'Books',
    sellerName: 'Student User',
    sellerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
    isBookmarked: false,
    description: 'Hardcover textbook used for Calculus I & II. Very clean with minimal pencil highlighting in chapters 1-3. No torn pages.',
    postedDate: 'Today'
  },
  {
    id: 'mkt-2',
    title: 'Texas Instruments TI-84 Plus CE Graphing Calculator',
    price: 65,
    location: 'Engineering Hall 2nd Floor',
    condition: 'USED - GOOD',
    category: 'Electronics',
    sellerName: 'Alex Rivera',
    sellerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    image: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=600&auto=format&fit=crop&q=80',
    isBookmarked: true,
    description: 'Color screen graphing calculator. Includes slide cover and original USB charging cable. Battery health is great.',
    postedDate: '1 day ago'
  },
  {
    id: 'mkt-3',
    title: 'Ergonomic Mesh Study Desk Chair (High Back)',
    price: 45,
    location: 'North Campus Dormitories',
    condition: 'LIKE NEW',
    category: 'Hostel Items',
    sellerName: 'Fahima Tonni',
    sellerAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200',
    image: 'https://images.unsplash.com/photo-1580481077197-98c4d388f86f?w=600&auto=format&fit=crop&q=80',
    isBookmarked: false,
    description: 'Bought last semester for hostel study desk. Breathable mesh back with adjustable lumbar support and height lever.',
    postedDate: '2 days ago'
  },
  {
    id: 'mkt-4',
    title: 'Logitech MX Master 3S Wireless Performance Mouse',
    price: 55,
    location: 'Student Union Cafeteria',
    condition: 'LIKE NEW',
    category: 'Electronics',
    sellerName: 'Amena Akter',
    sellerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop&q=80',
    isBookmarked: false,
    description: 'Quiet clicks with electromagnetic MagSpeed scrolling. Works via Bluetooth and USB receiver. Box included.',
    postedDate: '3 days ago'
  },
  {
    id: 'mkt-5',
    title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    price: 22,
    location: 'Computer Center Lounge',
    condition: 'USED - GOOD',
    category: 'Books',
    sellerName: 'Tanvir Sarker',
    sellerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
    image: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?w=600&auto=format&fit=crop&q=80',
    isBookmarked: true,
    description: 'The classic book by Robert C. Martin. Essential for software design patterns and coding best practices.',
    postedDate: '4 days ago'
  },
  {
    id: 'mkt-6',
    title: 'Compact Dorm Mini-Fridge (1.6 cu. ft. with Freezer Shelf)',
    price: 70,
    location: 'East Residence Hall Block C',
    condition: 'USED - GOOD',
    category: 'Hostel Items',
    sellerName: 'Nazmul Haque',
    sellerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    image: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=600&auto=format&fit=crop&q=80',
    isBookmarked: false,
    description: 'Whisper-quiet mini fridge, chills quickly. Cleaned and defrosted. Perfect for dorm rooms.',
    postedDate: '5 days ago'
  }
];

export const initialLostFoundItems: LostFoundItem[] = [
  {
    id: 'lf-1',
    title: 'Brown Leather Bi-Fold Wallet (Contains Student ID)',
    statusType: 'Found',
    category: 'Wallet',
    location: 'Central Cafeteria 2nd Floor Dining Hall',
    reportedDate: 'Oct 04, 2026',
    image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&auto=format&fit=crop&q=80',
    details: 'Found on table near east-facing window. Contains university student card, metro pass, and some cash. Handed to security reception.',
    finderName: 'Campus Security Office'
  },
  {
    id: 'lf-2',
    title: 'Apple AirPods Pro 2 Charging Case (White)',
    statusType: 'Found',
    category: 'Electronics',
    location: 'Science & Engineering Library 3rd Floor Quiet Zone',
    reportedDate: 'Oct 03, 2026',
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500&auto=format&fit=crop&q=80',
    details: 'Found near study pod #14. The case has a slight scratch on the hinge. Turned in to the 1st floor circulation desk.',
    finderName: 'Library Staff'
  },
  {
    id: 'lf-3',
    title: 'Navy Blue Engineering Spiral Notebook (CS-301 Algorithms)',
    statusType: 'Lost',
    category: 'Books',
    location: 'Room 402 Lecture Hall',
    reportedDate: 'Oct 02, 2026',
    image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=500&auto=format&fit=crop&q=80',
    details: 'Contains handwritten lecture notes for Graph Algorithms and Dynamic Programming. My name is written on the inner front cover.',
    finderName: 'Student User'
  },
  {
    id: 'lf-4',
    title: 'Set of 3 Keys on a Black & Red University Lanyard',
    statusType: 'Found',
    category: 'Keys',
    location: 'North Campus Parking Lot B',
    reportedDate: 'Oct 01, 2026',
    image: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=500&auto=format&fit=crop&q=80',
    details: 'Includes one car key fob and two hostel locker keys on a braided red university lanyard. Kept with campus dispatch.',
    finderName: 'Parking Security'
  }
];

export const initialResources: ResourceItem[] = [
  {
    id: 'res-1',
    title: 'CS-402: Distributed Systems Comprehensive Lecture Notes',
    courseCode: 'CS-402',
    category: 'Lecture Notes',
    authorName: 'Fahima Tonni',
    authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
    fileSize: '4.8 MB',
    timeAgo: '2 days ago',
    downloads: 185,
    rating: 4.9,
    isBookmarked: true,
    fileFormat: 'PDF',
    description: 'Complete verified lecture notes covering Raft consensus, Byzantine fault tolerance, vector clocks, and MapReduce architecture.'
  },
  {
    id: 'res-2',
    title: 'CS-301: Advanced Data Structures & Algorithm Cheat Sheet',
    courseCode: 'CS-301',
    category: 'Exam Prep',
    authorName: 'Nazmul Haque',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    fileSize: '2.1 MB',
    timeAgo: '3 days ago',
    downloads: 340,
    rating: 5.0,
    isBookmarked: true,
    fileFormat: 'PDF',
    description: 'High-yield formula sheet with time complexities, Red-Black Trees, Trie, Segment Trees, and classic dynamic programming patterns.'
  },
  {
    id: 'res-3',
    title: 'AI-501: Deep Learning & Vision Transformers Survey',
    courseCode: 'AI-501',
    category: 'Research Papers',
    authorName: 'Dr. Saifur Rahman',
    authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
    fileSize: '6.4 MB',
    timeAgo: '5 days ago',
    downloads: 98,
    rating: 4.8,
    isBookmarked: false,
    fileFormat: 'PDF',
    description: 'Faculty survey of attention mechanisms, ViT architectures, multi-head self-attention mechanics, and self-supervised learning methods.'
  },
  {
    id: 'res-4',
    title: 'SE-305: Full-Stack Web Development React+Express Starter Template',
    courseCode: 'SE-305',
    category: 'Code Templates',
    authorName: 'Student User',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    fileSize: '3.6 MB',
    timeAgo: '1 week ago',
    downloads: 215,
    rating: 4.9,
    isBookmarked: false,
    fileFormat: 'ZIP',
    description: 'Boilerplate repository with React 19, TypeScript, Express REST API, JWT authentication, and MongoDB connection setup.'
  }
];

export const initialConversations: ChatConversation[] = [
  {
    id: 'chat-1',
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
        id: 'msg-1',
        senderId: 'alex-1',
        senderName: 'Alex Rivera',
        senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
        content: 'Hey team, I verified the LiDAR sensor serial inputs this morning. Obstacle distance readings are now under 12ms latency.',
        timestamp: '10:30 AM',
        isCurrentUser: false
      },
      {
        id: 'msg-2',
        senderId: 'u-student-01',
        senderName: 'Student User',
        senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
        content: 'That is awesome progress Alex! Did you commit the ROS2 node changes to our GitHub repository?',
        timestamp: '10:38 AM',
        isCurrentUser: true
      },
      {
        id: 'msg-3',
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
    id: 'chat-2',
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
        id: 'msg-4',
        senderId: 'u-student-01',
        senderName: 'Student User',
        senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
        content: 'Good afternoon Dr. Rahman. I have completed the preliminary survey on transformer model quantization and submitted it for your review.',
        timestamp: 'Yesterday 03:15 PM',
        isCurrentUser: true
      },
      {
        id: 'msg-5',
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
    id: 'chat-3',
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
        id: 'msg-6',
        senderId: 'u-student-01',
        senderName: 'Student User',
        senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
        content: 'Hey Alex, is your TI-84 calculator listing still available for purchase?',
        timestamp: '09:05 AM',
        isCurrentUser: true
      },
      {
        id: 'msg-7',
        senderId: 'alex-1',
        senderName: 'Alex Rivera',
        senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
        content: 'Yes it is! I have it with me on campus today if you want to inspect it.',
        timestamp: '09:10 AM',
        isCurrentUser: false
      },
      {
        id: 'msg-8',
        senderId: 'alex-1',
        senderName: 'Alex Rivera',
        senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
        content: 'Perfect, see you outside the Engineering Hall at 2 PM!',
        timestamp: '09:15 AM',
        isCurrentUser: false
      }
    ]
  },
  {
    id: 'chat-4',
    name: 'Hackathon 2026 Strategy Squad',
    type: 'GROUP',
    topic: 'Team Ideation & System Architecture',
    unreadCount: 0,
    lastMessage: 'Amena: I created our Figma presentation slide deck!',
    lastMessageTime: 'Oct 04',
    avatarText: 'HS',
    avatarColor: '#7C3AED',
    onlineStatus: false,
    membersOnline: 3,
    aboutText: '4-person competitive team preparing for the 36-hour campus AI hackathon.',
    messages: [
      {
        id: 'msg-9',
        senderId: 'amena-1',
        senderName: 'Amena Akter',
        senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
        content: 'I created our Figma presentation slide deck! We can outline our edge AI demo there.',
        timestamp: 'Oct 04 06:30 PM',
        isCurrentUser: false
      }
    ]
  }
];

export const initialNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Research Assistant Applications Open',
    description: 'Dr. Saifur Rahman posted a new research assistantship for Spring 2027 in the Machine Learning Lab.',
    timeAgo: '15m ago',
    category: 'academic',
    isRead: false,
    type: 'resource',
    actionButton: {
      label: 'View Announcement',
      viewTarget: 'home'
    }
  },
  {
    id: 'notif-2',
    title: 'New Message from Alex Rivera',
    description: '"Pushed the latest ROS2 packages to GitHub repo" in CS 401 Capstone Team.',
    timeAgo: '45m ago',
    category: 'social',
    isRead: false,
    type: 'chat',
    actionButton: {
      label: 'Open Chat',
      viewTarget: 'chat'
    }
  },
  {
    id: 'notif-3',
    title: 'Marketplace Interest: TI-84 Calculator',
    description: 'Alex Rivera replied to your inquiry regarding the TI-84 Plus CE Graphing Calculator.',
    timeAgo: '1h ago',
    category: 'marketplace',
    isRead: false,
    type: 'market',
    actionButton: {
      label: 'View Message',
      viewTarget: 'chat'
    }
  },
  {
    id: 'notif-4',
    title: 'Hackathon 2026 Ticket Confirmed',
    description: 'Your registration for Hackathon 2026 has been verified. You can access your digital QR entrance pass now.',
    timeAgo: '3h ago',
    category: 'academic',
    isRead: true,
    type: 'event',
    actionButton: {
      label: 'View QR Pass',
      viewTarget: 'events'
    }
  },
  {
    id: 'notif-5',
    title: 'Campus Lost Item Report Submitted',
    description: 'A brown leather wallet matching your department profile was handed in to the Central Cafeteria security desk.',
    timeAgo: '1 day ago',
    category: 'social',
    isRead: true,
    type: 'system',
    actionButton: {
      label: 'Check Lost & Found',
      viewTarget: 'lostfound'
    }
  }
];

export const initialAdminReports: AdminReport[] = [
  {
    id: 'rep-1',
    reporterInitials: 'TS',
    reporterName: 'Tanvir Sarker',
    reporterRole: 'Student (Computer Science)',
    reportedContent: 'Marketplace listing claiming to sell official final exam question bank copies for $150.',
    locationContext: 'Campus Marketplace • Books & Materials',
    reason: 'Academic integrity violation and fraudulent material solicitation.',
    priority: 'Urgent',
    status: 'Pending'
  },
  {
    id: 'rep-2',
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
    id: 'rep-3',
    reporterInitials: 'AA',
    reporterName: 'Amena Akter',
    reporterRole: 'Student (Software Engineering)',
    reportedContent: 'Repeated offensive comments directed at project members during group code review session.',
    locationContext: 'Campus Social Feed • Post #482 Comments',
    reason: 'Violating student code of conduct and peer harassment.',
    priority: 'Medium',
    status: 'Reviewed'
  }
];
