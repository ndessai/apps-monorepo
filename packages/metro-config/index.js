const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration for monorepo
 * https://reactnative.dev/docs/metro
 */
const getMonorepoConfig = (projectRoot) => {
  const workspaceRoot = path.resolve(projectRoot, '../..');

  const defaultConfig = getDefaultConfig(projectRoot);

  const config = {
    watchFolders: [workspaceRoot],
    resolver: {
      nodeModulesPaths: [
        path.resolve(projectRoot, 'node_modules'),
        path.resolve(workspaceRoot, 'node_modules'),
      ],
      // Enable symlinks for workspace packages
      unstable_enableSymlinks: true,
    },
  };

  return mergeConfig(defaultConfig, config);
};

module.exports = getMonorepoConfig;
