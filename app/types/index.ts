export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: 'USER' | 'NGO' | 'ADMIN';
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OfficialDocument {
  id: string;
  name: string;
  description: string;
  url: string;
  createdAt: Date;
}

export interface NGOProfile {
  id: string;
  userId: string;
  name: string;
  yearCreated: number;
  legalRepName: string;
  legalRepEmail: string;
  legalRepPhone: string;
  legalRepFunction: string;
  documents: OfficialDocument[];
  createdAt: Date;
  updatedAt: Date;
} 