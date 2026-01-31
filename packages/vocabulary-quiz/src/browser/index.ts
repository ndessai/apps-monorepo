/**
 * Etymology Browser Exports
 */

// Root Explorer
export {
  exploreRoot,
  searchRoots,
  getRootsByLanguage,
  getAllAvailableRoots,
  getRootsByFirstLetter,
  getMostProductiveRoots,
  getRootDatabaseStats,
} from './root-explorer';

export type {
  RootWithWords,
  RootExplorationResult,
} from './root-explorer';

// Word Family
export {
  getWordFamily,
  getAllWordFamilies,
  findConnectionPath,
  getBridgeWords,
} from './word-family';

export type {
  ConnectionType,
  WordConnection,
  WordFamilyResult,
} from './word-family';

// Etymology Graph
export {
  buildEtymologyGraph,
  getRootSubgraph,
  getWordSubgraph,
  exportGraphForVisualization,
} from './etymology-graph';

export type {
  NodeType,
  EtymologyNode,
  EdgeType,
  EtymologyEdge,
  EtymologyGraph,
} from './etymology-graph';
