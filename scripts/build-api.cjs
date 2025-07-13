// scripts/build-api.cjs
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const TEMPLATES_DIR = './templates';
const CATEGORIES_FILE = './categories.yml';
const OUTPUT_FILE = './api/templates.json';
const BASE_URL = 'https://texlyre.github.io/texlyre-templates';

function loadCategories() {
  if (!fs.existsSync(CATEGORIES_FILE)) {
    console.error(`Categories file not found: ${CATEGORIES_FILE}`);
    console.log('Creating default categories.yml...');

    const defaultCategories = {
      categories: [
        {
          id: 'academic',
          name: 'Academic Papers',
          description: 'Research papers, theses, and academic documents'
        },
        {
          id: 'presentations',
          name: 'Presentations',
          description: 'Slides and presentation templates for conferences and meetings'
        }
      ]
    };

    fs.writeFileSync(CATEGORIES_FILE, yaml.dump(defaultCategories));
    console.log('Created default categories.yml');
  }

  try {
    const categoriesYaml = fs.readFileSync(CATEGORIES_FILE, 'utf8');
    const categoriesData = yaml.load(categoriesYaml);

    if (!categoriesData || !categoriesData.categories || !Array.isArray(categoriesData.categories)) {
      throw new Error('Invalid categories.yml structure. Expected { categories: [...] }');
    }

    // Validate category structure
    for (const category of categoriesData.categories) {
      if (!category.id || !category.name || !category.description) {
        throw new Error(`Invalid category structure. Each category must have id, name, and description: ${JSON.stringify(category)}`);
      }
    }

    return categoriesData.categories;
  } catch (error) {
    console.error(`Error reading categories.yml: ${error.message}`);
    process.exit(1);
  }
}

function discoverTemplateCategories() {
  if (!fs.existsSync(TEMPLATES_DIR)) {
    return [];
  }

  return fs.readdirSync(TEMPLATES_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
}

async function buildApi() {
  console.log('Building templates API...');

  try {
    const categories = loadCategories();
    const discoveredCategories = discoverTemplateCategories();

    console.log(`Configured categories: ${categories.map(c => c.id).join(', ')}`);
    console.log(`Discovered category directories: ${discoveredCategories.join(', ')}`);

    // Warn about mismatches
    const configuredIds = new Set(categories.map(c => c.id));
    const undefinedDirs = discoveredCategories.filter(dir => !configuredIds.has(dir));
    const missingDirs = categories.filter(cat => !discoveredCategories.includes(cat.id));

    if (undefinedDirs.length > 0) {
      console.warn(`Warning: Template directories found without category definition: ${undefinedDirs.join(', ')}`);
      console.warn('Add these categories to categories.yml or remove the directories.');
    }

    if (missingDirs.length > 0) {
      console.warn(`Warning: Categories defined but no template directories found: ${missingDirs.map(c => c.id).join(', ')}`);
    }

    const apiData = {
      lastUpdated: new Date().toISOString(),
      version: "1.0.0",
      categories: categories.map(cat => ({
        ...cat,
        templates: []
      }))
    };

    for (const categoryId of discoveredCategories) {
      const category = apiData.categories.find(cat => cat.id === categoryId);

      if (!category) {
        console.warn(`Skipping category '${categoryId}' - not defined in categories.yml`);
        continue;
      }

      const categoryPath = path.join(TEMPLATES_DIR, categoryId);
      const templateDirs = fs.readdirSync(categoryPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

      console.log(`Processing category '${categoryId}': ${templateDirs.length} templates`);

      for (const templateId of templateDirs) {
        const templatePath = path.join(categoryPath, templateId);
        const metadataPath = path.join(templatePath, 'metadata.json');

        if (!fs.existsSync(metadataPath)) {
          console.warn(`  No metadata.json found for template '${templateId}'`);
          continue;
        }

        try {
          const metadataContent = fs.readFileSync(metadataPath, 'utf8');
          const metadata = JSON.parse(metadataContent);

          if (!metadata.id || !metadata.name || !metadata.description) {
            console.warn(`  Template '${templateId}' missing required fields`);
            continue;
          }

          if (metadata.id !== templateId) {
            console.warn(`  Template ID mismatch: ${metadata.id} != ${templateId}`);
          }

          if (metadata.category !== categoryId) {
            console.warn(`  Template category mismatch: ${metadata.category} != ${categoryId}`);
          }

          const template = {
            ...metadata,
            category: categoryId, // Ensure consistency
            downloadUrl: metadata.downloadUrl || `${BASE_URL}/templates/${categoryId}/${templateId}/template.zip`,
            previewImage: metadata.previewImage ||
              (fs.existsSync(path.join(templatePath, 'preview.png'))
                ? `${BASE_URL}/templates/${categoryId}/${templateId}/preview.png`
                : undefined)
          };

          category.templates.push(template);
          console.log(`  ✓ Added template: ${template.name}`);

        } catch (error) {
          console.error(`  Error parsing metadata for '${templateId}': ${error.message}`);
        }
      }
    }

    // Create output directory
    const apiDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(apiDir)) {
      fs.mkdirSync(apiDir, { recursive: true });
    }

    // Write API file
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(apiData, null, 2));

    // Statistics
    const totalTemplates = apiData.categories.reduce((sum, cat) => sum + cat.templates.length, 0);
    const categoriesWithTemplates = apiData.categories.filter(cat => cat.templates.length > 0).length;

    console.log('\n' + '='.repeat(50));
    console.log('API BUILD SUMMARY');
    console.log('='.repeat(50));
    console.log(`Total templates: ${totalTemplates}`);
    console.log(`Active categories: ${categoriesWithTemplates}/${apiData.categories.length}`);
    console.log(`Output: ${OUTPUT_FILE}`);

    if (totalTemplates === 0) {
      console.warn('\nWarning: No templates were processed. Check your templates directory structure.');
    }

  } catch (error) {
    console.error('Error building API:', error);
    process.exit(1);
  }
}

buildApi();