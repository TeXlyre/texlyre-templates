// src/utils.ts
import { TemplateMetadata, TemplateCategory } from './types';

export function validateTemplateMetadata(metadata: any): TemplateMetadata {
  const requiredFields = ['id', 'name', 'description', 'category', 'tags', 'author', 'version', 'lastUpdated'];

  for (const field of requiredFields) {
    if (!metadata[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  if (!Array.isArray(metadata.tags)) {
    throw new Error('Tags must be an array');
  }

  if (!/^\d+\.\d+\.\d+$/.test(metadata.version)) {
    throw new Error('Version must follow semantic versioning (x.y.z)');
  }

  try {
    new Date(metadata.lastUpdated);
  } catch {
    throw new Error('Invalid lastUpdated date format');
  }

  if (metadata.description && metadata.description.length < 20) {
    console.warn('Description is quite short, consider adding more detail');
  }

  return metadata as TemplateMetadata;
}

export function validateCategory(category: any): TemplateCategory {
  const requiredFields = ['id', 'name', 'description'];

  for (const field of requiredFields) {
    if (!category[field]) {
      throw new Error(`Missing required category field: ${field}`);
    }
  }

  if (!/^[a-z0-9-]+$/.test(category.id)) {
    throw new Error('Category ID must contain only lowercase letters, numbers, and hyphens');
  }

  return category as TemplateCategory;
}

export function createTemplateUrl(baseUrl: string, categoryId: string, templateId: string, filename: string): string {
  return `${baseUrl}/templates/${categoryId}/${templateId}/${filename}`;
}

export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

export function sanitizeTemplateId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function generateTemplateMetadata(
  id: string,
  name: string,
  description: string,
  category: string,
  author: string,
  tags: string[] = []
): TemplateMetadata {
  return {
    id,
    name,
    description,
    category,
    tags: [...new Set(tags)], // Remove duplicates
    author,
    version: '1.0.0',
    lastUpdated: new Date().toISOString()
  };
}