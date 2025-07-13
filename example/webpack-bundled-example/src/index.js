import { templatesApi } from '../../../dist';
import './styles.css';

class TemplatesDemo {
  constructor() {
    this.templates = [];
    this.categories = [];
  }

  async init() {
    try {
      await this.loadData();
      this.setupEventListeners();
      this.updateStats();
      this.hideLoading();
    } catch (error) {
      console.error('Failed to initialize:', error);
      this.showError();
    }
  }

  async loadData() {
    const api = await templatesApi.getTemplates();
    this.templates = api.categories.flatMap(cat => cat.templates);
    this.categories = api.categories;
    this.populateCategorySelect();
  }

  populateCategorySelect() {
    const select = document.getElementById('categorySelect');
    this.categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category.id;
      option.textContent = category.name;
      select.appendChild(option);
    });
  }

  setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    const categorySelect = document.getElementById('categorySelect');

    searchInput.addEventListener('input', async (e) => {
      const query = e.target.value;
      if (query.length > 2) {
        const results = await templatesApi.searchTemplates(query);
        this.displayResults(results, 'searchResults');
      } else {
        document.getElementById('searchResults').innerHTML = '';
      }
    });

    categorySelect.addEventListener('change', async (e) => {
      const categoryId = e.target.value;
      if (categoryId) {
        const results = await templatesApi.getTemplatesByCategory(categoryId);
        this.displayResults(results, 'categoryResults');
      } else {
        document.getElementById('categoryResults').innerHTML = '';
      }
    });
  }

  updateStats() {
    document.getElementById('totalTemplates').textContent = this.templates.length;
    document.getElementById('totalCategories').textContent = this.categories.length;
  }

  displayResults(templates, containerId) {
    const container = document.getElementById(containerId);

    if (templates.length === 0) {
      container.innerHTML = '<p class="no-results">No templates found.</p>';
      return;
    }

    const resultsHtml = templates.map(template => `
      <div class="template-item">
        <div class="template-header">
          <h3>${template.name}</h3>
          <span class="template-category">${template.category}</span>
        </div>
        <p class="template-description">${template.description}</p>
        <div class="template-meta">
          <span class="template-author">by ${template.author}</span>
          <span class="template-version">v${template.version}</span>
        </div>
        <div class="template-tags">
          ${template.tags.slice(0, 5).map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
        <div class="template-actions">
          <button onclick="downloadTemplate('${template.id}', '${template.downloadUrl}')">
            Download
          </button>
          <button onclick="openInTexlyre('${template.downloadUrl}')">
            Open in TeXlyre
          </button>
        </div>
      </div>
    `).join('');

    container.innerHTML = resultsHtml;
  }

  hideLoading() {
    document.getElementById('loading').style.display = 'none';
  }

  showError() {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('error').style.display = 'block';
  }
}

// Global functions for button clicks
window.downloadTemplate = async function(templateId, downloadUrl) {
  try {
    const template = { id: templateId, downloadUrl };
    const blob = await templatesApi.downloadTemplate(template);

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${templateId}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Download failed:', error);
    alert('Download failed. Please try again.');
  }
};

window.openInTexlyre = function(downloadUrl) {
  const texlyreUrl = `https://texlyre.github.io/texlyre/?template=${encodeURIComponent(downloadUrl)}`;
  window.open(texlyreUrl, '_blank');
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const demo = new TemplatesDemo();
  demo.init();
});