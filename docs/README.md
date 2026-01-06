# Documentation Index

Complete documentation for the React Native Turbo Monorepo project, organized by category.

## 📁 Documentation Structure

```
docs/
├── README.md (this file)
├── product/          # Product features and guides
├── setup/            # Environment setup and configuration
└── bugfixes/         # Bug fix documentation
```

---

## 🎯 Product & Features

Core product documentation, feature guides, and usage instructions.

### [CREATE_APP_GUIDE.md](product/CREATE_APP_GUIDE.md)
Complete guide for using the `create-app` command to generate new React Native apps from the BoilerplateApp template.

**Topics covered:**
- App name rules and validation
- What gets created automatically
- Directory structure
- Customization after creation
- Troubleshooting app generation
- Best practices

**Quick command:** `npm run create-app YourAppName`

---

### [APP_GENERATOR_COMPLETE.md](product/APP_GENERATOR_COMPLETE.md)
Technical implementation details of the app generator system.

**Topics covered:**
- Generator script implementation
- Automated name replacement
- Directory renaming logic
- Dependency installation
- Script execution flow
- File exclusion patterns

**For:** Understanding how the generator works internally

---

### [QUICK_REFERENCE.md](product/QUICK_REFERENCE.md)
Quick command reference card for common tasks.

**Topics covered:**
- Creating new apps
- Common commands
- File structure overview
- Quick troubleshooting
- Tech stack summary

**For:** Quick lookups during development

---

### [CURRENT_STATUS.md](product/CURRENT_STATUS.md)
Current project status and overview.

**Topics covered:**
- Project state
- Completed features
- Known issues (if any)
- Recent changes

**For:** Understanding current project state

---

## 🛠️ Setup & Environment

Environment setup, configuration, and troubleshooting guides.

### [QUICK_START.md](setup/QUICK_START.md)
Quick setup guide to get started immediately.

**Topics covered:**
- Prerequisites
- Installation steps
- iOS and Android setup
- Running the app
- First steps

**For:** New developers getting started

---

### [TROUBLESHOOTING.md](setup/TROUBLESHOOTING.md)
Comprehensive troubleshooting guide for common issues.

**Topics covered:**
- iOS pod installation issues
- Android build failures
- Metro bundler problems
- Module resolution errors
- Platform-specific issues
- JDK/Ruby version problems

**For:** Resolving build and runtime issues

---

### [REBUILD_INSTRUCTIONS.md](setup/REBUILD_INSTRUCTIONS.md)
Instructions for rebuilding the project from scratch.

**Topics covered:**
- Clean build steps
- Dependency reinstallation
- iOS pod reinstall
- Android clean build
- Cache clearing

**For:** When you need a fresh build

---

## 🐛 Bug Fixes

Documentation of bugs that were encountered and fixed during development.

### [FINAL_FIX.md](bugfixes/FINAL_FIX.md)
Complete documentation of the vector icons fix.

**Topics covered:**
- Vector icons not displaying
- iOS font integration
- Android font configuration
- react-native-asset usage
- Final solution

**For:** Understanding the vector icons integration

---

### [ICON_FIX_COMPLETE.md](bugfixes/ICON_FIX_COMPLETE.md)
Detailed documentation of the icon fix implementation.

**Topics covered:**
- Multiple commands produce error
- Font file duplication
- Xcode project cleanup
- CocoaPods integration
- Verification steps

**For:** Deep dive into iOS icon fix

---

### [FIXES_APPLIED.md](bugfixes/FIXES_APPLIED.md)
Summary of all fixes applied to the project.

**Topics covered:**
- Ruby 3.4 compatibility issues
- JDK 25 CMake restrictions
- iOS gesture handler codegen
- Vector icons configuration
- All platform-specific fixes

**For:** Historical record of fixes

---

## 🚀 Quick Navigation

### I want to...

**...create a new app**
→ [CREATE_APP_GUIDE.md](product/CREATE_APP_GUIDE.md)

**...set up my environment**
→ [QUICK_START.md](setup/QUICK_START.md)

**...fix a build error**
→ [TROUBLESHOOTING.md](setup/TROUBLESHOOTING.md)

**...understand how the generator works**
→ [APP_GENERATOR_COMPLETE.md](product/APP_GENERATOR_COMPLETE.md)

**...look up a command quickly**
→ [QUICK_REFERENCE.md](product/QUICK_REFERENCE.md)

**...clean and rebuild**
→ [REBUILD_INSTRUCTIONS.md](setup/REBUILD_INSTRUCTIONS.md)

**...see what bugs were fixed**
→ [FIXES_APPLIED.md](bugfixes/FIXES_APPLIED.md)

---

## 📚 Additional Resources

- **Root README**: [../../README.md](../../README.md) - Main project README
- **BoilerplateApp Structure**: [../../apps/BoilerplateApp/src/README.md](../../apps/BoilerplateApp/src/README.md) - Folder structure guide

---

## 📝 Documentation Guidelines

When creating new documentation:

1. **Product/Features** (`docs/product/`)
   - Feature guides
   - Usage instructions
   - Implementation details
   - Best practices

2. **Setup/Environment** (`docs/setup/`)
   - Installation guides
   - Configuration steps
   - Environment setup
   - Troubleshooting

3. **Bug Fixes** (`docs/bugfixes/`)
   - Bug descriptions
   - Root cause analysis
   - Fix implementation
   - Verification steps

---

**Last Updated**: 2026-01-06
