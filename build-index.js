// build-index.js - Script to generate templates.json from metadata files
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const TEMPLATES_DIR = './templates';
const CATEGORIES_FILE = './categories.yml';
const OUTPUT_FILE = './api/templates.json';
const BASE_URL = 'https://texlyre.github.io/texlyre-templates';

async function buildIndex() {
  try {
    // Read categories
    const categoriesYaml = fs.readFileSync(CATEGORIES_FILE, 'utf8');
    const categoriesData = yaml.load(categoriesYaml);
    const categories = categoriesData.categories || [];

    console.log('Building templates index...');
    console.log(`Found ${categories.length} categories`);

    // Initialize categories with empty templates arrays
    const indexData = {
      lastUpdated: new Date().toISOString(),
      version: "1.0.0",
      categories: categories.map(cat => ({
        ...cat,
        templates: []
      }))
    };

    // Scan templates directory
    if (!fs.existsSync(TEMPLATES_DIR)) {
      console.error('Templates directory not found');
      process.exit(1);
    }

    const categoryDirs = fs.readdirSync(TEMPLATES_DIR, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    console.log(`Found category directories: ${categoryDirs.join(', ')}`);

    for (const categoryId of categoryDirs) {
      const categoryPath = path.join(TEMPLATES_DIR, categoryId);
      const category = indexData.categories.find(cat => cat.id === categoryId);

      if (!category) {
        console.warn(`Warning: Category '${categoryId}' not found in categories.yml`);
        continue;
      }

      // Scan templates in this category
      const templateDirs = fs.readdirSync(categoryPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

      console.log(`  Category '${categoryId}': ${templateDirs.length} templates`);

      for (const templateId of templateDirs) {
        const templatePath = path.join(categoryPath, templateId);
        const metadataPath = path.join(templatePath, 'metadata.json');

        if (!fs.existsSync(metadataPath)) {
          console.warn(`Warning: No metadata.json found for template '${templateId}'`);
          continue;
        }

        try {
          const metadataContent = fs.readFileSync(metadataPath, 'utf8');
          const metadata = JSON.parse(metadataContent);

          // Validate required fields
          if (!metadata.id || !metadata.name || !metadata.description) {
            console.warn(`Warning: Template '${templateId}' missing required fields`);
            continue;
          }

          // Ensure URLs are absolute
          const template = {
            ...metadata,
            category: categoryId,
            downloadUrl: metadata.downloadUrl || `${BASE_URL}/templates/${categoryId}/${templateId}/template.zip`,
            previewImage: metadata.previewImage ||
              (fs.existsSync(path.join(templatePath, 'preview.png'))
                ? `${BASE_URL}/templates/${categoryId}/${templateId}/preview.png`
                : undefined)
          };

          category.templates.push(template);
          console.log(`    Added template: ${template.name}`);

        } catch (error) {
          console.error(`Error parsing metadata for '${templateId}':`, error.message);
        }
      }
    }

    // Ensure api directory exists
    const apiDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(apiDir)) {
      fs.mkdirSync(apiDir, { recursive: true });
    }

    // Write the index file
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(indexData, null, 2));

    const totalTemplates = indexData.categories.reduce((sum, cat) => sum + cat.templates.length, 0);
    console.log(`\nIndex built successfully!`);
    console.log(`Total templates: ${totalTemplates}`);
    console.log(`Output: ${OUTPUT_FILE}`);

  } catch (error) {
    console.error('Error building index:', error);
    process.exit(1);
  }
}

buildIndex();