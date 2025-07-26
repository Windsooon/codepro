'use client'

import React, { useCallback, useMemo, useRef } from 'react'
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  Controls,
  Background,
  BackgroundVariant,
  Handle,
  Position,
  useReactFlow,
  ReactFlowProvider,
  Panel,
  getNodesBounds,
  getViewportForBounds,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

// Custom Decision Node Component
const DecisionNode = ({ data }) => {
  return (
    <div className="px-4 py-3 shadow-lg rounded-lg bg-blue-100 border-2 border-blue-300 min-w-[200px]">
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      <div className="text-center">
        <div className="text-sm font-bold text-blue-800">{data.label}</div>
        {data.tooltip && (
          <div className="text-xs text-blue-600 mt-1" title={data.tooltip}>
            {data.tooltip}
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} id="yes" className="w-3 h-3 !bg-green-500" />
      <Handle type="source" position={Position.Bottom} id="no" className="w-3 h-3 !bg-red-500" style={{ left: '75%' }} />
    </div>
  )
}

// Custom Leaf Node Component (Graph Techniques)
const LeafNode = ({ data }) => {
  return (
    <div className="px-4 py-3 shadow-lg rounded-xl bg-green-100 border-2 border-green-300 min-w-[300px] max-w-[350px]">
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      <div className="text-center">
        <div className="text-sm font-bold text-green-800 mb-2">{data.technique}</div>
        <div className="text-xs text-green-700 mb-2">
          <div><strong>Approach:</strong> {data.approach}</div>
          <div><strong>Complexity:</strong> {data.complexity}</div>
          <div><strong>Use Cases:</strong> {data.useCases}</div>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  )
}

// Problem Node Component
const ProblemNode = ({ data }) => {
  return (
    <div className="px-4 py-3 shadow-lg rounded-lg bg-orange-100 border-2 border-orange-300 min-w-[350px] max-w-[400px]">
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      <div className="text-center">
        <div className="text-sm font-bold text-orange-800 mb-2">LeetCode Problems</div>
        <div className="text-xs text-orange-600">
          <div className="max-h-32 overflow-y-auto">
            {data.problems.map((problem, index) => (
              <div key={index} className="mb-1 flex justify-between">
                <a 
                  href={problem.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline flex-1"
                >
                  {problem.number}. {problem.title}
                </a>
                <span className={`text-xs px-1 rounded ml-2 ${
                  problem.difficulty === 'Easy' ? 'bg-green-200 text-green-800' :
                  problem.difficulty === 'Medium' ? 'bg-yellow-200 text-yellow-800' :
                  'bg-red-200 text-red-800'
                }`}>
                  {problem.difficulty}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Root Node Component
const RootNode = ({ data }) => {
  return (
    <div className="px-6 py-4 shadow-lg rounded-full bg-purple-100 border-3 border-purple-400 min-w-[200px]">
      <div className="text-center">
        <div className="text-lg font-bold text-purple-800">{data.label}</div>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-4 h-4" />
    </div>
  )
}

const nodeTypes = {
  decision: DecisionNode,
  leaf: LeafNode,
  problem: ProblemNode,
  root: RootNode,
}

// Export function to download the flow as SVG
const downloadSvg = (reactFlowInstance) => {
  if (reactFlowInstance) {
    reactFlowInstance.fitView({ padding: 50 })
    
    const nodes = reactFlowInstance.getNodes()
    const edges = reactFlowInstance.getEdges()
    
    const bounds = nodes.reduce(
      (acc, node) => ({
        minX: Math.min(acc.minX, node.position.x),
        minY: Math.min(acc.minY, node.position.y),
        maxX: Math.max(acc.maxX, node.position.x + 400),
        maxY: Math.max(acc.maxY, node.position.y + 150),
      }),
      { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
    )

    const padding = 100
    const width = bounds.maxX - bounds.minX + (2 * padding)
    const height = bounds.maxY - bounds.minY + (2 * padding)
    const offsetX = -bounds.minX + padding
    const offsetY = -bounds.minY + padding

    let svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .node-text { font-family: Arial, sans-serif; font-size: 12px; }
      .node-title { font-family: Arial, sans-serif; font-size: 14px; font-weight: bold; }
      .decision-node { fill: #dbeafe; stroke: #3b82f6; stroke-width: 2; }
      .leaf-node { fill: #dcfce7; stroke: #10b981; stroke-width: 2; }
      .problem-node { fill: #fed7aa; stroke: #f97316; stroke-width: 2; }
      .root-node { fill: #e9d5ff; stroke: #8b5cf6; stroke-width: 3; }
      .edge-line { stroke: #6b7280; stroke-width: 2; fill: none; marker-end: url(#arrowhead); }
    </style>
    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
    </marker>
  </defs>
  
  <rect width="100%" height="100%" fill="#f9fafb"/>
  
  <text x="${width/2}" y="40" text-anchor="middle" class="node-title" font-size="20" fill="#1f2937">
    Graph Problems Decision Tree
  </text>`

    edges.forEach(edge => {
      const sourceNode = nodes.find(n => n.id === edge.source)
      const targetNode = nodes.find(n => n.id === edge.target)
      
      if (sourceNode && targetNode) {
        const x1 = sourceNode.position.x + offsetX + 200
        const y1 = sourceNode.position.y + offsetY + 75
        const x2 = targetNode.position.x + offsetX + 200
        const y2 = targetNode.position.y + offsetY + 75
        
        svgContent += `
  <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="edge-line" />
  <text x="${(x1 + x2) / 2}" y="${(y1 + y2) / 2 - 5}" text-anchor="middle" class="node-text" fill="#374151">${edge.label || ''}</text>`
      }
    })

    nodes.forEach(node => {
      const x = node.position.x + offsetX
      const y = node.position.y + offsetY
      let nodeClass = 'decision-node'
      let nodeContent = ''
      
      if (node.type === 'root') {
        nodeClass = 'root-node'
        nodeContent = `
  <ellipse cx="${x + 200}" cy="${y + 50}" rx="180" ry="40" class="${nodeClass}" />
  <text x="${x + 200}" y="${y + 55}" text-anchor="middle" class="node-title" fill="#7c3aed">${node.data.label}</text>`
      } else if (node.type === 'leaf') {
        nodeClass = 'leaf-node'
        nodeContent = `
  <rect x="${x}" y="${y}" width="400" height="120" rx="10" class="${nodeClass}" />
  <text x="${x + 200}" y="${y + 25}" text-anchor="middle" class="node-title" fill="#065f46">${node.data.technique}</text>
  <text x="${x + 200}" y="${y + 45}" text-anchor="middle" class="node-text" fill="#065f46">${node.data.approach}</text>
  <text x="${x + 200}" y="${y + 60}" text-anchor="middle" class="node-text" fill="#065f46">${node.data.complexity}</text>
  <text x="${x + 200}" y="${y + 75}" text-anchor="middle" class="node-text" fill="#065f46">${node.data.useCases}</text>`
      } else if (node.type === 'problem') {
        nodeClass = 'problem-node'
        const problems = node.data.problems.slice(0, 3)
        let problemText = problems.map((p, i) => `
  <text x="${x + 200}" y="${y + 45 + (i * 15)}" text-anchor="middle" class="node-text" fill="#9a3412">${p.number}. ${p.title}</text>`).join('')
        
        nodeContent = `
  <rect x="${x}" y="${y}" width="400" height="100" rx="8" class="${nodeClass}" />
  <text x="${x + 200}" y="${y + 25}" text-anchor="middle" class="node-title" fill="#9a3412">LeetCode Problems</text>${problemText}`
      } else {
        nodeContent = `
  <rect x="${x}" y="${y}" width="400" height="80" rx="8" class="${nodeClass}" />
  <text x="${x + 200}" y="${y + 30}" text-anchor="middle" class="node-title" fill="#1e40af">${node.data.label}</text>
  <text x="${x + 200}" y="${y + 50}" text-anchor="middle" class="node-text" fill="#1e40af">${node.data.tooltip || ''}</text>`
      }
      
      svgContent += nodeContent
    })

    svgContent += '\n</svg>'

    const blob = new Blob([svgContent], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'graph-problems-decision-tree.svg'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}

// Export function to download the flow as PNG
const downloadPng = async (reactFlowInstance) => {
  if (reactFlowInstance) {
    try {
      const rfWrapper = document.querySelector('.react-flow')
      if (!rfWrapper) return

      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      const bounds = rfWrapper.getBoundingClientRect()
      canvas.width = bounds.width
      canvas.height = bounds.height
      
      const dataUrl = await new Promise((resolve) => {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
        svg.setAttribute('width', bounds.width.toString())
        svg.setAttribute('height', bounds.height.toString())
        
        const foreignObject = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject')
        foreignObject.setAttribute('width', '100%')
        foreignObject.setAttribute('height', '100%')
        
        const clonedWrapper = rfWrapper.cloneNode(true)
        foreignObject.appendChild(clonedWrapper)
        svg.appendChild(foreignObject)
        
        const svgData = new XMLSerializer().serializeToString(svg)
        const img = new Image()
        img.onload = () => {
          ctx.drawImage(img, 0, 0)
          resolve(canvas.toDataURL('image/png'))
        }
        img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
      })
      
      const link = document.createElement('a')
      link.href = dataUrl
      link.download = 'graph-problems-decision-tree.png'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Error exporting PNG:', error)
      downloadSvg(reactFlowInstance)
    }
  }
}

// Main Flow Component
function GraphProblemsFlow() {
  const reactFlowInstance = useReactFlow()

  const graphData = {
    nodes: [
      // Root
      {
        id: 'root',
        type: 'root',
        position: { x: 1000, y: 50 },
        data: { label: 'Graph Problems' }
      },
      
      // Level 1: Main categorization
      {
        id: 'weighted-question',
        type: 'decision',
        position: { x: 1000, y: 180 },
        data: { 
          label: 'Is your graph weighted?',
          tooltip: 'Does each edge have a cost/weight/distance value?'
        }
      },

      // Level 2A: Weighted graphs
      {
        id: 'negative-edges',
        type: 'decision',
        position: { x: 600, y: 320 },
        data: { 
          label: 'Does your graph have negative edge weights?',
          tooltip: 'Determines shortest path algorithm choice'
        }
      },

      // Level 2B: Unweighted graphs  
      {
        id: 'directed-question',
        type: 'decision',
        position: { x: 1400, y: 320 },
        data: { 
          label: 'Is your graph directed?',
          tooltip: 'Directed graphs have one-way edges'
        }
      },

      // Level 3A: Negative weights (weighted)
      {
        id: 'all-pairs-shortest',
        type: 'decision',
        position: { x: 400, y: 460 },
        data: { 
          label: 'Do you need shortest paths between all pairs?',
          tooltip: 'Single source vs all pairs shortest paths'
        }
      },

      // Level 3B: No negative weights (weighted)
      {
        id: 'single-source-weighted',
        type: 'decision',
        position: { x: 800, y: 460 },
        data: { 
          label: 'Do you need single source shortest paths?',
          tooltip: 'Shortest paths vs minimum spanning tree'
        }
      },

      // Level 3C: Directed unweighted
      {
        id: 'topological-need',
        type: 'decision',
        position: { x: 1200, y: 460 },
        data: { 
          label: 'Do you need topological ordering?',
          tooltip: 'DAG ordering vs cycle detection vs connectivity'
        }
      },

      // Level 3D: Undirected unweighted
      {
        id: 'connectivity-question',
        type: 'decision',
        position: { x: 1600, y: 460 },
        data: { 
          label: 'Are you checking connectivity?',
          tooltip: 'Connected components vs bipartite vs shortest path'
        }
      },

      // Level 4: Further refinement for some branches
      {
        id: 'bipartite-question',
        type: 'decision',
        position: { x: 1800, y: 600 },
        data: { 
          label: 'Do you need to check if graph is bipartite?',
          tooltip: 'Two-coloring vs simple traversal'
        }
      },

      {
        id: 'union-find-question',
        type: 'decision',
        position: { x: 1400, y: 600 },
        data: { 
          label: 'Do you need dynamic connectivity?',
          tooltip: 'Union-Find for dynamic graph operations'
        }
      },

      {
        id: 'strongly-connected',
        type: 'decision',
        position: { x: 1000, y: 600 },
        data: { 
          label: 'Do you need strongly connected components?',
          tooltip: 'SCC vs simple cycle detection'
        }
      },

      // Leaf Nodes (Graph Techniques)
      {
        id: 'leaf1',
        type: 'leaf',
        position: { x: 200, y: 600 },
        data: {
          technique: 'Floyd-Warshall Algorithm',
          approach: 'All pairs shortest paths with negative edges',
          complexity: 'O(V³) time, O(V²) space',
          useCases: 'All pairs shortest paths, transitive closure'
        }
      },

      {
        id: 'leaf2',
        type: 'leaf',
        position: { x: 400, y: 740 },
        data: {
          technique: 'Bellman-Ford Algorithm',
          approach: 'Single source shortest paths with negative edges',
          complexity: 'O(VE) time, O(V) space',
          useCases: 'Negative edge detection, single source shortest paths'
        }
      },

      {
        id: 'leaf3',
        type: 'leaf',
        position: { x: 600, y: 600 },
        data: {
          technique: 'Dijkstra\'s Algorithm',
          approach: 'Single source shortest paths (non-negative weights)',
          complexity: 'O((V+E)log V) time, O(V) space',
          useCases: 'GPS navigation, network routing, shortest paths'
        }
      },

      {
        id: 'leaf4',
        type: 'leaf',
        position: { x: 800, y: 740 },
        data: {
          technique: 'Minimum Spanning Tree (Prim/Kruskal)',
          approach: 'Find minimum cost spanning tree',
          complexity: 'O(E log V) time, O(V) space',
          useCases: 'Network design, clustering, minimum cost connections'
        }
      },

      {
        id: 'leaf5',
        type: 'leaf',
        position: { x: 1200, y: 600 },
        data: {
          technique: 'Topological Sort',
          approach: 'Linear ordering of DAG vertices',
          complexity: 'O(V+E) time, O(V) space',
          useCases: 'Task scheduling, dependency resolution, course ordering'
        }
      },

      {
        id: 'leaf6',
        type: 'leaf',
        position: { x: 1000, y: 740 },
        data: {
          technique: 'Strongly Connected Components (Tarjan/Kosaraju)',
          approach: 'Find SCCs in directed graphs',
          complexity: 'O(V+E) time, O(V) space',
          useCases: 'Web crawling, social network analysis, compiler optimization'
        }
      },

      {
        id: 'leaf7',
        type: 'leaf',
        position: { x: 1400, y: 740 },
        data: {
          technique: 'Union-Find (Disjoint Set)',
          approach: 'Dynamic connectivity with path compression',
          complexity: 'O(α(n)) time, O(V) space',
          useCases: 'Dynamic connectivity, MST algorithms, percolation'
        }
      },

      {
        id: 'leaf8',
        type: 'leaf',
        position: { x: 1600, y: 600 },
        data: {
          technique: 'BFS/DFS Traversal',
          approach: 'Basic graph traversal and exploration',
          complexity: 'O(V+E) time, O(V) space',
          useCases: 'Graph traversal, shortest path in unweighted graphs'
        }
      },

      {
        id: 'leaf9',
        type: 'leaf',
        position: { x: 1800, y: 740 },
        data: {
          technique: 'Bipartite Graph Detection',
          approach: 'Two-coloring using BFS/DFS',
          complexity: 'O(V+E) time, O(V) space',
          useCases: 'Matching problems, graph coloring, conflict detection'
        }
      },

      {
        id: 'leaf10',
        type: 'leaf',
        position: { x: 0, y: 460 },
        data: {
          technique: 'Cycle Detection',
          approach: 'Detect cycles in directed/undirected graphs',
          complexity: 'O(V+E) time, O(V) space',
          useCases: 'Deadlock detection, dependency cycles, graph validation'
        }
      },

      {
        id: 'leaf11',
        type: 'leaf',
        position: { x: 2000, y: 460 },
        data: {
          technique: 'Articulation Points & Bridges',
          approach: 'Find critical edges and vertices',
          complexity: 'O(V+E) time, O(V) space',
          useCases: 'Network reliability, critical infrastructure analysis'
        }
      },

      {
        id: 'leaf12',
        type: 'leaf',
        position: { x: 600, y: 880 },
        data: {
          technique: 'Graph Backtracking',
          approach: 'Find all paths/cycles with constraints',
          complexity: 'O(V!) worst case, O(V) space',
          useCases: 'All paths, Hamiltonian paths, graph coloring'
        }
      },

      {
        id: 'leaf13',
        type: 'leaf',
        position: { x: 1000, y: 880 },
        data: {
          technique: 'A* Search Algorithm',
          approach: 'Heuristic-based shortest path search',
          complexity: 'O(b^d) time, O(b^d) space',
          useCases: 'Pathfinding in games, GPS with heuristics'
        }
      },

      {
        id: 'leaf14',
        type: 'leaf',
        position: { x: 1400, y: 880 },
        data: {
          technique: 'Maximum Flow (Ford-Fulkerson)',
          approach: 'Find maximum flow in flow networks',
          complexity: 'O(Ef) time, O(V+E) space',
          useCases: 'Network flow, bipartite matching, capacity planning'
        }
      },

      {
        id: 'leaf15',
        type: 'leaf',
        position: { x: 800, y: 880 },
        data: {
          technique: 'Graph DP',
          approach: 'Dynamic programming on graph structures',
          complexity: 'O(V+E) to O(V*2^V) time depending on problem',
          useCases: 'Longest path in DAG, traveling salesman variants'
        }
      },

      // Problem Nodes
      {
        id: 'problems1',
        type: 'problem',
        position: { x: 200, y: 740 },
        data: {
          problems: [
            { number: 1334, title: 'Find the City With the Smallest Number of Neighbors at a Threshold Distance', url: 'https://leetcode.com/problems/find-the-city-with-the-smallest-number-of-neighbors-at-a-threshold-distance/', difficulty: 'Medium' },
            { number: 1547, title: 'Minimum Cost to Cut a Stick', url: 'https://leetcode.com/problems/minimum-cost-to-cut-a-stick/', difficulty: 'Hard' },
            { number: 1617, title: 'Count Subtrees With Max Distance Between Cities', url: 'https://leetcode.com/problems/count-subtrees-with-max-distance-between-cities/', difficulty: 'Hard' },
            { number: 1462, title: 'Course Schedule IV', url: 'https://leetcode.com/problems/course-schedule-iv/', difficulty: 'Medium' },
          ]
        }
      },

      {
        id: 'problems2',
        type: 'problem',
        position: { x: 400, y: 880 },
        data: {
          problems: [
            { number: 787, title: 'Cheapest Flights Within K Stops', url: 'https://leetcode.com/problems/cheapest-flights-within-k-stops/', difficulty: 'Medium' },
            { number: 743, title: 'Network Delay Time', url: 'https://leetcode.com/problems/network-delay-time/', difficulty: 'Medium' },
            { number: 1514, title: 'Path with Maximum Probability', url: 'https://leetcode.com/problems/path-with-maximum-probability/', difficulty: 'Medium' },
            { number: 1928, title: 'Minimum Cost to Reach Destination in Time', url: 'https://leetcode.com/problems/minimum-cost-to-reach-destination-in-time/', difficulty: 'Hard' },
          ]
        }
      },

      {
        id: 'problems3',
        type: 'problem',
        position: { x: 600, y: 740 },
        data: {
          problems: [
            { number: 743, title: 'Network Delay Time', url: 'https://leetcode.com/problems/network-delay-time/', difficulty: 'Medium' },
            { number: 1631, title: 'Path With Minimum Effort', url: 'https://leetcode.com/problems/path-with-minimum-effort/', difficulty: 'Medium' },
            { number: 1368, title: 'Minimum Cost to Make at Least One Valid Path in a Grid', url: 'https://leetcode.com/problems/minimum-cost-to-make-at-least-one-valid-path-in-a-grid/', difficulty: 'Hard' },
            { number: 778, title: 'Swim in Rising Water', url: 'https://leetcode.com/problems/swim-in-rising-water/', difficulty: 'Hard' },
          ]
        }
      },

      {
        id: 'problems4',
        type: 'problem',
        position: { x: 800, y: 1020 },
        data: {
          problems: [
            { number: 1584, title: 'Min Cost to Connect All Points', url: 'https://leetcode.com/problems/min-cost-to-connect-all-points/', difficulty: 'Medium' },
            { number: 1135, title: 'Connecting Cities With Minimum Cost', url: 'https://leetcode.com/problems/connecting-cities-with-minimum-cost/', difficulty: 'Medium' },
            { number: 1489, title: 'Find Critical and Pseudo-Critical Edges in MST', url: 'https://leetcode.com/problems/find-critical-and-pseudo-critical-edges-in-minimum-spanning-tree/', difficulty: 'Hard' },
            { number: 1168, title: 'Optimize Water Distribution in a Village', url: 'https://leetcode.com/problems/optimize-water-distribution-in-a-village/', difficulty: 'Hard' },
          ]
        }
      },

      {
        id: 'problems5',
        type: 'problem',
        position: { x: 1200, y: 740 },
        data: {
          problems: [
            { number: 207, title: 'Course Schedule', url: 'https://leetcode.com/problems/course-schedule/', difficulty: 'Medium' },
            { number: 210, title: 'Course Schedule II', url: 'https://leetcode.com/problems/course-schedule-ii/', difficulty: 'Medium' },
            { number: 269, title: 'Alien Dictionary', url: 'https://leetcode.com/problems/alien-dictionary/', difficulty: 'Hard' },
            { number: 310, title: 'Minimum Height Trees', url: 'https://leetcode.com/problems/minimum-height-trees/', difficulty: 'Medium' },
          ]
        }
      },

      {
        id: 'problems6',
        type: 'problem',
        position: { x: 1000, y: 880 },
        data: {
          problems: [
            { number: 1192, title: 'Critical Connections in a Network', url: 'https://leetcode.com/problems/critical-connections-in-a-network/', difficulty: 'Hard' },
            { number: 1568, title: 'Minimum Number of Days to Disconnect Island', url: 'https://leetcode.com/problems/minimum-number-of-days-to-disconnect-island/', difficulty: 'Hard' },
            { number: 323, title: 'Number of Connected Components in an Undirected Graph', url: 'https://leetcode.com/problems/number-of-connected-components-in-an-undirected-graph/', difficulty: 'Medium' },
            { number: 1300, title: 'Sum of Mutated Array Closest to Target', url: 'https://leetcode.com/problems/sum-of-mutated-array-closest-to-target/', difficulty: 'Medium' },
          ]
        }
      },

      {
        id: 'problems7',
        type: 'problem',
        position: { x: 1400, y: 880 },
        data: {
          problems: [
            { number: 547, title: 'Number of Provinces', url: 'https://leetcode.com/problems/number-of-provinces/', difficulty: 'Medium' },
            { number: 200, title: 'Number of Islands', url: 'https://leetcode.com/problems/number-of-islands/', difficulty: 'Medium' },
            { number: 721, title: 'Accounts Merge', url: 'https://leetcode.com/problems/accounts-merge/', difficulty: 'Medium' },
            { number: 684, title: 'Redundant Connection', url: 'https://leetcode.com/problems/redundant-connection/', difficulty: 'Medium' },
          ]
        }
      },

      {
        id: 'problems8',
        type: 'problem',
        position: { x: 1600, y: 740 },
        data: {
          problems: [
            { number: 133, title: 'Clone Graph', url: 'https://leetcode.com/problems/clone-graph/', difficulty: 'Medium' },
            { number: 101, title: 'Symmetric Tree', url: 'https://leetcode.com/problems/symmetric-tree/', difficulty: 'Easy' },
            { number: 1091, title: 'Shortest Path in Binary Matrix', url: 'https://leetcode.com/problems/shortest-path-in-binary-matrix/', difficulty: 'Medium' },
            { number: 542, title: '01 Matrix', url: 'https://leetcode.com/problems/01-matrix/', difficulty: 'Medium' },
          ]
        }
      },

      {
        id: 'problems9',
        type: 'problem',
        position: { x: 1800, y: 880 },
        data: {
          problems: [
            { number: 785, title: 'Is Graph Bipartite?', url: 'https://leetcode.com/problems/is-graph-bipartite/', difficulty: 'Medium' },
            { number: 886, title: 'Possible Bipartition', url: 'https://leetcode.com/problems/possible-bipartition/', difficulty: 'Medium' },
            { number: 1042, title: 'Flower Planting With No Adjacent', url: 'https://leetcode.com/problems/flower-planting-with-no-adjacent/', difficulty: 'Medium' },
            { number: 1079, title: 'Letter Tile Possibilities', url: 'https://leetcode.com/problems/letter-tile-possibilities/', difficulty: 'Medium' },
          ]
        }
      },

      {
        id: 'problems10',
        type: 'problem',
        position: { x: 0, y: 600 },
        data: {
          problems: [
            { number: 802, title: 'Find Eventual Safe States', url: 'https://leetcode.com/problems/find-eventual-safe-states/', difficulty: 'Medium' },
            { number: 684, title: 'Redundant Connection', url: 'https://leetcode.com/problems/redundant-connection/', difficulty: 'Medium' },
            { number: 685, title: 'Redundant Connection II', url: 'https://leetcode.com/problems/redundant-connection-ii/', difficulty: 'Hard' },
            { number: 1059, title: 'All Paths from Source Lead to Destination', url: 'https://leetcode.com/problems/all-paths-from-source-lead-to-destination/', difficulty: 'Medium' },
          ]
        }
      },

      {
        id: 'problems11',
        type: 'problem',
        position: { x: 2000, y: 600 },
        data: {
          problems: [
            { number: 1192, title: 'Critical Connections in a Network', url: 'https://leetcode.com/problems/critical-connections-in-a-network/', difficulty: 'Hard' },
            { number: 1568, title: 'Minimum Number of Days to Disconnect Island', url: 'https://leetcode.com/problems/minimum-number-of-days-to-disconnect-island/', difficulty: 'Hard' },
            { number: 1489, title: 'Find Critical and Pseudo-Critical Edges in MST', url: 'https://leetcode.com/problems/find-critical-and-pseudo-critical-edges-in-minimum-spanning-tree/', difficulty: 'Hard' },
            { number: 928, title: 'Minimize Malware Spread II', url: 'https://leetcode.com/problems/minimize-malware-spread-ii/', difficulty: 'Hard' },
          ]
        }
      },

      {
        id: 'problems12',
        type: 'problem',
        position: { x: 600, y: 1020 },
        data: {
          problems: [
            { number: 79, title: 'Word Search', url: 'https://leetcode.com/problems/word-search/', difficulty: 'Medium' },
            { number: 212, title: 'Word Search II', url: 'https://leetcode.com/problems/word-search-ii/', difficulty: 'Hard' },
            { number: 131, title: 'Palindrome Partitioning', url: 'https://leetcode.com/problems/palindrome-partitioning/', difficulty: 'Medium' },
            { number: 78, title: 'Subsets', url: 'https://leetcode.com/problems/subsets/', difficulty: 'Medium' },
          ]
        }
      },

      {
        id: 'problems13',
        type: 'problem',
        position: { x: 1000, y: 1020 },
        data: {
          problems: [
            { number: 1293, title: 'Shortest Path in a Grid with Obstacles Elimination', url: 'https://leetcode.com/problems/shortest-path-in-a-grid-with-obstacles-elimination/', difficulty: 'Hard' },
            { number: 864, title: 'Shortest Path to Get All Keys', url: 'https://leetcode.com/problems/shortest-path-to-get-all-keys/', difficulty: 'Hard' },
            { number: 126, title: 'Word Ladder II', url: 'https://leetcode.com/problems/word-ladder-ii/', difficulty: 'Hard' },
            { number: 127, title: 'Word Ladder', url: 'https://leetcode.com/problems/word-ladder/', difficulty: 'Hard' },
          ]
        }
      },

      {
        id: 'problems14',
        type: 'problem',
        position: { x: 1400, y: 1020 },
        data: {
          problems: [
            { number: 1579, title: 'Remove Max Number of Edges to Keep Graph Fully Traversable', url: 'https://leetcode.com/problems/remove-max-number-of-edges-to-keep-graph-fully-traversable/', difficulty: 'Hard' },
            { number: 1061, title: 'Lexicographically Smallest Equivalent String', url: 'https://leetcode.com/problems/lexicographically-smallest-equivalent-string/', difficulty: 'Medium' },
            { number: 1905, title: 'Count Sub Islands', url: 'https://leetcode.com/problems/count-sub-islands/', difficulty: 'Medium' },
            { number: 827, title: 'Making A Large Island', url: 'https://leetcode.com/problems/making-a-large-island/', difficulty: 'Hard' },
          ]
        }
      },

      {
        id: 'problems15',
        type: 'problem',
        position: { x: 800, y: 1160 },
        data: {
          problems: [
            { number: 1483, title: 'Kth Ancestor of a Tree Node', url: 'https://leetcode.com/problems/kth-ancestor-of-a-tree-node/', difficulty: 'Hard' },
            { number: 1143, title: 'Longest Common Subsequence', url: 'https://leetcode.com/problems/longest-common-subsequence/', difficulty: 'Medium' },
            { number: 1857, title: 'Largest Color Value in a Directed Graph', url: 'https://leetcode.com/problems/largest-color-value-in-a-directed-graph/', difficulty: 'Hard' },
            { number: 1928, title: 'Minimum Cost to Reach Destination in Time', url: 'https://leetcode.com/problems/minimum-cost-to-reach-destination-in-time/', difficulty: 'Hard' },
          ]
        }
      },
    ],
    
    edges: [
      // Root to Level 1
      { id: 'e1', source: 'root', target: 'weighted-question', animated: true },
      
      // Level 1 to Level 2
      { id: 'e2', source: 'weighted-question', sourceHandle: 'yes', target: 'negative-edges', label: 'Yes', style: { stroke: '#10b981' } },
      { id: 'e3', source: 'weighted-question', sourceHandle: 'no', target: 'directed-question', label: 'No', style: { stroke: '#ef4444' } },
      
      // Level 2 to Level 3
      { id: 'e4', source: 'negative-edges', sourceHandle: 'yes', target: 'all-pairs-shortest', label: 'Yes', style: { stroke: '#10b981' } },
      { id: 'e5', source: 'negative-edges', sourceHandle: 'no', target: 'single-source-weighted', label: 'No', style: { stroke: '#ef4444' } },
      { id: 'e6', source: 'directed-question', sourceHandle: 'yes', target: 'topological-need', label: 'Yes', style: { stroke: '#10b981' } },
      { id: 'e7', source: 'directed-question', sourceHandle: 'no', target: 'connectivity-question', label: 'No', style: { stroke: '#ef4444' } },
      
      // Level 3 to Level 4 and Leaves
      { id: 'e8', source: 'all-pairs-shortest', sourceHandle: 'yes', target: 'leaf1', label: 'Yes', style: { stroke: '#10b981' } },
      { id: 'e9', source: 'all-pairs-shortest', sourceHandle: 'no', target: 'leaf2', label: 'No', style: { stroke: '#ef4444' } },
      { id: 'e10', source: 'single-source-weighted', sourceHandle: 'yes', target: 'leaf3', label: 'Yes', style: { stroke: '#10b981' } },
      { id: 'e11', source: 'single-source-weighted', sourceHandle: 'no', target: 'leaf4', label: 'No', style: { stroke: '#ef4444' } },
      { id: 'e12', source: 'topological-need', sourceHandle: 'yes', target: 'leaf5', label: 'Yes', style: { stroke: '#10b981' } },
      { id: 'e13', source: 'topological-need', sourceHandle: 'no', target: 'strongly-connected', label: 'No', style: { stroke: '#ef4444' } },
      { id: 'e14', source: 'connectivity-question', sourceHandle: 'yes', target: 'union-find-question', label: 'Yes', style: { stroke: '#10b981' } },
      { id: 'e15', source: 'connectivity-question', sourceHandle: 'no', target: 'bipartite-question', label: 'No', style: { stroke: '#ef4444' } },
      
      // Level 4 to Leaves
      { id: 'e16', source: 'strongly-connected', sourceHandle: 'yes', target: 'leaf6', label: 'Yes', style: { stroke: '#10b981' } },
      { id: 'e17', source: 'strongly-connected', sourceHandle: 'no', target: 'leaf10', label: 'No', style: { stroke: '#ef4444' } },
      { id: 'e18', source: 'union-find-question', sourceHandle: 'yes', target: 'leaf7', label: 'Yes', style: { stroke: '#10b981' } },
      { id: 'e19', source: 'union-find-question', sourceHandle: 'no', target: 'leaf8', label: 'No', style: { stroke: '#ef4444' } },
      { id: 'e20', source: 'bipartite-question', sourceHandle: 'yes', target: 'leaf9', label: 'Yes', style: { stroke: '#10b981' } },
      { id: 'e21', source: 'bipartite-question', sourceHandle: 'no', target: 'leaf11', label: 'No', style: { stroke: '#ef4444' } },
      
             // Additional advanced techniques branching
       { id: 'e22', source: 'leaf2', target: 'leaf12', label: 'Backtrack', style: { stroke: '#8b5cf6' } },
       { id: 'e23', source: 'leaf3', target: 'leaf13', label: 'Heuristic', style: { stroke: '#8b5cf6' } },
       { id: 'e24', source: 'leaf8', target: 'leaf14', label: 'Flow', style: { stroke: '#8b5cf6' } },
       { id: 'e25', source: 'leaf5', target: 'leaf15', label: 'DP', style: { stroke: '#8b5cf6' } },
       
       // Leaf nodes to Problem nodes
       { id: 'e26', source: 'leaf1', target: 'problems1', style: { stroke: '#f97316' } },
       { id: 'e27', source: 'leaf2', target: 'problems2', style: { stroke: '#f97316' } },
       { id: 'e28', source: 'leaf3', target: 'problems3', style: { stroke: '#f97316' } },
       { id: 'e29', source: 'leaf4', target: 'problems4', style: { stroke: '#f97316' } },
       { id: 'e30', source: 'leaf5', target: 'problems5', style: { stroke: '#f97316' } },
       { id: 'e31', source: 'leaf6', target: 'problems6', style: { stroke: '#f97316' } },
       { id: 'e32', source: 'leaf7', target: 'problems7', style: { stroke: '#f97316' } },
       { id: 'e33', source: 'leaf8', target: 'problems8', style: { stroke: '#f97316' } },
       { id: 'e34', source: 'leaf9', target: 'problems9', style: { stroke: '#f97316' } },
       { id: 'e35', source: 'leaf10', target: 'problems10', style: { stroke: '#f97316' } },
       { id: 'e36', source: 'leaf11', target: 'problems11', style: { stroke: '#f97316' } },
       { id: 'e37', source: 'leaf12', target: 'problems12', style: { stroke: '#f97316' } },
       { id: 'e38', source: 'leaf13', target: 'problems13', style: { stroke: '#f97316' } },
       { id: 'e39', source: 'leaf14', target: 'problems14', style: { stroke: '#f97316' } },
       { id: 'e40', source: 'leaf15', target: 'problems15', style: { stroke: '#f97316' } },
    ]
  }

  const [nodes, setNodes, onNodesChange] = useNodesState(graphData.nodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(graphData.edges)

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <div className="p-4 bg-gray-100 border-b">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-bold text-gray-800">Graph Problems Decision Tree</h1>
          <div className="flex gap-2">
            <button
              onClick={() => downloadSvg(reactFlowInstance)}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-md transition-colors duration-200 flex items-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7,10 12,15 17,10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Export SVG
            </button>
            <button
              onClick={() => downloadPng(reactFlowInstance)}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg shadow-md transition-colors duration-200 flex items-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21,15 16,10 5,21"/>
              </svg>
              Export PNG
            </button>
          </div>
        </div>
        
        <div className="text-sm text-gray-500">
          <strong>How to use:</strong> Follow the decision path based on your graph characteristics. 
          Each green node shows a graph algorithm with approach and complexity, while orange nodes contain related LeetCode problems.
          <br />
          <strong>Coverage:</strong> 15 major graph algorithms including BFS/DFS, Shortest Path, MST, Topological Sort, Union-Find, SCC, and advanced techniques.
          <br />
          <strong>Controls:</strong> Zoom with mouse wheel, pan by dragging. Use export buttons to save as SVG or PNG.
        </div>
      </div>
      
      <div style={{ width: '100%', height: 'calc(100vh - 140px)' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-left"
        >
          <Controls />
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
          <Panel position="top-right">
            <div className="flex gap-1">
              <button
                onClick={() => downloadSvg(reactFlowInstance)}
                className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md shadow-md transition-colors duration-200 flex items-center gap-1 text-sm"
                title="Export decision tree as SVG"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7,10 12,15 17,10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                SVG
              </button>
              <button
                onClick={() => downloadPng(reactFlowInstance)}
                className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md shadow-md transition-colors duration-200 flex items-center gap-1 text-sm"
                title="Export decision tree as PNG"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21,15 16,10 5,21"/>
                </svg>
                PNG
              </button>
            </div>
          </Panel>
        </ReactFlow>
      </div>
    </div>
  )
}

export default function GraphProblemsTree() {
  return (
    <ReactFlowProvider>
      <GraphProblemsFlow />
    </ReactFlowProvider>
  )
}