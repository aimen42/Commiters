
export type Gender = 'Male' | 'Female' | 'Transgender' | 'Non-binary' | 'Others' | 'Prefer not to say';
export type Sexuality = 'Straight' | 'Gay' | 'Lesbian' | 'Bisexual' | 'Pansexual' | 'Asexual' | 'Others' | 'Prefer not to say';

export interface Project {
  id: string;
  name: string;
  description: string;
  techStack: string[];
  link?: string;
  stars?: number;
  forks?: number;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  gender: Gender;
  sexuality: Sexuality;
  dob: string;
  photos: string[];
  interests: string[];
  hobbies: string[];
  habits: {
    drink: 'yes' | 'no' | 'occasionally';
    smoke: 'yes' | 'no' | 'occasionally';
  };
  pets: string[];
  lastProject: Project;
  topProject: Project;
  recentProjects: Project[];
  age: number;
}

export type ViewState = 'login' | 'signup' | 'app';
export type AppSection = 'home' | 'profile' | 'projects' | 'likes' | 'chats';

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
}
