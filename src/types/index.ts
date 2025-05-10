export interface SrefItem {
  id: string;
  srefCode: string;
  imageUrl: string;
  title: string;
  description: string;
  tags: string[];
  createdAt: string;
}

export type ViewMode = 'grid' | 'list';