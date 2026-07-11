// example/github-pages-example/src/index.js
import './styles.css';

class SimpleTemplatesApi {
  constructor(baseUrl = 'https://texlyre.github.io/texlyre-templates') {
    this.baseUrl = baseUrl;
  }

  async getTemplates() {
    const response = await fetch(`${this.baseUrl}/api/templates.json`);
    if (!response.ok) {
      throw new Error(`Failed to fetch templates: ${response.statusText}`);
    }
    return response.json();
  }

  async searchTemplates(query) {
    const api = await this.getTemplates();
    const allTemplates = api.categories.flatMap(cat => cat.templates);

    const lowercaseQuery = query.toLowerCase();
    return allTemplates.filter(template =>
      template.name.toLowerCase().includes(lowercaseQuery) ||
      template.description.toLowerCase().includes(lowercaseQuery) ||
      template.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
      template.author.toLowerCase().includes(lowercaseQuery)
    );
  }

  async getTemplatesByCategory(categoryId) {
    const api = await this.getTemplates();
    const category = api.categories.find(cat => cat.id === categoryId);
    return category?.templates || [];
  }

  async downloadTemplate(template) {
    const response = await fetch(template.downloadUrl);
    if (!response.ok) {
      throw new Error(`Failed to download template: ${response.statusText}`);
    }
    return response.blob();
  }
}

const templatesApi = new SimpleTemplatesApi();

class TemplatesBrowser {
  constructor() {
    this.templates = [];
    this.categories = [];
    this.filteredTemplates = [];
    this.currentSearch = '';
    this.currentCategory = '';
    this.currentType = '';
    this.apiData = null;
  }

  async init() {
    try {
      await this.loadData();
      this.setupEventListeners();
      this.updateStats();
      this.renderTemplates();
      this.hideLoading();
    } catch (error) {
      console.error('Failed to initialize:', error);
      this.showError();
    }
  }

