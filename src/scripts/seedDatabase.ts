import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { db, auth } from '@/lib/firebase';
import { JobStatus, JobPriority, PaymentStatus } from '@/types/jobs';

// Sample admin user
const adminUser = {
  email: 'admin@yeshuacleaning.com',
  password: 'admin123',
  firstName: 'Admin',
  lastName: 'User',
  role: 'admin' as const
};

// Sample cleaner users
const cleanerUsers = [
  {
    email: 'maria@yeshuacleaning.com',
    password: 'cleaner123',
    firstName: 'Maria',
    lastName: 'Rodriguez',
    role: 'cleaner' as const,
    teamId: 't1'
  },
  {
    email: 'james@yeshuacleaning.com',
    password: 'cleaner123',
    firstName: 'James',
    lastName: 'Wilson',
    role: 'cleaner' as const,
    teamId: 't1'
  },
  {
    email: 'carlos@yeshuacleaning.com',
    password: 'cleaner123',
    firstName: 'Carlos',
    lastName: 'Martinez',
    role: 'cleaner' as const,
    teamId: 't2'
  },
  {
    email: 'lisa@yeshuacleaning.com',
    password: 'cleaner123',
    firstName: 'Lisa',
    lastName: 'Chen',
    role: 'cleaner' as const,
    teamId: 't2'
  }
];

// Sample jobs data
const sampleJobs = [
  {
    jobNumber: 'YC-2024-001',
    status: JobStatus.PENDING,
    priority: JobPriority.NORMAL,
    client: {
      id: 'c1',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@email.com',
      phone: '(555) 123-4567'
    },
    address: {
      street: '123 Oak Street',
      apartment: 'Apt 2B',
      city: 'Arlington',
      state: 'VA',
      zipCode: '22201'
    },
    service: {
      bedrooms: 2,
      bathrooms: 1,
      cleaningType: 'Regular Cleaning',
      estimatedDuration: '1h 30m',
      specialInstructions: 'Please be careful around the antique vase in the living room',
      parkingInstructions: 'Park in visitor spot #15'
    },
    pricing: {
      baseRate: 120,
      addOns: 25,
      total: 145
    },
    scheduledDate: new Date('2024-01-15'),
    scheduledTime: '10:00',
    frequency: 'One-time',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
    invoiceSent: false,
    paymentStatus: PaymentStatus.PENDING
  },
  {
    jobNumber: 'YC-2024-002',
    status: JobStatus.ASSIGNED,
    priority: JobPriority.HIGH,
    client: {
      id: 'c2',
      firstName: 'Mike',
      lastName: 'Davis',
      email: 'mike.davis@email.com',
      phone: '(555) 234-5678'
    },
    address: {
      street: '456 Pine Avenue',
      city: 'Alexandria',
      state: 'VA',
      zipCode: '22302'
    },
    service: {
      bedrooms: 3,
      bathrooms: 2,
      cleaningType: 'Deep Cleaning',
      estimatedDuration: '3h 15m',
      specialInstructions: 'Focus on kitchen and bathrooms - recent renovation',
      parkingInstructions: 'Driveway available'
    },
    pricing: {
      baseRate: 200,
      addOns: 60,
      total: 260
    },
    scheduledDate: new Date('2024-01-16'),
    scheduledTime: '09:00',
    frequency: 'One-time',
    assignedTeam: {
      id: 't1',
      name: 'Team Alpha',
      members: ['Maria Rodriguez', 'James Wilson']
    },
    createdAt: new Date('2024-01-11'),
    updatedAt: new Date('2024-01-12'),
    invoiceSent: true,
    paymentStatus: PaymentStatus.PAID
  },
  {
    jobNumber: 'YC-2024-003',
    status: JobStatus.IN_PROGRESS,
    priority: JobPriority.NORMAL,
    client: {
      id: 'c3',
      firstName: 'Emma',
      lastName: 'Wilson',
      email: 'emma.wilson@email.com',
      phone: '(555) 345-6789'
    },
    address: {
      street: '789 Maple Drive',
      city: 'Falls Church',
      state: 'VA',
      zipCode: '22043'
    },
    service: {
      bedrooms: 1,
      bathrooms: 1,
      cleaningType: 'Regular Cleaning',
      estimatedDuration: '1h 15m'
    },
    pricing: {
      baseRate: 100,
      addOns: 0,
      total: 100
    },
    scheduledDate: new Date(),
    scheduledTime: '14:00',
    frequency: 'Weekly',
    assignedTeam: {
      id: 't2',
      name: 'Team Beta',
      members: ['Carlos Martinez', 'Lisa Chen']
    },
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date(),
    invoiceSent: true,
    paymentStatus: PaymentStatus.PAID
  },
  {
    jobNumber: 'YC-2024-004',
    status: JobStatus.COMPLETED,
    priority: JobPriority.NORMAL,
    client: {
      id: 'c4',
      firstName: 'David',
      lastName: 'Brown',
      email: 'david.brown@email.com',
      phone: '(555) 456-7890'
    },
    address: {
      street: '321 Cedar Lane',
      city: 'McLean',
      state: 'VA',
      zipCode: '22101'
    },
    service: {
      bedrooms: 4,
      bathrooms: 3,
      cleaningType: 'Move-out Cleaning',
      estimatedDuration: '4h 30m',
      specialInstructions: 'Property must be ready for final inspection'
    },
    pricing: {
      baseRate: 300,
      addOns: 80,
      total: 380
    },
    scheduledDate: new Date('2024-01-13'),
    scheduledTime: '08:00',
    frequency: 'One-time',
    assignedTeam: {
      id: 't1',
      name: 'Team Alpha',
      members: ['Maria Rodriguez', 'James Wilson']
    },
    createdAt: new Date('2024-01-09'),
    updatedAt: new Date('2024-01-13'),
    completedAt: new Date('2024-01-13'),
    invoiceSent: true,
    paymentStatus: PaymentStatus.PAID
  }
];

