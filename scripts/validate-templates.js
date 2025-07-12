// scripts/validate-templates.js - Validate template structure and metadata
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const TEMPLATES_DIR = './templates';
const CATEGORIES_FILE = './categories.yml';

class TemplateValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
  }

  log(level, message, template = null) {
    const fullMessage = template ? `${template}: ${message}` : message;
    if (level === 'error') {
      this.errors.push(fullMessage);
      console.error(`❌ ${fullMessage}`);
    } else if (level === 'warning') {
      this.warnings.push(fullMessage);
      console.warn(`⚠️  ${fullMessage}`);
    } else {
      console.log(`✅ ${fullMessage}`);
    }
  }

  validateRequiredFiles(templatePath, templateId) {
    const metadataPath = path.join(templatePath, 'metadata.json');
    const templateZipPath = path.join(templatePath, 'template.zip');
    const previewPath = path.join(templatePath, 'preview.png');

    if (!fs.existsSync(metadataPath)) {
      this.log('error', 'Missing metadata.json', templateId);
      return false;
    }

    if (!fs.existsSync(templateZipPath)) {
      this.log('error', 'Missing template.zip', templateId);
      return false;
    }

    if (!fs.existsSync(previewPath)) {
      this.log('warning', 'Missing preview.png (recommended)', templateId);
    }

    return true;
  }

  validateMetadata(templatePath, templateId, categoryId, validCategories) {
    const metadataPath = path.join(templatePath, 'metadata.json');

    try {
      const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));

      // Required fields
      const requiredFields = ['id', 'name', 'description', 'category', 'tags', 'author', 'version', 'lastUpdated'];
      for (const field of requiredFields) {
        if (!metadata[field]) {
          this.log('error', `Missing required field: ${field}`, templateId);
        }
      }

      // ID validation
      if (metadata.id !== templateId) {
        this.log('error', `ID mismatch: metadata.id (${metadata.id}) != directory name (${templateId})`, templateId);
      }

      // Category validation
      if (metadata.category !== categoryId) {
        this.log('error', `Category mismatch: metadata.category (${metadata.category}) != parent directory (${categoryId})`, templateId);
      }

      if (!validCategories.includes(metadata.category)) {
        this.log('error', `Invalid category: ${metadata.category}`, templateId);
      }

      // Tags validation
      if (!Array.isArray(metadata.tags)) {
        this.log('error', 'Tags must be an array', templateId);
      } else if (metadata.tags.length === 0) {
        this.log('warning', 'No tags specified', templateId);
      }

      // Date validation
      try {
        new Date(metadata.lastUpdated);
      } catch {
        this.log('error', 'Invalid lastUpdated date format', templateId);
      }

      // Version validation
      if (!/^\d+\.\d+\.\d+$/.test(metadata.version)) {
        this.log('warning', 'Version should follow semantic versioning (x.y.z)', templateId);
      }

      // Description length
      if (metadata.description && metadata.description.length < 20) {
        this.log('warning', 'Description is quite short, consider adding more detail', templateId);
      }

      return metadata;
    } catch (error) {
      this.log('error', `Invalid JSON in metadata.json: ${error.message}`, templateId);
      return null;
    }
  }

  validateZipFile(templatePath, templateId) {
    const templateZipPath = path.join(templatePath, 'template.zip');

    try {
      const stats = fs.statSync(templateZipPath);

      // Check file size (warn if too large)
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (stats.size > maxSize) {
        this.log('warning', `Template ZIP is quite large (${Math.round(stats.size / 1024 / 1024)}MB)`, templateId);
      }

      // Check if file is actually a ZIP (basic check)
      const buffer = fs.readFileSync(templateZipPath);
      if (buffer.length < 4 || buffer.readUInt32LE(0) !== 0x04034b50) {
        this.log('error', 'template.zip does not appear to be a valid ZIP file', templateId);
      }

    } catch (error) {
      this.log('error', `Error reading template.zip: ${error.message}`, templateId);
    }
  }

  validatePreviewImage(templatePath, templateId) {
    const previewPath = path.join(templatePath, 'preview.png');

    if (fs.existsSync(previewPath)) {
      try {
        const stats = fs.statSync(previewPath);

        // Check file size
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (stats.size > maxSize) {
          this.log('warning', 'Preview image is quite large, consider optimizing', templateId);
        }

        // Basic PNG validation
        const buffer = fs.readFileSync(previewPath, null, 0, 8);
        const pngSignature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
        if (!buffer.equals(pngSignature)) {
          this.log('error', 'preview.png is not a valid PNG file', templateId);
        }

      } catch (error) {
        this.log('error', `Error reading preview.png: ${error.message}`, templateId);
      }
    }
  }

  validateCategories() {
    if (!fs.existsSync(CATEGORIES_FILE)) {
      this.log('error', 'Missing categories.yml file');
      return [];
    }

    try {
      const categoriesData = yaml.load(fs.readFileSync(CATEGORIES_FILE, 'utf8'));
      const categories = categoriesData.categories || [];

      if (categories.length === 0) {
        this.log('error', 'No categories defined in categories.yml');
        return [];
      }

      const validCategories = [];
      for (const category of categories) {
        if (!category.id || !category.name || !category.description) {
          this.log('error', 'Category missing required fields (id, name, description)');
        } else {
          validCategories.push(category.id);
        }
      }

      this.log('info', `Found ${validCategories.length} valid categories`);
      return validCategories;
    } catch (error) {
      this.log('error', `Error reading categories.yml: ${error.message}`);
      return [];
    }
  }

  async validateAll() {
    console.log('🔍 Validating TeXlyre Templates...\n');

    // Validate categories first
    const validCategories = this.validateCategories();
    if (validCategories.length === 0) {
      return false;
    }

    if (!fs.existsSync(TEMPLATES_DIR)) {
      this.log('error', 'Templates directory not found');
      return false;
    }

    // Get all category directories
    const categoryDirs = fs.readdirSync(TEMPLATES_DIR, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    if (categoryDirs.length === 0) {
      this.log('error', 'No template categories found');
      return false;
    }

    let totalTemplates = 0;
    let validTemplates = 0;

    // Validate each category
    for (const categoryId of categoryDirs) {
      if (!validCategories.includes(categoryId)) {
        this.log('warning', `Category directory "${categoryId}" not found in categories.yml`);
        continue;
      }

      const categoryPath = path.join(TEMPLATES_DIR, categoryId);

      // Get all templates in this category
      const templateDirs = fs.readdirSync(categoryPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

      console.log(`\n📁 Validating category: ${categoryId} (${templateDirs.length} templates)`);

      for (const templateId of templateDirs) {
        totalTemplates++;
        const templatePath = path.join(categoryPath, templateId);

        console.log(`\n  📄 ${templateId}`);

        // Validate required files
        if (!this.validateRequiredFiles(templatePath, templateId)) {
          continue;
        }

        // Validate metadata
        const metadata = this.validateMetadata(templatePath, templateId, categoryId, validCategories);
        if (!metadata) {
          continue;
        }

        // Validate ZIP file
        this.validateZipFile(templatePath, templateId);

        // Validate preview image
        this.validatePreviewImage(templatePath, templateId);

        validTemplates++;
        this.log('info', 'Template validation passed', templateId);
      }
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 VALIDATION SUMMARY');
    console.log('='.repeat(50));
    console.log(`Total templates: ${totalTemplates}`);
    console.log(`Valid templates: ${validTemplates}`);
    console.log(`Errors: ${this.errors.length}`);
    console.log(`Warnings: ${this.warnings.length}`);

    if (this.errors.length > 0) {
      console.log('\n❌ ERRORS:');
      this.errors.forEach(error => console.log(`  • ${error}`));
    }

    if (this.warnings.length > 0) {
      console.log('\n⚠️  WARNINGS:');
      this.warnings.forEach(warning => console.log(`  • ${warning}`));
    }

    const success = this.errors.length === 0;
    console.log(`\n${success ? '✅ All validations passed!' : '❌ Validation failed - please fix errors above'}`);

    return success;
  }
}

// Run validation
async function main() {
  const validator = new TemplateValidator();
  const success = await validator.validateAll();
  process.exit(success ? 0 : 1);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = TemplateValidator;