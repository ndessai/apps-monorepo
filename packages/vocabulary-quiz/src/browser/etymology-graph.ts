/**
 * Etymology Graph
 * Visualizable graph structure for root → word relationships
 */

import type { RootInfo, VocabularyWord, PrefixInfo, SuffixInfo } from '../types';
import { getAllRoots, PREFIXES, SUFFIXES } from '../data/roots';
import { getAllWords } from '../data/words';

/** Node types in the etymology graph */
export type NodeType = 'root' | 'prefix' | 'suffix' | 'word';

/** Graph node */
export interface EtymologyNode {
  id: string;
  type: NodeType;
  label: string;
  data: RootInfo | PrefixInfo | SuffixInfo | VocabularyWord;
  language?: string;
  meaning?: string;
}

/** Edge types in the etymology graph */
export type EdgeType =
  | 'has_root'      // Word has this root
  | 'has_prefix'    // Word has this prefix
  | 'has_suffix'    // Word has this suffix
  | 'related_root'  // Roots are related
  | 'synonym'       // Words are synonyms
  | 'antonym';      // Words are antonyms

/** Graph edge */
export interface EtymologyEdge {
  id: string;
  source: string;
  target: string;
  type: EdgeType;
  weight: number;
  label?: string;
}

/** Complete etymology graph */
export interface EtymologyGraph {
  nodes: EtymologyNode[];
  edges: EtymologyEdge[];
  metadata: {
    totalNodes: number;
    totalEdges: number;
    nodesByType: Record<NodeType, number>;
    edgesByType: Record<EdgeType, number>;
  };
}

