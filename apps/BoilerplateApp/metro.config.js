const getMonorepoConfig = require('@monorepo/metro-config');

/**
 * Metro configuration for monorepo
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
module.exports = getMonorepoConfig(__dirname);
