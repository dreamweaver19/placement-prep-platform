const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('./config/db');
const Question = require('./models/Question');

const questions = [
  { company: 'TCS', role: 'SDE', category: 'Technical', difficulty: 'Easy', question: 'What is the difference between stack and queue?', answer: 'Stack follows LIFO (Last In First Out) while Queue follows FIFO (First In First Out).' },
  { company: 'TCS', role: 'SDE', category: 'Technical', difficulty: 'Medium', question: 'Explain the concept of normalization in databases.', answer: 'Normalization is the process of organizing data to reduce redundancy and improve data integrity.' },
  { company: 'TCS', role: 'Any', category: 'HR', difficulty: 'Easy', question: 'Tell me about yourself.', answer: 'Focus on education, skills, and why you are interested in this role.' },
  { company: 'Infosys', role: 'SDE', category: 'Technical', difficulty: 'Medium', question: 'What is the difference between process and thread?', answer: 'A process is an independent program in execution. A thread is a lightweight unit within a process that shares memory.' },
  { company: 'Infosys', role: 'SDE', category: 'Aptitude', difficulty: 'Medium', question: 'A train travels 60km in 1 hour. How long to travel 210km?', answer: '3.5 hours' },
  { company: 'Wipro', role: 'SDE', category: 'Technical', difficulty: 'Easy', question: 'What is OOP? Name its four pillars.', answer: 'Object Oriented Programming. Four pillars: Encapsulation, Inheritance, Polymorphism, Abstraction.' },
  { company: 'Wipro', role: 'Any', category: 'HR', difficulty: 'Easy', question: 'Where do you see yourself in 5 years?', answer: 'Talk about growth within the company and developing technical expertise.' },
  { company: 'Amazon', role: 'SDE', category: 'Technical', difficulty: 'Hard', question: 'Design a URL shortener like bit.ly.', answer: 'Use hashing (MD5/Base62), a key-value store like Redis for caching, and a SQL/NoSQL DB for persistence.' },
  { company: 'Amazon', role: 'SDE', category: 'Technical', difficulty: 'Medium', question: 'What are the SOLID principles?', answer: 'Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion.' },
  { company: 'Microsoft', role: 'SDE', category: 'Technical', difficulty: 'Hard', question: 'Explain garbage collection in Java.', answer: 'JVM automatically reclaims memory used by unreachable objects. Uses mark-and-sweep, generational GC.' },
  { company: 'Google', role: 'SDE', category: 'Technical', difficulty: 'Hard', question: 'How does HashMap work internally in Java?', answer: 'Uses array of linked lists (buckets). Key hashCode() determines bucket. Equals() resolves collision.' },
  { company: 'Accenture', role: 'SDE', category: 'Technical', difficulty: 'Easy', question: 'What is the difference between HTTP and HTTPS?', answer: 'HTTPS is HTTP with SSL/TLS encryption. It encrypts data in transit and verifies server identity.' },
  { company: 'Cognizant', role: 'SDE', category: 'HR', difficulty: 'Easy', question: 'Why do you want to join our company?', answer: 'Research the company and align your answer with their values, projects, and growth opportunities.' },
];

const seed = async () => {
  try {
    await connectDB();
    await Question.deleteMany({});
    await Question.insertMany(questions);
    console.log('Seeded', questions.length, 'questions');
    process.exit(0);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

seed();
