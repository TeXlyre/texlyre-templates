                                   // scripts/validate-templates.cjs
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const TEMPLATES_DIR = './templates';
const CATEGORIES_FILE = './categories.yml';

const SEMVER_DIR = /^\d+\.\d+\.\d+/;

const VALID_COMPILE_VALUES = [
  'pdftex',
  'xetex',
  'busytex-pdftex',
  'busytex-xetex',
  'busytex-luatex',
  'typst',
];

function discoverTemplateVersions(templatePath) {
  const versionDirs = fs.readdirSync(templatePath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory() && SEMVER_DIR.test(dirent.name))
    .map(dirent => dirent.name)
    .filter(name => fs.existsSync(path.join(templatePath, name, 'metadata.json')));

  if (versionDirs.length > 0) {
    return versionDirs.map(version => ({
      version,
      path: path.join(templatePath, version),
    }));
  }

  return [{ version: null, path: templatePath }];
}

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

      const requiredFields = ['id', 'name', 'description', 'category', 'tags', 'author', 'version', 'lastUpdated'];
      for (const field of requiredFields) {
        if (!metadata[field]) {
          this.log('error', `Missing required field: ${field}`, templateId);
        }
      }

      if (metadata.id !== templateId) {
        this.log('error', `ID mismatch: metadata.id (${metadata.id}) != directory name (${templateId})`, templateId);
      }

      if (metadata.category !== categoryId) {
        this.log('error', `Category mismatch: metadata.category (${metadata.category}) != parent directory (${categoryId})`, templateId);
      }

      if (!validCategories.includes(metadata.category)) {
        this.log('error', `Invalid category: ${metadata.category}`, templateId);
      }

      if (!Array.isArray(metadata.tags)) {
        this.log('error', 'Tags must be an array', templateId);
      } else if (metadata.tags.length === 0) {
        this.log('warning', 'No tags specified', templateId);
      }

      try {
        new Date(metadata.lastUpdated);
      } catch {
        this.log('error', 'Invalid lastUpdated date format', templateId);
      }

      if (!/^\d+\.\d+\.\d+$/.test(metadata.version)) {
        this.log('warning', 'Version should follow semantic versioning (x.y.z)', templateId);
      }

      if (metadata.description && metadata.description.length < 20) {
        this.log('warning', 'Description is quite short, consider adding more detail', templateId);
      }

      if (metadata.compile !== undefined) {
        if (typeof metadata.compile !== 'string') {
          this.log('error', 'compile must be a string', templateId);
        } else if (!VALID_COMPILE_VALUES.includes(metadata.compile)) {
          this.log('warning', `Unrecognized compile value: ${metadata.compile} (expected one of ${VALID_COMPILE_VALUES.join(', ')})`, templateId);
        } else if (metadata.compile === 'typst' && metadata.type !== 'typst') {
          this.log('warning', 'compile is "typst" but type is not "typst"', templateId);
        } else if (metadata.compile !== 'typst' && metadata.type === 'typst') {
          this.log('warning', `compile ("${metadata.compile}") is a LaTeX engine but type is "typst"`, templateId);
        }
      }

      if (metadata.file !== undefined) {
        if (typeof metadata.file !== 'string') {
          this.log('error', 'file must be a string', templateId);
        } else if (!metadata.file.startsWith('/')) {
          this.log('warning', 'file should be an absolute path within the project (e.g. "/main.tex")', templateId);
        }
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

      const maxSize = 50 * 1024 * 1024;
      if (stats.size > maxSize) {
        this.log('warning', `Template ZIP is quite large (${Math.round(stats.size / 1024 / 1024)}MB)`, templateId);
      }

      const buffer = fs.readFileSync(templateZipPath, null, 0, 4);
      if (buffer.length >= 4 && buffer.readUInt32LE(0) !== 0x04034b50) {
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

        const maxSize = 5 * 1024 * 1024;
        if (stats.size > maxSize) {
          this.log('warning', 'Preview image is quite large, consider optimizing', templateId);
        }

        const buffer = fs.readFileSync(previewPath, null, 0, 8);
        const pngSignature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
        if (!buffer.equals(pngSignature)) {
          this.log('warning', 'preview.png is might not be a valid PNG file', templateId);
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
    console.log('Validating TeXlyre Templates...\n');

    const validCategories = this.validateCategories();
    if (validCategories.length === 0) {
      return false;
    }

    if (!fs.existsSync(TEMPLATES_DIR)) {
      this.log('error', 'Templates directory not found');
      return false;
    }

    const categoryDirs = fs.readdirSync(TEMPLATES_DIR, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    if (categoryDirs.length === 0) {
      this.log('error', 'No template categories found');
      return false;
    }

    let totalTemplates = 0;
    let validTemplates = 0;

    for (const categoryId of categoryDirs) {
      if (!validCategories.includes(categoryId)) {
        this.log('warning', `Category directory "${categoryId}" not found in categories.yml`);
        continue;
      }

      const categoryPath = path.join(TEMPLATES_DIR, categoryId);

      const templateDirs = fs.readdirSync(categoryPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

      console.log(`\nValidating category: ${categoryId} (${templateDirs.length} templates)`);

      for (const templateId of templateDirs) {
        const templatePath = path.join(categoryPath, templateId);
        const versions = discoverTemplateVersions(templatePath);

        for (const versionInfo of versions) {
          totalTemplates++;
          const label = versionInfo.version ? `${templateId}@${versionInfo.version}` : templateId;

          console.log(`\n  ${label}`);

          if (!this.validateRequiredFiles(versionInfo.path, label)) {
            continue;
          }

          const metadata = this.validateMetadata(versionInfo.path, templateId, categoryId, validCategories);
          if (!metadata) {
            continue;
          }

          this.validateZipFile(versionInfo.path, label);
          this.validatePreviewImage(versionInfo.path, label);

          validTemplates++;
          this.log('info', 'Template validation passed', label);
        }
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('VALIDATION SUMMARY');
    console.log('='.repeat(50));
    console.log(`Total templates: ${totalTemplates}`);
    console.log(`Valid templates: ${validTemplates}`);
    console.log(`Errors: ${this.errors.length}`);
    console.log(`Warnings: ${this.warnings.length}`);

    if (this.errors.length > 0) {
      console.log('\nERRORS:');
      this.errors.forEach(error => console.log(`  • ${error}`));
    }

    if (this.warnings.length > 0) {
      console.log('\nWARNINGS:');
      this.warnings.forEach(warning => console.log(`  • ${warning}`));
    }

    const success = this.errors.length === 0;
    console.log(`\n${success ? 'All validations passed!' : 'Validation failed - please fix errors above'}`);

    return success;
  }
}

async function main() {
  const validator = new TemplateValidator();
  const success = await validator.validateAll();
  process.exit(success ? 0 : 1);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = TemplateValidator;