async function createUser(userData: any) {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      userData.email,
      userData.password
    );

    const user = userCredential.user;

    // Update display name
    await updateProfile(user, {
      displayName: `${userData.firstName} ${userData.lastName}`
    });

    // Create user profile in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role,
      teamId: userData.teamId,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log(`Created user: ${userData.email}`);
    return user;
  } catch (error: any) {
    console.error(`Error creating user ${userData.email}:`, error.message);
  }
}

async function seedJobs() {
  try {
    const jobsCollection = collection(db, 'jobs');
    
    for (const job of sampleJobs) {
      await addDoc(jobsCollection, {
        ...job,
        scheduledDate: job.scheduledDate,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
        completedAt: job.completedAt || null
      });
      console.log(`Created job: ${job.jobNumber}`);
    }
    
    console.log('All jobs seeded successfully!');
  } catch (error) {
    console.error('Error seeding jobs:', error);
  }
}

async function seedTeams() {
  try {
    const teams = [
      {
        id: 't1',
        name: 'Team Alpha',
        members: ['Maria Rodriguez', 'James Wilson'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 't2',
        name: 'Team Beta',
        members: ['Carlos Martinez', 'Lisa Chen'],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    for (const team of teams) {
      await setDoc(doc(db, 'teams', team.id), team);
      console.log(`Created team: ${team.name}`);
    }
    
    console.log('All teams seeded successfully!');
  } catch (error) {
    console.error('Error seeding teams:', error);
  }
}

export async function seedDatabase() {
  console.log('Starting database seeding...');
  
  try {
    // Create admin user
    await createUser(adminUser);
    
    // Create cleaner users
    for (const cleaner of cleanerUsers) {
      await createUser(cleaner);
    }
    
    // Seed teams
    await seedTeams();
    
    // Seed jobs
    await seedJobs();
    
    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error during database seeding:', error);
  }
}

// Run seeding if this script is executed directly
if (typeof window === 'undefined') {
  seedDatabase();
}