/** Build the complete etymology graph */
export function buildEtymologyGraph(): EtymologyGraph {
  const nodes: EtymologyNode[] = [];
  const edges: EtymologyEdge[] = [];
  const nodeIds = new Set<string>();

  // Add all roots as nodes
  const allRoots = getAllRoots();
  for (const root of allRoots) {
    const nodeId = `root-${root.id}`;
    if (!nodeIds.has(nodeId)) {
      nodes.push({
        id: nodeId,
        type: 'root',
        label: root.root,
        data: root,
        language: root.language,
        meaning: root.meaning,
      });
      nodeIds.add(nodeId);
    }
  }

  // Add all prefixes as nodes
  for (const prefix of PREFIXES) {
    const nodeId = `prefix-${prefix.id}`;
    if (!nodeIds.has(nodeId)) {
      nodes.push({
        id: nodeId,
        type: 'prefix',
        label: prefix.prefix,
        data: prefix,
        language: prefix.language,
        meaning: prefix.meaning,
      });
      nodeIds.add(nodeId);
    }
  }

  // Add all suffixes as nodes
  for (const suffix of SUFFIXES) {
    const nodeId = `suffix-${suffix.id}`;
    if (!nodeIds.has(nodeId)) {
      nodes.push({
        id: nodeId,
        type: 'suffix',
        label: suffix.suffix,
        data: suffix,
        language: suffix.language,
        meaning: suffix.meaning,
      });
      nodeIds.add(nodeId);
    }
  }

  // Add all words as nodes and create edges
  const allWords = getAllWords();
  for (const word of allWords) {
    const wordNodeId = `word-${word.id}`;

    // Add word node
    nodes.push({
      id: wordNodeId,
      type: 'word',
      label: word.word,
      data: word,
    });
    nodeIds.add(wordNodeId);

    // Create edges to roots
    for (const root of word.etymology.roots) {
      const rootNodeId = `root-${root.id}`;
      if (nodeIds.has(rootNodeId)) {
        edges.push({
          id: `edge-${wordNodeId}-${rootNodeId}`,
          source: wordNodeId,
          target: rootNodeId,
          type: 'has_root',
          weight: 1.0,
          label: 'derived from',
        });
      }
    }

    // Create edge to prefix
    if (word.etymology.prefix) {
      const prefixNodeId = `prefix-${word.etymology.prefix.id}`;
      if (nodeIds.has(prefixNodeId)) {
        edges.push({
          id: `edge-${wordNodeId}-${prefixNodeId}`,
          source: wordNodeId,
          target: prefixNodeId,
          type: 'has_prefix',
          weight: 0.7,
          label: 'uses prefix',
        });
      }
    }

    // Create edge to suffix
    if (word.etymology.suffix) {
      const suffixNodeId = `suffix-${word.etymology.suffix.id}`;
      if (nodeIds.has(suffixNodeId)) {
        edges.push({
          id: `edge-${wordNodeId}-${suffixNodeId}`,
          source: wordNodeId,
          target: suffixNodeId,
          type: 'has_suffix',
          weight: 0.7,
          label: 'uses suffix',
        });
      }
    }
  }

  // Create synonym and antonym edges
  for (const word of allWords) {
    const wordNodeId = `word-${word.id}`;

    // Synonym edges
    for (const synonym of word.synonyms) {
      const synonymWord = allWords.find(w =>
        w.word.toLowerCase() === synonym.toLowerCase() && w.id !== word.id
      );
      if (synonymWord) {
        const synonymNodeId = `word-${synonymWord.id}`;
        const edgeId = `edge-syn-${word.id}-${synonymWord.id}`;
        // Avoid duplicate edges
        if (!edges.some(e => e.id === edgeId || e.id === `edge-syn-${synonymWord.id}-${word.id}`)) {
          edges.push({
            id: edgeId,
            source: wordNodeId,
            target: synonymNodeId,
            type: 'synonym',
            weight: 0.5,
            label: 'synonym',
          });
        }
      }
    }

    // Antonym edges
    if (word.antonyms) {
      for (const antonym of word.antonyms) {
        const antonymWord = allWords.find(w =>
          w.word.toLowerCase() === antonym.toLowerCase() && w.id !== word.id
        );
        if (antonymWord) {
          const antonymNodeId = `word-${antonymWord.id}`;
          const edgeId = `edge-ant-${word.id}-${antonymWord.id}`;
          if (!edges.some(e => e.id === edgeId || e.id === `edge-ant-${antonymWord.id}-${word.id}`)) {
            edges.push({
              id: edgeId,
              source: wordNodeId,
              target: antonymNodeId,
              type: 'antonym',
              weight: 0.4,
              label: 'antonym',
            });
          }
        }
      }
    }
  }

  // Calculate metadata
  const nodesByType: Record<NodeType, number> = {
    root: nodes.filter(n => n.type === 'root').length,
    prefix: nodes.filter(n => n.type === 'prefix').length,
    suffix: nodes.filter(n => n.type === 'suffix').length,
    word: nodes.filter(n => n.type === 'word').length,
  };

  const edgesByType: Record<EdgeType, number> = {
    has_root: edges.filter(e => e.type === 'has_root').length,
    has_prefix: edges.filter(e => e.type === 'has_prefix').length,
    has_suffix: edges.filter(e => e.type === 'has_suffix').length,
    related_root: edges.filter(e => e.type === 'related_root').length,
    synonym: edges.filter(e => e.type === 'synonym').length,
    antonym: edges.filter(e => e.type === 'antonym').length,
  };

  return {
    nodes,
    edges,
    metadata: {
      totalNodes: nodes.length,
      totalEdges: edges.length,
      nodesByType,
      edgesByType,
    },
  };
}

