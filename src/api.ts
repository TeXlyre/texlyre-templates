// src/api.ts
import { TemplatesAPI, Template, TemplateCategory } from './types';

export class TemplatesApiClient {
  private baseUrl: string;
  private cache: TemplatesAPI | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor(baseUrl = 'https://texlyre.github.io/texlyre-templates') {
    this.baseUrl = baseUrl;
  }

  async getTemplates(useCache = true): Promise<TemplatesAPI> {
    const now = Date.now();

    if (useCache && this.cache && (now - this.cacheTimestamp) < this.CACHE_DURATION) {
      return this.cache;
    }

    const response = await fetch(`${this.baseUrl}/api/templates.json`);
    if (!response.ok) {
      throw new Error(`Failed to fetch templates: ${response.statusText}`);
    }

    const data = await response.json();
    this.cache = data;
    this.cacheTimestamp = now;
    return data;
  }

  async getTemplatesByCategory(categoryId: string): Promise<Template[]> {
    const api = await this.getTemplates();
    const category = api.categories.find((cat) => cat.id === categoryId);
    return category?.templates || [];
  }

  async searchTemplates(query: string): Promise<Template[]> {
    const api = await this.getTemplates();
    const allTemplates = api.categories.flatMap((cat) => cat.templates);

    const lowercaseQuery = query.toLowerCase();
    return allTemplates.filter((template) =>
      template.name.toLowerCase().includes(lowercaseQuery) ||
      template.description.toLowerCase().includes(lowercaseQuery) ||
      template.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery)) ||
      template.author.toLowerCase().includes(lowercaseQuery)
    );
  }

  async getCategories(): Promise<TemplateCategory[]> {
    const api = await this.getTemplates();
    return api.categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      description: cat.description
    }));
  }

  async downloadTemplate(template: Template): Promise<Blob> {
    const response = await fetch(template.downloadUrl);
    if (!response.ok) {
      throw new Error(`Failed to download template: ${response.statusText}`);
    }
    return response.blob();
  }

  clearCache(): void {
    this.cache = null;
    this.cacheTimestamp = 0;
  }
}

export const templatesApi = new TemplatesApiClient();