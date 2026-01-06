# Documentation Organization

This document outlines the organization structure of all documentation in this repository.

## 📁 Structure

All documentation is organized in the `docs/` folder:

```
docs/
├── README.md                     # Documentation index and navigation
├── product/                      # Product features and guides
├── setup/                        # Environment setup and configuration
└── bugfixes/                     # Bug fix documentation
```

## 📂 Folder Categories

### Product & Features (`docs/product/`)

Documentation about product features, architecture, and usage guides.

**Files:**
- `CREATE_APP_GUIDE.md` - App generator usage guide
- `APP_GENERATOR_COMPLETE.md` - App generator implementation details
- `E2E_TESTING_GUIDE.md` - E2E testing guide for users
- `E2E_TESTING_COMPLETE.md` - E2E testing implementation summary
- `STRUCTURE_GUIDE.md` - Folder structure and architecture
- `BOILERPLATE_IMPLEMENTATION.md` - BoilerplateApp features
- `QUICK_REFERENCE.md` - Quick command reference
- `CURRENT_STATUS.md` - Project status

### Setup & Environment (`docs/setup/`)

Documentation for environment setup, configuration, and development workflow.

**Files:**
- `QUICK_START.md` - Quick setup guide
- `TROUBLESHOOTING.md` - Common issues and solutions
- `REBUILD_INSTRUCTIONS.md` - Clean rebuild steps
- `RUN_GUIDE.md` - Running the app
- `E2E_MONOREPO_SETUP.md` - E2E testing in monorepo
- `DETOX_SIMULATOR_FIX.md` - Simulator configuration fix

### Bug Fixes (`docs/bugfixes/`)

Documentation of bugs encountered and fixes applied.

**Files:**
- `FINAL_FIX.md` - Vector icons fix
- `ICON_FIX_COMPLETE.md` - Detailed icon fix
- `FIXES_APPLIED.md` - All fixes summary
- `IOS_FIX_GESTURE_HANDLER.md` - Gesture handler fix

## 🗂️ App-Specific Documentation

Some documentation stays in the app folder for app-specific context:

### BoilerplateApp (`apps/BoilerplateApp/`)

**Files that stay in app:**
- `README.md` - App-specific README
- `E2E_TESTING.md` - Detailed E2E testing guide for this app
- `DETOX_SIMULATOR_SETUP.md` - Simulator configuration guide
- `src/README.md` - Source folder structure guide

**Why these stay here:**
- They're specific to this app's implementation
- They're reference material for developers working in this app
- They get copied when creating new apps
- They provide context within the app directory

## 📜 Documentation Guidelines

### Creating New Documentation

**Product/Feature Documentation:**
- Goes in `docs/product/`
- Includes: guides, architecture, features, implementation details

**Setup/Configuration Documentation:**
- Goes in `docs/setup/`
- Includes: installation, configuration, environment, troubleshooting

**Bug Fix Documentation:**
- Goes in `docs/bugfixes/`
- Includes: bug descriptions, root causes, fixes, verification

### Naming Conventions

- Use `SCREAMING_SNAKE_CASE.md` for documentation files
- Be descriptive: `E2E_TESTING_GUIDE.md` not `TESTING.md`
- Use prefixes for related docs: `E2E_TESTING_*`, `IOS_FIX_*`

### Updating the Index

When adding new documentation:

1. **Add to `docs/README.md`** in appropriate section
2. **Add to "I want to..." navigation** if user-facing
3. **Update any related documentation** with links
4. **Keep root `README.md` updated** for major additions

## 🔗 Link Structure

### Internal Links

When linking between documentation files:

**From docs/product/ to docs/setup/**:
```markdown
[Setup Guide](../setup/QUICK_START.md)
```

**From docs/README.md to any subfolder**:
```markdown
[Guide](product/GUIDE.md)
```

**From app to docs**:
```markdown
[Guide](../../docs/product/GUIDE.md)
```

**From root to docs**:
```markdown
[Guide](docs/product/GUIDE.md)
```

### External Links

Always use full paths for external resources.

## 📊 Current Statistics

**Total Documentation Files**: 19

**By Category:**
- Product & Features: 8 files
- Setup & Environment: 6 files
- Bug Fixes: 4 files
- Index: 1 file (README.md)

**App-Specific Documentation**: 4 files (in BoilerplateApp)

## 🎯 Benefits of Organization

### 1. Easy Navigation
- Clear categorization
- Comprehensive index
- "I want to..." quick navigation

### 2. Maintainability
- Logical grouping
- Easy to find and update
- Consistent structure

### 3. Scalability
- Can add more categories as needed
- Clear pattern to follow
- Won't become cluttered

### 4. Developer Experience
- Quick access to information
- Clear documentation hierarchy
- Intuitive organization

## 🔄 Maintenance

### Regular Tasks

**When Adding Features:**
1. Create documentation in appropriate folder
2. Update `docs/README.md`
3. Update main `README.md` if significant
4. Add to navigation if user-facing

**When Fixing Bugs:**
1. Document in `docs/bugfixes/`
2. Link from troubleshooting if relevant
3. Update related setup docs

**When Changing Setup:**
1. Update appropriate setup doc
2. Update troubleshooting if needed
3. Update quick start if major change

### Quarterly Review

- Remove outdated documentation
- Update links and references
- Consolidate duplicate information
- Update statistics in this file

## 📝 Example Workflow

### Adding New Feature Documentation

```bash
# 1. Create the documentation
vim docs/product/NEW_FEATURE.md

# 2. Update the index
vim docs/README.md
# Add entry in Product & Features section

# 3. Add to navigation (if user-facing)
# Add to "I want to..." section

# 4. Update main README if major feature
vim README.md
```

### Moving Documentation

```bash
# Don't do this manually - use this as reference
# 1. Move file to appropriate folder
mv ROOT_DOC.md docs/setup/

# 2. Update all references
grep -r "ROOT_DOC.md" docs/
# Update all found references

# 3. Update docs/README.md
# Add or update entry for moved file
```

## ✅ Current State

**Organization Status**: ✅ **COMPLETE**

All documentation is properly organized:
- ✅ All files in appropriate folders
- ✅ Index updated (`docs/README.md`)
- ✅ Navigation updated
- ✅ Links verified
- ✅ Root directory clean (only README.md)

## 🎯 Future Improvements

Potential enhancements:
- Add API documentation folder if needed
- Create architecture diagrams folder
- Add changelog documentation
- Create contributor guidelines
- Add deployment documentation

---

**Last Updated**: 2026-01-06

**Organization Rule**: All documentation goes in `docs/` folder with appropriate categorization. Only `README.md` and app-specific guides stay outside this structure.
