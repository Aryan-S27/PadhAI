export interface RoadmapNode {
  id: string;
  label: string;
  description?: string;
  completed?: boolean;
  children?: RoadmapNode[];
  isOptional?: boolean;
  links?: { label: string; url: string }[];
}

export interface RoadmapSection {
  id: string;
  title: string;
  nodes: RoadmapNode[];
}

export interface Roadmap {
  id: string;
  title: string;
  description: string;
  category: 'role-based' | 'skill-based';
  icon: string;
  color: string;
  sections: RoadmapSection[];
  externalUrl?: string;
}

export interface Bookmark {
  roadmapId: string;
  title: string;
  addedAt: string;
  url: string;
}