/** Get subgraph centered on a specific root */
export function getRootSubgraph(rootId: string, depth: number = 1): EtymologyGraph {
  const fullGraph = buildEtymologyGraph();
  const centerNodeId = `root-${rootId}`;

  const includedNodeIds = new Set<string>([centerNodeId]);
  const includedEdgeIds = new Set<string>();

  // BFS to find connected nodes within depth
  let frontier = [centerNodeId];
  for (let d = 0; d < depth; d++) {
    const nextFrontier: string[] = [];

    for (const nodeId of frontier) {
      // Find all edges connected to this node
      for (const edge of fullGraph.edges) {
        if (edge.source === nodeId || edge.target === nodeId) {
          includedEdgeIds.add(edge.id);

          const otherNodeId = edge.source === nodeId ? edge.target : edge.source;
          if (!includedNodeIds.has(otherNodeId)) {
            includedNodeIds.add(otherNodeId);
            nextFrontier.push(otherNodeId);
          }
        }
      }
    }

    frontier = nextFrontier;
  }

  const nodes = fullGraph.nodes.filter(n => includedNodeIds.has(n.id));
  const edges = fullGraph.edges.filter(e => includedEdgeIds.has(e.id));

  const nodesByType: Record<NodeType, number> = {
    root: nodes.filter(n => n.type === 'root').length,
    prefix: nodes.filter(n => n.type === 'prefix').length,
    suffix: nodes.filter(n => n.type === 'suffix').length,
    word: nodes.filter(n => n.type === 'word').length,
  };

  const edgesByType: Record<EdgeType, number> = {
    has_root: edges.filter(e => e.type === 'has_root').length,
    has_prefix: edges.filter(e => e.type === 'has_prefix').length,
    has_suffix: edges.filter(e => e.type === 'has_suffix').length,
    related_root: edges.filter(e => e.type === 'related_root').length,
    synonym: edges.filter(e => e.type === 'synonym').length,
    antonym: edges.filter(e => e.type === 'antonym').length,
  };

  return {
    nodes,
    edges,
    metadata: {
      totalNodes: nodes.length,
      totalEdges: edges.length,
      nodesByType,
      edgesByType,
    },
  };
}

/** Get subgraph centered on a specific word */
export function getWordSubgraph(wordId: string, depth: number = 1): EtymologyGraph {
  const fullGraph = buildEtymologyGraph();
  const centerNodeId = `word-${wordId}`;

  return getSubgraphFromNode(fullGraph, centerNodeId, depth);
}

/** Helper to build subgraph from a center node */
function getSubgraphFromNode(fullGraph: EtymologyGraph, centerNodeId: string, depth: number): EtymologyGraph {
  const includedNodeIds = new Set<string>([centerNodeId]);
  const includedEdgeIds = new Set<string>();

  let frontier = [centerNodeId];
  for (let d = 0; d < depth; d++) {
    const nextFrontier: string[] = [];

    for (const nodeId of frontier) {
      for (const edge of fullGraph.edges) {
        if (edge.source === nodeId || edge.target === nodeId) {
          includedEdgeIds.add(edge.id);

          const otherNodeId = edge.source === nodeId ? edge.target : edge.source;
          if (!includedNodeIds.has(otherNodeId)) {
            includedNodeIds.add(otherNodeId);
            nextFrontier.push(otherNodeId);
          }
        }
      }
    }

    frontier = nextFrontier;
  }

  const nodes = fullGraph.nodes.filter(n => includedNodeIds.has(n.id));
  const edges = fullGraph.edges.filter(e => includedEdgeIds.has(e.id));

  const nodesByType: Record<NodeType, number> = {
    root: nodes.filter(n => n.type === 'root').length,
    prefix: nodes.filter(n => n.type === 'prefix').length,
    suffix: nodes.filter(n => n.type === 'suffix').length,
    word: nodes.filter(n => n.type === 'word').length,
  };

  const edgesByType: Record<EdgeType, number> = {
    has_root: edges.filter(e => e.type === 'has_root').length,
    has_prefix: edges.filter(e => e.type === 'has_prefix').length,
    has_suffix: edges.filter(e => e.type === 'has_suffix').length,
    related_root: edges.filter(e => e.type === 'related_root').length,
    synonym: edges.filter(e => e.type === 'synonym').length,
    antonym: edges.filter(e => e.type === 'antonym').length,
  };

  return {
    nodes,
    edges,
    metadata: {
      totalNodes: nodes.length,
      totalEdges: edges.length,
      nodesByType,
      edgesByType,
    },
  };
}

/** Export graph in a format suitable for visualization libraries */
export function exportGraphForVisualization(graph: EtymologyGraph): {
  nodes: Array<{ id: string; label: string; group: string; size: number }>;
  links: Array<{ source: string; target: string; value: number }>;
} {
  const nodes = graph.nodes.map(node => ({
    id: node.id,
    label: node.label,
    group: node.type,
    size: node.type === 'word' ? 10 : node.type === 'root' ? 20 : 15,
  }));

  const links = graph.edges.map(edge => ({
    source: edge.source,
    target: edge.target,
    value: edge.weight,
  }));

  return { nodes, links };
}
