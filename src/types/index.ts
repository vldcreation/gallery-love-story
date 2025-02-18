export interface Photo {
  id: string;
  title: string;
  description: string | null;
  path: string;
  tags: string[];
  categories: string[];
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: string;
  name: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  created_at: string;
}