  async loadData() {
    this.apiData = await templatesApi.getTemplates();
    this.templates = this.apiData.categories.flatMap(cat => cat.templates);
    this.categories = this.apiData.categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      description: cat.description
    }));
    this.filteredTemplates = [...this.templates];
    this.populateCategoryFilter();
  }

  populateCategoryFilter() {
    const categoryFilter = document.getElementById('categoryFilter');
    this.categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category.id;
      option.textContent = category.name;
      categoryFilter.appendChild(option);
    });
  }

  setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const typeFilter = document.getElementById('typeFilter');

    searchInput.addEventListener('input', (e) => {
      this.currentSearch = e.target.value;
      this.filterTemplates();
    });

    categoryFilter.addEventListener('change', (e) => {
      this.currentCategory = e.target.value;
      this.filterTemplates();
    });

    typeFilter.addEventListener('change', (e) => {
      this.currentType = e.target.value;
      this.filterTemplates();
    });
  }

  filterTemplates() {
    let filtered = [...this.templates];

    if (this.currentCategory) {
      filtered = filtered.filter(template => template.category === this.currentCategory);
    }

    if (this.currentType) {
      filtered = filtered.filter(template => (template.type || 'latex') === this.currentType);
    }

    if (this.currentSearch) {
      const query = this.currentSearch.toLowerCase();
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(query) ||
        template.description.toLowerCase().includes(query) ||
        template.tags.some(tag => tag.toLowerCase().includes(query)) ||
        template.author.toLowerCase().includes(query)
      );
    }

    this.filteredTemplates = filtered;
    this.renderTemplates();
  }

  updateStats() {
    document.getElementById('totalTemplates').textContent = this.templates.length;
    document.getElementById('totalCategories').textContent = this.categories.length;

    const lastUpdated = new Date(this.apiData.lastUpdated);
    document.getElementById('lastUpdated').textContent = lastUpdated.toLocaleDateString();
  }

  renderTemplates() {
    const grid = document.getElementById('templates-grid');
    grid.innerHTML = '';

    if (this.filteredTemplates.length === 0) {
      grid.innerHTML = '<div class="no-results">No templates found matching your criteria.</div>';
      return;
    }

    this.filteredTemplates.forEach(template => {
      const templateCard = this.createTemplateCard(template);
      grid.appendChild(templateCard);
    });
  }

  createTemplateCard(template) {
    const card = document.createElement('div');
    card.className = 'template-card';

    const category = this.categories.find(cat => cat.id === template.category);
    const templateType = template.type || 'latex';
    const hasMultipleVersions = template.versions && template.versions.length > 1;

    const versionMarkup = hasMultipleVersions
      ? `<select class="template-version-select" data-role="version-select">
          ${template.versions.map(v => `<option value="${v.version}">v${v.version}</option>`).join('')}
        </select>`
      : template.version
        ? `<span class="template-version">v${template.version}</span>`
        : '';

    card.innerHTML = `
      <span class="template-type">${templateType.toUpperCase()}</span>
      <div class="template-preview">
        ${template.previewImage
        ? `<img src="${template.previewImage}" alt="${template.name} preview" loading="lazy">`
        : '<div class="no-preview">No Preview</div>'
      }
      </div>
      <div class="template-info">
        <h3 class="template-name">${template.name}</h3>
        <p class="template-description">${template.description}</p>
        
        <div class="template-meta">
          <span class="template-category">${category ? category.name : template.category}</span>
          ${versionMarkup}
          <span class="template-author">by ${template.author}</span>
        </div>
        <div class="template-tags">
          ${template.tags.slice(0, 3).map(tag => `<span class="tag">${tag}</span>`).join('')}
          ${template.tags.length > 3 ? `<span class="tag-more">+${template.tags.length - 3} more</span>` : ''}
        </div>
        <div class="template-actions">
          <button class="btn-download" data-template-id="${template.id}">Download</button>
          <button class="btn-texlyre" data-template-url="${template.downloadUrl}">Open in TeXlyre</button>
        </div>
      </div>
    `;

    this.setupTemplateCardEvents(card, template);
    return card;
  }

  setupTemplateCardEvents(card, template) {
    const downloadBtn = card.querySelector('.btn-download');
    const texlyreBtn = card.querySelector('.btn-texlyre');
    const versionSelect = card.querySelector('[data-role="version-select"]');

    const getEffectiveTemplate = () => {
      if (!versionSelect) return template;

      const versionEntry = template.versions.find(
        v => v.version === versionSelect.value,
      );
      if (!versionEntry) return template;

      return {
        ...template,
        version: versionEntry.version,
        downloadUrl: versionEntry.downloadUrl,
        previewImage: versionEntry.previewImage,
        lastUpdated: versionEntry.lastUpdated,
        compile: versionEntry.compile,
        file: versionEntry.file,
      };
    };

    downloadBtn.addEventListener('click', async () => {
      try {
        downloadBtn.textContent = 'Downloading...';
        downloadBtn.disabled = true;

        const blob = await templatesApi.downloadTemplate(getEffectiveTemplate());
        this.downloadBlob(blob, `${template.id}.zip`);

        downloadBtn.textContent = 'Downloaded!';
        setTimeout(() => {
          downloadBtn.textContent = 'Download';
          downloadBtn.disabled = false;
        }, 2000);
      } catch (error) {
        console.error('Download failed:', error);
        downloadBtn.textContent = 'Download Failed';
        setTimeout(() => {
          downloadBtn.textContent = 'Download';
          downloadBtn.disabled = false;
        }, 2000);
      }
    });

    texlyreBtn.addEventListener('click', () => {
      const effectiveTemplate = getEffectiveTemplate();
      const newProjectType = effectiveTemplate.type || 'latex';
      const fileSuffix = effectiveTemplate.file
        ? `&file:${encodeURIComponent(effectiveTemplate.file)}`
        : '';
      const compileSuffix = effectiveTemplate.compile
        ? `&compile:${encodeURIComponent(effectiveTemplate.compile)}`
        : '';
      const texlyreUrl = `https://texlyre.github.io/texlyre/#newProjectName:${encodeURIComponent(effectiveTemplate.name)}&newProjectDescription:${encodeURIComponent(effectiveTemplate.description)}&newProjectType:${newProjectType}&newProjectTags:${encodeURIComponent(effectiveTemplate.tags.join(','))}&newProjectFiles:${encodeURIComponent(effectiveTemplate.downloadUrl)}${fileSuffix}${compileSuffix}`;
      window.open(texlyreUrl, '_blank');
    });
  }

  downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  hideLoading() {
    document.getElementById('loading').style.display = 'none';
  }

  showError() {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('error').style.display = 'block';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const browser = new TemplatesBrowser();
  browser.init();
});