// example/github-pages-example/src/index.js
import { templatesApi } from '../../../dist';
import './styles.css';

class TemplatesBrowser {
  constructor() {
    this.templates = [];
    this.categories = [];
    this.filteredTemplates = [];
    this.currentSearch = '';
    this.currentCategory = '';
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

    searchInput.addEventListener('input', (e) => {
      this.currentSearch = e.target.value;
      this.filterTemplates();
    });

    categoryFilter.addEventListener('change', (e) => {
      this.currentCategory = e.target.value;
      this.filterTemplates();
    });
  }

  filterTemplates() {
    let filtered = [...this.templates];

    if (this.currentCategory) {
      filtered = filtered.filter(template => template.category === this.currentCategory);
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

    card.innerHTML = `
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

    downloadBtn.addEventListener('click', async () => {
      try {
        downloadBtn.textContent = 'Downloading...';
        downloadBtn.disabled = true;

        const blob = await templatesApi.downloadTemplate(template);
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
      const texlyreUrl = `https://texlyre.github.io/texlyre/?template=${encodeURIComponent(template.downloadUrl)}`;
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

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const browser = new TemplatesBrowser();
  browser.init();
});