# TeXlyre Templates

A community-driven collection of LaTeX templates for [TeXlyre](https://texlyre.github.io/texlyre/), the local-first collaborative LaTeX editor.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Templates](https://img.shields.io/badge/dynamic/json?color=blue&label=templates&query=$.categories[*].templates.length&url=https%3A//texlyre.github.io/texlyre-templates/api/templates.json)](https://texlyre.github.io/texlyre-templates/)

## Browse Templates

Visit our template gallery: [https://texlyre.github.io/texlyre-templates/](https://texlyre.github.io/texlyre-templates/)

## Available Categories

- **Academic Papers** 🎓 - Research papers, theses, and academic documents
- **Presentations** 📊 - Beamer slides and presentation templates  
- **Books & Reports** 📚 - Long-form documents and technical manuals
- **Letters & CVs** 💼 - Formal correspondence and personal documents
- **Articles & Journals** 📰 - Journal articles and editorial content
- **Posters & Flyers** 📋 - Academic posters and promotional materials

## Using Templates

### In TeXlyre
1. Open [TeXlyre](https://texlyre.github.io/texlyre/)
2. Click "Import Projects" → "From Template Gallery"
3. Browse and select a template
4. Start editing immediately with full collaboration support!

### Direct Integration
Templates integrate seamlessly with TeXlyre's URL-based project creation system. Each template includes metadata for automatic project setup.

## Contributing Templates

We welcome community contributions! Help grow the template collection for the LaTeX community.

### Template Structure
```
templates/[category]/[template-id]/
├── template.zip          # Complete LaTeX project files
├── metadata.json         # Template information and metadata
└── preview.png          # Preview image (optional, 400x300px recommended)
```

### metadata.json Schema
```json
{
  "id": "unique-template-id",
  "name": "Template Display Name",
  "description": "Comprehensive description of the template's purpose and features",
  "category": "category-id",
  "tags": ["latex", "academic", "specific-features"],
  "author": "Your Name or Organization",
  "version": "1.0.0",
  "lastUpdated": "2024-12-19T10:00:00Z"
}
```

### Contribution Process
1. **Fork** this repository
2. **Create** your template following our structure guidelines
3. **Package** your LaTeX files into `template.zip` with a clear main file
4. **Write** comprehensive `metadata.json` with proper categorization
5. **Add** a preview image showing the compiled output (highly recommended)
6. **Test** locally using our build script
7. **Submit** a pull request with detailed description

### Quality Guidelines
- **Completeness**: Include all necessary files and dependencies
- **Documentation**: Add clear comments and README within template
- **Compilation**: Ensure template compiles successfully with standard LaTeX distributions
- **Licensing**: Only contribute templates you have rights to share
- **Standards**: Follow LaTeX best practices and clean code principles

## Development & Building

The template index is automatically built using GitHub Actions on every push to main.

### Local Development
```bash
# Install dependencies
npm install

# Build the template index
npm run build

# Serve locally for testing
npm run serve
# or with Python
python -m http.server 8000

# Visit http://localhost:8000
```

### Testing Your Contribution
Before submitting, test your template:
1. Ensure `template.zip` contains all necessary files
2. Verify `metadata.json` follows the schema
3. Check that preview image displays correctly
4. Run the build script to validate integration

## API Reference

Templates are available via our JSON API for programmatic access:

**Endpoint:** `https://texlyre.github.io/texlyre-templates/api/templates.json`

**Response Structure:**
```json
{
  "lastUpdated": "2024-12-19T10:00:00Z",
  "version": "1.0.0",
  "categories": [
    {
      "id": "academic",
      "name": "Academic Papers", 
      "description": "Research papers and academic documents",
      "icon": "🎓",
      "templates": [
        {
          "id": "ieee-paper",
          "name": "IEEE Conference Paper",
          "description": "Professional IEEE conference paper template...",
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

## Infrastructure

This repository uses modern web technologies:
- **GitHub Actions** for automated builds and deployment
- **GitHub Pages** for hosting the template gallery and API
- **Node.js** build system for processing templates
- **JSON API** for integration with TeXlyre and other tools

## License

Individual templates may have different licenses - check each template's metadata and included files for specific licensing information.

This repository's infrastructure and build system are licensed under the MIT License.

## Support & Community

- **Browse Templates**: [Template Gallery](https://texlyre.github.io/texlyre-templates/)
- **Use Templates**: [TeXlyre Editor](https://texlyre.github.io/texlyre/)
- **Report Issues**: [GitHub Issues](https://github.com/texlyre/texlyre-templates/issues)
- **Main Project**: [TeXlyre Repository](https://github.com/texlyre/texlyre)
- **Documentation**: [TeXlyre Docs](https://texlyre.github.io/texlyre/docs) - *coming soon*

## Acknowledgments

Built for the [TeXlyre](https://texlyre.github.io/texlyre/) community - enabling local-first, real-time collaborative LaTeX editing with template support.

---

**Ready to contribute?** Check our [contribution guidelines](CONTRIBUTING.md) or browse existing templates for inspiration!