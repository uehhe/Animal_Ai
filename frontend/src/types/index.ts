export type Role = 'USER' | 'ADMIN';

export type Species = 'DOG' | 'CAT' | 'OTHER';

export type Gender = 'MALE' | 'FEMALE' | 'UNKNOWN';

export type HealthStatus = 'HEALTHY' | 'SICK' | 'RECOVERING' | 'CHRONIC' | 'UNKNOWN';

export type VaccinationStatus = 'COMPLETED' | 'UPCOMING' | 'OVERDUE';

export type MedicationStatus = 'ACTIVE' | 'EXPIRING_SOON' | 'COMPLETED';

export type CareType =
  | 'FEEDING'
  | 'MEDICATION'
  | 'BATHING'
  | 'GROOMING'
  | 'NAIL_TRIMMING'
  | 'WALKING'
  | 'CLEANING'
  | 'VET_VISIT'
  | 'VACCINATION'
  | 'OTHER';

export type RepeatType = 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY';

export type ScheduleStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED';

export type Mood = 'HAPPY' | 'ENERGETIC' | 'TIRED' | 'ANXIOUS' | 'SICK';

export type NotificationType = 'MEDICATION' | 'VACCINATION' | 'SCHEDULE' | 'HEALTH_ALERT' | 'SYSTEM';

export type AIRole = 'USER' | 'ASSISTANT' | 'SYSTEM';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string | null;
  isActive?: boolean;
  createdAt: string;
}

export interface Pet {
  id: string;
  userId: string;
  name: string;
  species: Species;
  breed: string;
  gender: Gender;
  birthDate?: string | null;
  age?: number | null;
  weight?: number | null;
  color?: string | null;
  avatar?: string | null;
  microchipId?: string | null;
  healthStatus: HealthStatus;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    careSchedules?: number;
    vaccinations?: number;
    medications?: number;
    healthRecords?: number;
    diaries?: number;
  };
}

export interface HealthRecord {
  id: string;
  petId: string;
  date: string;
  weight?: number | null;
  temperature?: number | null;
  symptoms?: string | null;
  diagnosis: string;
  treatment?: string | null;
  clinicName?: string | null;
  veterinarian?: string | null;
  notes?: string | null;
  createdAt: string;
  pet?: {
    name: string;
  };
}

export interface Vaccination {
  id: string;
  petId: string;
  vaccineName: string;
  administeredDate: string;
  expirationDate?: string | null;
  nextDueDate?: string | null;
  clinicName?: string | null;
  veterinarian?: string | null;
  status: VaccinationStatus;
  notes?: string | null;
  createdAt: string;
  pet?: {
    id: string;
    name: string;
    avatar?: string | null;
  };
}

export interface Medication {
  id: string;
  petId: string;
  name: string;
  dosage: string;
  unit: string;
  frequency: string;
  startDate: string;
  endDate?: string | null;
  instructions?: string | null;
  prescribedBy?: string | null;
  status: MedicationStatus;
  notes?: string | null;
  createdAt: string;
  pet?: {
    id: string;
    name: string;
    avatar?: string | null;
  };
}

export interface CareSchedule {
  id: string;
  petId: string;
  title: string;
  careType: CareType;
  scheduledDate: string;
  scheduledTime?: string | null;
  repeat: RepeatType;
  status: ScheduleStatus;
  notes?: string | null;
  createdAt: string;
  pet?: {
    id: string;
    name: string;
    species: Species;
    breed?: string;
    avatar?: string | null;
  };
}

export interface Diary {
  id: string;
  petId: string;
  date: string;
  title: string;
  content: string;
  mood: Mood;
  activity?: string | null;
  weight?: number | null;
  imageUrl?: string | null;
  createdAt: string;
  pet?: {
    name: string;
  };
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  link?: string | null;
  createdAt: string;
}

export interface AIMessageItem {
  id: string;
  conversationId: string;
  role: AIRole;
  content: string;
  createdAt: string;
}

export interface AIConversationItem {
  id: string;
  userId: string;
  petId?: string | null;
  title: string;
  createdAt: string;
  updatedAt: string;
  pet?: {
    id: string;
    name: string;
    species: Species;
    breed?: string;
    avatar?: string | null;
    weight?: number | null;
    healthStatus?: HealthStatus;
  } | null;
  messages?: AIMessageItem[];
}

export interface DashboardSummary {
  totalPets: number;
  todaySchedulesCount: number;
  upcomingVaccinesCount: number;
  activeMedicationsCount: number;
  healthAlertsCount: number;
  todaySchedules: CareSchedule[];
  upcomingVaccinations: Vaccination[];
  activeMedications: Medication[];
  recentActivities: Array<{
    id: string;
    title: string;
    petName: string;
    date: string;
    type: string;
    content: string;
    mood?: Mood;
  }>;
  schedulesByDay: Array<{
    day: string;
    date: string;
    completed: number;
    pending: number;
  }>;
  pets: Pet[];
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}
