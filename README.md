# TeXlyre Templates

LaTeX templates for [TeXlyre](https://texlyre.github.io/texlyre/), the local-first collaborative LaTeX editor.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://badge.fury.io/js/texlyre-templates.svg)](https://badge.fury.io/js/texlyre-templates)

## Features

- Community-driven LaTeX template collection
- Type-safe JavaScript/TypeScript API
- Integration with TeXlyre collaborative editor
- Searchable templates by tags, categories, and content
- Easy template import and download
- Standardized metadata and validation

## Installation

```bash
npm install texlyre-templates
```

## Usage

### JavaScript/TypeScript

```javascript
import { templatesApi } from 'texlyre-templates';

// Get all templates
const api = await templatesApi.getTemplates();

// Search templates
const results = await templatesApi.searchTemplates('ieee');

// Get templates by category
const papers = await templatesApi.getTemplatesByCategory('academic');

// Download a template
const blob = await templatesApi.downloadTemplate(template);
```

### Configuration Options

You can configure the API client by passing options:

```javascript
import { TemplatesApiClient } from 'texlyre-templates';

// With custom base URL
const client = new TemplatesApiClient('https://my-custom-url.com');

// Clear cache when needed
templatesApi.clearCache();
```

## API Reference

### templatesApi

The main API client instance with preconfigured settings.

```javascript
import { templatesApi } from 'texlyre-templates';

// Get all templates with metadata
const api = await templatesApi.getTemplates();

// Search by query string
const results = await templatesApi.searchTemplates('conference');

// Filter by category
const academic = await templatesApi.getTemplatesByCategory('academic');

// Get available categories
const categories = await templatesApi.getCategories();

// Download template as blob
const blob = await templatesApi.downloadTemplate(template);
```

### TemplatesApiClient

```javascript
import { TemplatesApiClient } from 'texlyre-templates';

const client = new TemplatesApiClient(baseUrl?);
```

**Methods:**
- `getTemplates(useCache?)`: Get all templates with metadata
- `searchTemplates(query)`: Search templates by name, description, tags, or author
- `getTemplatesByCategory(categoryId)`: Get templates for specific category
- `getCategories()`: Get available categories
- `downloadTemplate(template)`: Download template as Blob
- `clearCache()`: Clear internal cache

### Template Object

```typescript
interface Template {
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
}
```

### Utility Functions

```javascript
import { 
  validateTemplateMetadata, 
  createTemplateUrl, 
  formatFileSize,
  sanitizeTemplateId,
  generateTemplateMetadata 
} from 'texlyre-templates';

// Validate template metadata
const metadata = validateTemplateMetadata(rawData);

// Generate template URLs
const url = createTemplateUrl(baseUrl, categoryId, templateId, 'template.zip');

// Format file sizes
const size = formatFileSize(1024); // "1.0 KB"

// Sanitize template IDs
const id = sanitizeTemplateId('My Template Name!'); // "my-template-name"

// Generate metadata
const metadata = generateTemplateMetadata(
  'my-template',
  'My Template',
  'A great template for academic papers',
  'academic',
  'John Doe',
  ['latex', 'academic', 'ieee']
);
```

## Template Categories

- **Academic Papers** - Research papers, theses, and academic documents
- **Presentations** - Slides and presentation templates for conferences
- **Books & Reports** - Book layouts, technical manuals, and long-form documents
- **Letters & CVs** - Formal letters, resumes, and personal documents
- **Articles & Journals** - Journal articles, magazine layouts, and editorial content
- **Posters & Flyers** - Academic posters and promotional materials

## Direct API Access

```javascript
// Fetch templates directly without the client
const response = await fetch('https://texlyre.github.io/texlyre-templates/api/templates.json');
const data = await response.json();
```

**API Response Structure:**
```json
{
  "lastUpdated": "2024-12-19T10:00:00Z",
  "version": "1.0.0",
  "categories": [
    {
      "id": "academic",
      "name": "Academic Papers", 
      "description": "Research papers and academic documents",
      "templates": [
        {
          "id": "ieee-paper",
          "name": "IEEE Conference Paper",
          "description": "Professional IEEE conference paper template",
          "category": "academic",
          "tags": ["ieee", "conference", "bibliography"],
          "downloadUrl": "https://texlyre.github.io/texlyre-templates/templates/academic/ieee-paper/template.zip",
          "previewImage": "https://texlyre.github.io/texlyre-templates/templates/academic/ieee-paper/preview.png",
          "author": "TeXlyre Community",
          "version": "1.0.0",
          "lastUpdated": "2024-12-19T10:00:00Z"
        }
      ]
    }
  ]
}
```

## Building from Source

```bash
git clone https://github.com/texlyre/texlyre-templates.git
cd texlyre-templates
npm install
npm run build
```

## Examples

### Regular Example

To run the webpack-bundled example locally:

```bash
npm install
npm run build:webpack-example
npm run webpack-example
```

Then open `http://localhost:3000` in your browser.

### GitHub Pages Example

To run the GitHub Pages example locally, which is also deployed to the demo site:

```bash
npm install
npm run build:pages-example
npm run pages-example
```

This will also run on `http://localhost:3000` in your browser.

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on:

- Adding new templates
- Template structure requirements
- Validation and testing
- Submission process

## Template Structure

Each template follows this standardized structure:

```
templates/[category]/[template-id]/
├── template.zip          # Complete LaTeX project files
├── metadata.json         # Template information and metadata
└── preview.png          # Preview image (recommended, 400x300px)
```

## Development Scripts

```bash
# Build the library
npm run build

# Build the API from templates
npm run build:api

# Validate all templates
npm run validate

# Clean build outputs
npm run clean
```

## License

Individual templates may have different licenses - check each template's metadata and included files for specific licensing information.

This repository's infrastructure and build system are licensed under the MIT License.

## Support

- **Browse Templates**: [Template Gallery](https://texlyre.github.io/texlyre-templates/)
- **Use Templates**: [TeXlyre Editor](https://texlyre.github.io/texlyre/)
- **Report Issues**: [GitHub Issues](https://github.com/texlyre/texlyre-templates/issues)
- **Main Project**: [TeXlyre Repository](https://github.com/texlyre/texlyre)

---

Built for the [TeXlyre](https://texlyre.github.io/texlyre/) community - enabling local-first, real-time collaborative LaTeX editing with template support.