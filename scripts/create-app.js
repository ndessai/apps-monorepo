#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function error(message) {
  log(`❌ Error: ${message}`, 'red');
  process.exit(1);
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function info(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function warning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

// Get app name from command line arguments
const appName = process.argv[2];

if (!appName) {
  error('Please provide an app name: npm run create-app MyApp');
}

// Validate app name
if (!/^[A-Z][a-zA-Z0-9]*$/.test(appName)) {
  error(
    'App name must start with an uppercase letter and contain only alphanumeric characters (e.g., MyApp, TestApp)'
  );
}

const rootDir = process.cwd();
const appsDir = path.join(rootDir, 'apps');
const boilerplatePath = path.join(appsDir, 'BoilerplateApp');
const newAppPath = path.join(appsDir, appName);

// Check if boilerplate exists
if (!fs.existsSync(boilerplatePath)) {
  error(`BoilerplateApp not found at ${boilerplatePath}`);
}

// Check if app already exists
if (fs.existsSync(newAppPath)) {
  error(`App "${appName}" already exists at ${newAppPath}`);
}

log(`\n🚀 Creating new app: ${appName}\n`, 'bright');

// Function to copy directory recursively, excluding certain files/folders
function copyDir(src, dest, excludePatterns = []) {
  const entries = fs.readdirSync(src, { withFileTypes: true });

  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    // Check if this path should be excluded
    const shouldExclude = excludePatterns.some(pattern => {
      if (typeof pattern === 'string') {
        return entry.name === pattern;
      } else if (pattern instanceof RegExp) {
        return pattern.test(entry.name);
      }
      return false;
    });

    if (shouldExclude) {
      continue;
    }

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath, excludePatterns);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Function to replace app name in file content
function replaceInFile(filePath, replacements) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  for (const [search, replace] of Object.entries(replacements)) {
    const regex = new RegExp(search, 'g');
    if (regex.test(content)) {
      content = content.replace(regex, replace);
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
}

// Function to walk through directory and replace content
function replaceInDirectory(dir, replacements, fileExtensions = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      replaceInDirectory(fullPath, replacements, fileExtensions);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      if (fileExtensions.length === 0 || fileExtensions.includes(ext)) {
        replaceInFile(fullPath, replacements);
      }
    }
  }
}

