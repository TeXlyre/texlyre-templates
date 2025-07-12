# Contributing to TeXlyre Templates

Thank you for your interest in contributing to the TeXlyre Templates collection! This guide will help you create high-quality templates that integrate with [TeXlyre](https://texlyre.github.io/texlyre/), the local-first collaborative LaTeX editor.

## Template Guidelines

### Quality Standards
- **Completeness**: Templates must compile successfully with standard LaTeX distributions
- **Documentation**: Include clear comments and documentation within the template
- **Best Practices**: Follow LaTeX conventions and clean coding principles
- **Licensing**: Only contribute templates you have legal rights to share

### Template Categories

We organize templates into these categories:

- **Academic Papers** 🎓 - Research papers, theses, dissertations
- **Presentations** 📊 - Beamer slides, conference presentations
- **Books & Reports** 📚 - Long-form documents, technical manuals
- **Letters & CVs** 💼 - Formal correspondence, resumes, cover letters
- **Articles & Journals** 📰 - Journal articles, magazine layouts
- **Posters & Flyers** 📋 - Academic posters, promotional materials

Don't see your category? [Open an issue](https://github.com/texlyre/texlyre-templates/issues) to discuss adding new categories.

## Template Structure

Each template must follow this exact structure:

```
templates/[category]/[template-id]/
├── template.zip          # Required: LaTeX project files
├── metadata.json         # Required: Template metadata
└── preview.png          # Recommended: Preview image (400x300px)
```

### Template ID Requirements
- Use lowercase letters, numbers, and hyphens only
- Be descriptive but concise (e.g., `ieee-conference-paper`, `basic-cv`)
- Must be unique within the category

## metadata.json Schema

```json
{
  "id": "template-id",
  "name": "Display Name",
  "description": "Comprehensive description of the template's purpose, features, and use cases. Should be at least 20 characters and explain what makes this template useful.",
  "category": "category-id",
  "tags": ["latex", "academic", "ieee", "conference"],
  "author": "Your Name or Organization",
  "version": "1.0.0",
  "lastUpdated": "2024-12-19T10:00:00Z"
}
```

### Field Requirements

| Field | Required | Description |
|-------|----------|-------------|
| `id` | ✅ | Must match directory name exactly |
| `name` | ✅ | Human-readable template name |
| `description` | ✅ | Detailed description (20+ characters) |
| `category` | ✅ | Must match parent directory name |
| `tags` | ✅ | Array of relevant keywords |
| `author` | ✅ | Your name or organization |
| `version` | ✅ | Semantic version (x.y.z) |
| `lastUpdated` | ✅ | ISO 8601 date string |

### Tag Guidelines
- Include relevant LaTeX packages (e.g., `tikz`, `beamer`, `memoir`)
- Add subject areas (e.g., `physics`, `computer-science`, `mathematics`)
- Include document types (e.g., `thesis`, `article`, `letter`)
- Use lowercase, descriptive terms
- Aim for 3-8 tags per template

## Creating template.zip

Your `template.zip` should contain a complete, working LaTeX project:

### Required Files
- **Main file**: Clear entry point (e.g., `main.tex`, `document.tex`)
- **Dependencies**: All custom style files, images, bibliography files
- **Documentation**: README.txt or comments explaining structure

### Best Practices
- Use relative paths for all includes and images
- Organize files in logical subdirectories (`figures/`, `sections/`, etc.)
- Include sample content that demonstrates all features
- Add clear comments explaining customizable sections
- Ensure compilation with both `pdflatex` and `xelatex` when possible

### File Organization Example
```
template.zip contents:
├── main.tex              # Main document
├── README.txt             # Usage instructions
├── sections/
│   ├── introduction.tex
│   ├── methodology.tex
│   └── conclusion.tex
├── figures/
│   └── sample-figure.pdf
├── bibliography.bib
└── custom-style.sty      # If needed
```

## Preview Images

Preview images help users quickly understand your template:

- **Format**: PNG only
- **Size**: 400x300 pixels recommended
- **Content**: Show the first page or a representative view
- **Quality**: Clear, readable text and layout
- **File size**: Keep under 500KB when possible

## Development Workflow

### 1. Setup
```bash
# Fork and clone the repository
git clone https://github.com/your-username/texlyre-templates.git
cd texlyre-templates

# Install dependencies
npm install
```

### 2. Create Your Template
```bash
# Create category directory (if new)
mkdir -p templates/academic

# Create your template directory
mkdir templates/academic/my-template

# Add your files
# - Create template.zip with your LaTeX project
# - Write metadata.json
# - Add preview.png
```

### 3. Validate Your Template
```bash
# Run validation to check your template
npm run validate

# Build and test the index
npm run build
npm run serve
```

### 4. Test Integration
1. Start local server: `npm run serve`
2. Open TeXlyre in another tab
3. Go to Import Projects → From Template Gallery
4. Change the API URL to `http://localhost:8000/api/templates.json`
5. Test importing your template

## Pre-Submission Checklist

Before submitting your pull request:

- [ ] Template compiles successfully with pdflatex/xelatex
- [ ] All required files present (`template.zip`, `metadata.json`)
- [ ] Metadata follows exact schema requirements
- [ ] Template ID matches directory name
- [ ] Category exists in `categories.yml`
- [ ] Tags are relevant and well-chosen
- [ ] Preview image shows representative output
- [ ] Validation script passes (`npm run validate`)
- [ ] Template tested in TeXlyre
- [ ] Clear commit messages describing the template

## Submission Process

### 1. Create Pull Request
- **Title**: `Add [category]: [template-name]`
- **Description**: 
  - What the template is for
  - Key features and use cases
  - Any special requirements or notes

### 2. PR Template
```markdown
## Template Information
- **Category**: Academic Papers
- **Name**: IEEE Conference Paper
- **Use Case**: Standard IEEE conference paper with proper formatting

## Features
- Automatic IEEE formatting
- Bibliography support with IEEEtran
- Sample sections and figures
- Proper paper structure

## Testing
- [x] Compiles with pdflatex
- [x] Compiles with xelatex  
- [x] Tested in TeXlyre
- [x] Validation passes

## Additional Notes
Requires IEEEtran package (included in most LaTeX distributions).
```

### 3. Review Process
- Automated validation runs on all PRs
- Manual review for quality and completeness
- Feedback and iteration if needed
- Merge and deployment to live site

## Reporting Issues

Found a problem with an existing template?

1. **Check existing issues** first
2. **Open a new issue** with:
   - Template name and category
   - Clear description of the problem
   - Steps to reproduce
   - Expected vs actual behavior

## Template Ideas

Looking for inspiration? Consider creating templates for:

- Specific journal formats (Nature, Science, ACM, etc.)
- University thesis templates
- Grant proposal formats
- Technical documentation templates
- Creative writing layouts
- Specialized academic formats

## Community

- **Discussions**: Use GitHub Discussions for questions
- **Issues**: Report bugs and request features
- **TeXlyre**: Main project at [github.com/texlyre/texlyre](https://github.com/texlyre/texlyre)

## License

By contributing templates, you agree that:
- You have the legal right to share the template
- The template can be distributed under an open license
- Users can modify and redistribute the template
- You'll specify the appropriate license in your template documentation

---

Thank you for helping build a collection of LaTeX templates for the TeXlyre community! 