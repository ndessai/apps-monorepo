# Documentation Index

Complete documentation for the React Native Turbo Monorepo project, organized by category.

## 📁 Documentation Structure

```
docs/
├── README.md (this file)
├── DOCUMENTATION_ORGANIZATION.md  # Organization guidelines
├── product/          # Product features and guides (8 files)
├── setup/            # Environment setup and configuration (6 files)
└── bugfixes/         # Bug fix documentation (4 files)
```

**Total**: 19 documentation files organized by category

See [DOCUMENTATION_ORGANIZATION.md](DOCUMENTATION_ORGANIZATION.md) for organization guidelines and rules.

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

### [E2E_TESTING_GUIDE.md](product/E2E_TESTING_GUIDE.md)
Complete guide for end-to-end testing with Detox framework.

**Topics covered:**
- Detox setup and configuration
- Running iOS and Android tests
- Writing E2E tests
- Test IDs and best practices
- Troubleshooting
- CI/CD integration

**For:** Implementing and running E2E tests

---

### [E2E_TESTING_COMPLETE.md](product/E2E_TESTING_COMPLETE.md)
Complete implementation summary of E2E testing with Detox.

**Topics covered:**
- What was implemented
- Test infrastructure details
- Test IDs and coverage
- Configuration details
- Best practices implemented
- Integration with app generator

**For:** Understanding the E2E testing implementation

---

### [STRUCTURE_GUIDE.md](product/STRUCTURE_GUIDE.md)
BoilerplateApp folder structure and organization guide.

**Topics covered:**
- Industry-standard folder structure
- Component organization
- Screen structure
- Navigation setup
- State management
- Best practices

**For:** Understanding the app architecture

---

### [BOILERPLATE_IMPLEMENTATION.md](product/BOILERPLATE_IMPLEMENTATION.md)
Complete implementation details of BoilerplateApp features.

**Topics covered:**
- Features implemented
- React Query setup
- Navigation configuration
- Swipeable cards
- Component structure

**For:** Understanding what's included in BoilerplateApp

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

### [E2E_MONOREPO_SETUP.md](setup/E2E_MONOREPO_SETUP.md)
E2E testing configuration for Yarn Workspaces monorepo.

**Topics covered:**
- Monorepo hoisting explanation
- Detox CLI configuration
- Why special setup is needed
- Alternative approaches
- Troubleshooting monorepo issues
- CI/CD considerations

**For:** Understanding E2E testing in monorepo context

---

### [DETOX_SIMULATOR_FIX.md](setup/DETOX_SIMULATOR_FIX.md)
Fix for Detox iOS simulator configuration issues.

**Topics covered:**
- Simulator configuration problem
- Finding available simulators
- Updating configuration
- Common simulators by Xcode version
- Quick reference commands

**For:** Fixing simulator-related E2E testing errors

---

### [RUN_GUIDE.md](setup/RUN_GUIDE.md)
Step-by-step guide for running the app.

**Topics covered:**
- Running on iOS
- Running on Android
- Starting Metro bundler
- Development workflow

**For:** Day-to-day development tasks

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

### [IOS_FIX_GESTURE_HANDLER.md](bugfixes/IOS_FIX_GESTURE_HANDLER.md)
iOS gesture handler codegen fix documentation.

**Topics covered:**
- Gesture handler error details
- Root cause analysis
- Fix implementation (pod install)
- Verification steps

**For:** Understanding the gesture handler fix

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

**...set up E2E testing**
→ [E2E_TESTING_GUIDE.md](product/E2E_TESTING_GUIDE.md)

**...write E2E tests**
→ [E2E_TESTING_GUIDE.md](product/E2E_TESTING_GUIDE.md)

**...fix simulator errors**
→ [DETOX_SIMULATOR_FIX.md](setup/DETOX_SIMULATOR_FIX.md)

**...understand the folder structure**
→ [STRUCTURE_GUIDE.md](product/STRUCTURE_GUIDE.md)

**...see what's in BoilerplateApp**
→ [BOILERPLATE_IMPLEMENTATION.md](product/BOILERPLATE_IMPLEMENTATION.md)

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