try {
  // Step 1: Copy boilerplate directory (excluding build artifacts and docs)
  info('Copying boilerplate app...');
  const excludePatterns = [
    'node_modules',
    'ios/Pods',
    'ios/build',
    'ios/Podfile.lock',
    'android/build',
    'android/.gradle',
    'android/app/build',
    '.gradle',
    'build',
    '__tests__',
    '.DS_Store',
    // Exclude documentation files
    'IMPLEMENTATION_COMPLETE.md',
    'STRUCTURE_GUIDE.md',
    'IOS_FIX_GESTURE_HANDLER.md',
    'RUN_GUIDE.md',
    /\.log$/,
  ];

  copyDir(boilerplatePath, newAppPath, excludePatterns);
  success('Boilerplate copied successfully');

  // Step 2: Replace app name in all files
  info('Updating app name in files...');

  const replacements = {
    'BoilerplateApp': appName,
    'boilerplateapp': appName.toLowerCase(),
    'Boilerplate App': appName,
  };

  // Files to update
  const filesToUpdate = [
    'package.json',
    'app.json',
    'index.js',
    'App.tsx',
    'android/settings.gradle',
    'android/app/build.gradle',
    'android/app/src/main/AndroidManifest.xml',
    'android/app/src/main/res/values/strings.xml',
    'android/app/src/main/java/com/boilerplateapp/MainActivity.kt',
    'android/app/src/main/java/com/boilerplateapp/MainApplication.kt',
    'ios/Podfile',
  ];

  filesToUpdate.forEach(file => {
    const filePath = path.join(newAppPath, file);
    if (fs.existsSync(filePath)) {
      replaceInFile(filePath, replacements);
    }
  });

  // Replace in source files (TypeScript/JavaScript)
  replaceInDirectory(
    path.join(newAppPath, 'src'),
    replacements,
    ['.ts', '.tsx', '.js', '.jsx']
  );

  success('App name updated in all files');

  // Step 3: Rename Android package directory
  info('Renaming Android package directory...');
  const oldAndroidPackagePath = path.join(
    newAppPath,
    'android/app/src/main/java/com/boilerplateapp'
  );
  const newAndroidPackagePath = path.join(
    newAppPath,
    `android/app/src/main/java/com/${appName.toLowerCase()}`
  );

  if (fs.existsSync(oldAndroidPackagePath)) {
    // Create parent directory if needed
    const parentDir = path.dirname(newAndroidPackagePath);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }

    fs.renameSync(oldAndroidPackagePath, newAndroidPackagePath);

    // Update package names in Java/Kotlin files
    const androidFiles = [
      path.join(newAndroidPackagePath, 'MainActivity.kt'),
      path.join(newAndroidPackagePath, 'MainApplication.kt'),
    ];

    androidFiles.forEach(file => {
      if (fs.existsSync(file)) {
        replaceInFile(file, {
          'package com.boilerplateapp': `package com.${appName.toLowerCase()}`,
        });
      }
    });

    success('Android package directory renamed');
  }

  // Step 4: Rename iOS workspace and project
  info('Renaming iOS project files...');
  const iosDir = path.join(newAppPath, 'ios');

  // Rename .xcodeproj directory
  const oldXcodeproj = path.join(iosDir, 'BoilerplateApp.xcodeproj');
  const newXcodeproj = path.join(iosDir, `${appName}.xcodeproj`);
  if (fs.existsSync(oldXcodeproj)) {
    fs.renameSync(oldXcodeproj, newXcodeproj);
  }

  // Rename .xcworkspace directory
  const oldWorkspace = path.join(iosDir, 'BoilerplateApp.xcworkspace');
  const newWorkspace = path.join(iosDir, `${appName}.xcworkspace`);
  if (fs.existsSync(oldWorkspace)) {
    fs.renameSync(oldWorkspace, newWorkspace);
  }

  // Rename main iOS folder
  const oldIosFolder = path.join(iosDir, 'BoilerplateApp');
  const newIosFolder = path.join(iosDir, appName);
  if (fs.existsSync(oldIosFolder)) {
    fs.renameSync(oldIosFolder, newIosFolder);
  }

  // Update references in iOS project files
  const iosProjectFiles = [
    path.join(newXcodeproj, 'project.pbxproj'),
    path.join(iosDir, 'Podfile'),
  ];

  iosProjectFiles.forEach(file => {
    if (fs.existsSync(file)) {
      replaceInFile(file, replacements);
    }
  });

  success('iOS project files renamed');

  // Step 5: Create README for the new app
  info('Creating README...');
  const readmeContent = `# ${appName}

React Native application generated from BoilerplateApp template.

## Features

- ✅ Industry-standard folder structure
- ✅ React Query for state management
- ✅ Bottom tab navigation
- ✅ Swipeable cards with gesture handling
- ✅ TypeScript support
- ✅ React Native Paper (Material Design)
- ✅ Vector icons (19 font families)

## Getting Started

### Install Dependencies

\`\`\`bash
# From the root of the monorepo
npx yarn install
\`\`\`

### iOS Setup

\`\`\`bash
cd ios
bundle install
bundle exec pod install
cd ..
\`\`\`

### Run iOS

\`\`\`bash
npx react-native run-ios
\`\`\`

### Run Android

\`\`\`bash
npx react-native run-android
\`\`\`

## Project Structure

\`\`\`
src/
├── components/     # Reusable UI components
├── screens/        # Screen components
├── navigation/     # Navigation configuration
├── providers/      # Context providers
├── services/       # API services
├── hooks/          # Custom React hooks
├── utils/          # Utility functions
├── constants/      # App constants
├── types/          # TypeScript types
└── assets/         # Static assets
\`\`\`

## Documentation

- See \`src/README.md\` for detailed folder structure guidelines
- Check root monorepo README for overall project setup

## Tech Stack

- React Native 0.83.1
- React 19.2.0
- TypeScript 5.8.3
- React Navigation 7.x
- React Query 5.x
- React Native Paper 5.x

Generated on: ${new Date().toLocaleDateString()}
`;

  fs.writeFileSync(path.join(newAppPath, 'README.md'), readmeContent);
  success('README created');

  // Step 6: Install dependencies
  info('Installing dependencies...');
  try {
    execSync('npx yarn install', {
      cwd: rootDir,
      stdio: 'inherit',
    });
    success('Dependencies installed');
  } catch (err) {
    warning('Failed to install dependencies. Run "npx yarn install" manually.');
  }

  // Step 7: Install iOS pods
  info('Installing iOS CocoaPods...');
  try {
    const iosPodPath = path.join(newAppPath, 'ios');
    execSync('bundle install && bundle exec pod install', {
      cwd: iosPodPath,
      stdio: 'inherit',
    });
    success('iOS CocoaPods installed');
  } catch (err) {
    warning('Failed to install pods. Run "cd ios && bundle exec pod install" manually.');
  }

  // Success message
  log('\n' + '='.repeat(60), 'green');
  log(`🎉 Successfully created ${appName}!`, 'bright');
  log('='.repeat(60) + '\n', 'green');

  info('Next steps:');
  console.log(`
  1. Navigate to your new app:
     cd apps/${appName}

  2. Run on iOS:
     npx react-native run-ios

  3. Run on Android:
     npx react-native run-android

  4. Start customizing your app in src/
  `);

  info('Folder structure:');
  console.log(`
  apps/${appName}/
  ├── src/
  │   ├── components/
  │   ├── screens/
  │   ├── navigation/
  │   └── ... (and more)
  ├── ios/
  ├── android/
  └── package.json
  `);

  success('Happy coding! 🚀\n');

} catch (err) {
  error(`Failed to create app: ${err.message}`);
}
