// src/types.ts
export interface TemplateCategory {
  id: string;
  name: string;
  description: string;
}

export type TemplateType = 'latex' | 'typst';

export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  author: string;
  version: string;
  lastUpdated: string;
  downloadUrl: string;
  previewImage?: string;
  type?: TemplateType;
  compile?: string;
  file?: string;
  versions?: TemplateVersion[];
}

export interface TemplateVersion {
  version: string;
  downloadUrl: string;
  previewImage?: string;
  lastUpdated: string;
  compile?: string;
  file?: string;
}

export interface TemplatesAPI {
  lastUpdated: string;
  version: string;
  categories: Array<{
    id: string;
    name: string;
    description: string;
    templates: Template[];
  }>;
}

export interface TemplateMetadata {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  author: string;
  version: string;
  lastUpdated: string;
  downloadUrl?: string;
  previewImage?: string;
  type?: TemplateType;
  compile?: string;
  file?: string;
}