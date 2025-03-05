export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  status: 'draft' | 'processing' | 'completed';
  thumbnailUrl?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'owner' | 'admin' | 'member';
  avatarUrl?: string;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  members: TeamMember[];
  createdAt: Date;
}

export interface TeamMember {
  userId: string;
  teamId: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: Date;
}

export interface ProjectMember {
  userId: string;
  projectId: string;
  role: 'owner' | 'editor' | 'viewer';
  addedAt: Date;
}

export interface ModelGeneration {
  id: string;
  projectId: string;
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  images: string[];
  modelUrl?: string;
  createdAt: Date;