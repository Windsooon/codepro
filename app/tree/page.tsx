'use client'

import React, { useCallback, useMemo, useRef, useState } from 'react'
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
import { Navbar } from '@/components/navbar'

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

// Custom Leaf Node Component (Tree Techniques)
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
const downloadSvg = (reactFlowInstance, viewType) => {
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
    Binary Tree - ${viewType === 'problem-type' ? 'Problem Type View' : viewType === 'algorithm-approach' ? 'Algorithm Approach View' : 'Tree Characteristics View'}
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
    link.download = `binary-tree-${viewType}-view.svg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}

// Export function to download the flow as PNG
const downloadPng = async (reactFlowInstance, viewType) => {
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
      link.download = `binary-tree-${viewType}-view.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Error exporting PNG:', error)
      downloadSvg(reactFlowInstance, viewType)
    }
  }
}

// Problem Type Data (what kind of tree problem?)
const problemTypeData = {
  nodes: [
    // Root
    {
      id: 'root',
      type: 'root',
      position: { x: 900, y: 50 }, // Adjusted for center alignment
      data: { label: 'Binary Tree Problems' }
    },
    
    // Level 1: Main categorization
    {
      id: 'operation-type',
      type: 'decision',
      position: { x: 800, y: 180 }, // Adjusted for center alignment with wider decision node
      data: { 
        label: 'What type of operation do you need?',
        tooltip: 'Categorize by the main operation you need to perform'
      }
    },

    // Level 2A: Traversal operations
    {
      id: 'traversal-type',
      type: 'decision',
      position: { x: 300, y: 320 }, // Adjusted for center alignment
      data: { 
        label: 'What type of traversal?',
        tooltip: 'Different ways to visit tree nodes'
      }
    },

    // Level 2B: Construction operations
    {
      id: 'construction-type',
      type: 'decision',
      position: { x: 650, y: 320 }, // Adjusted for center alignment
      data: { 
        label: 'Are you building from existing data?',
        tooltip: 'Building tree vs modifying existing tree'
      }
    },

    // Level 2C: Validation operations
    {
      id: 'validation-type',
      type: 'decision',
      position: { x: 1050, y: 320 }, // Adjusted for center alignment
      data: { 
        label: 'What property do you need to validate?',
        tooltip: 'Different tree properties and validations'
      }
    },

    // Level 2D: Search/Path operations
    {
      id: 'search-path-type',
      type: 'decision',
      position: { x: 1450, y: 320 }, // Adjusted for center alignment
      data: { 
        label: 'Are you looking for paths or ancestors?',
        tooltip: 'Path-based problems vs ancestor/relationship problems'
      }
    },

    // Level 3: Further refinement
    {
      id: 'dfs-order',
      type: 'decision',
      position: { x: 100, y: 460 }, // Adjusted for center alignment
      data: { 
        label: 'Do you need specific DFS order?',
        tooltip: 'Preorder, inorder, postorder, or level-order'
      }
    },

    {
      id: 'space-constraint',
      type: 'decision',
      position: { x: 500, y: 460 }, // Adjusted for center alignment
      data: { 
        label: 'Do you have space constraints?',
        tooltip: 'O(1) space vs normal space complexity'
      }
    },

    {
      id: 'tree-structure',
      type: 'decision',
      position: { x: 1050, y: 460 }, // Adjusted for center alignment
      data: { 
        label: 'Is it a Binary Search Tree?',
        tooltip: 'BST properties vs general binary tree'
      }
    },

    {
      id: 'path-type',
      type: 'decision',
      position: { x: 1450, y: 460 }, // Adjusted for center alignment
      data: { 
        label: 'Do you need root-to-leaf paths?',
        tooltip: 'Path sum problems vs LCA problems'
      }
    },

    // Leaf Nodes (Tree Techniques) - adjusted for center alignment
    {
      id: 'leaf1',
      type: 'leaf',
      position: { x: 0, y: 600 }, // Adjusted for center alignment (leaf nodes are ~325px wide)
      data: {
        technique: 'Preorder Traversal',
        approach: 'Root → Left → Right traversal order',
        complexity: 'O(n) time, O(h) space',
        useCases: 'Tree copying, expression trees, prefix notation'
      }
    },

    {
      id: 'leaf2',
      type: 'leaf',
      position: { x: 200, y: 600 }, // Adjusted for center alignment
      data: {
        technique: 'Inorder Traversal',
        approach: 'Left → Root → Right traversal order',
        complexity: 'O(n) time, O(h) space',
        useCases: 'BST sorted output, expression evaluation'
      }
    },

    {
      id: 'leaf3',
      type: 'leaf',
      position: { x: 0, y: 760 }, // Adjusted for center alignment
      data: {
        technique: 'Postorder Traversal',
        approach: 'Left → Right → Root traversal order',
        complexity: 'O(n) time, O(h) space',
        useCases: 'Tree deletion, calculating tree size/height'
      }
    },

    {
      id: 'leaf4',
      type: 'leaf',
      position: { x: 200, y: 760 }, // Adjusted for center alignment
      data: {
        technique: 'Level-order Traversal',
        approach: 'BFS traversal level by level',
        complexity: 'O(n) time, O(w) space where w is max width',
        useCases: 'Level-wise operations, tree serialization'
      }
    },

    {
      id: 'leaf5',
      type: 'leaf',
      position: { x: 400, y: 600 }, // Adjusted for center alignment
      data: {
        technique: 'Morris Traversal',
        approach: 'Threaded binary tree for O(1) space',
        complexity: 'O(n) time, O(1) space',
        useCases: 'Space-optimized traversal, memory-constrained systems'
      }
    },

    {
      id: 'leaf6',
      type: 'leaf',
      position: { x: 600, y: 600 }, // Adjusted for center alignment
      data: {
        technique: 'Iterative Traversal',
        approach: 'Stack-based iterative implementation',
        complexity: 'O(n) time, O(h) space',
        useCases: 'Avoiding recursion, explicit stack control'
      }
    },

    {
      id: 'leaf7',
      type: 'leaf',
      position: { x: 650, y: 460 }, // Adjusted for center alignment
      data: {
        technique: 'Tree Construction',
        approach: 'Build tree from traversal arrays',
        complexity: 'O(n) time, O(n) space',
        useCases: 'Tree reconstruction, parsing expressions'
      }
    },

    {
      id: 'leaf8',
      type: 'leaf',
      position: { x: 900, y: 600 }, // Adjusted for center alignment
      data: {
        technique: 'Tree Serialization',
        approach: 'Convert tree to/from string representation',
        complexity: 'O(n) time, O(n) space',
        useCases: 'Tree storage, network transmission'
      }
    },

    {
      id: 'leaf9',
      type: 'leaf',
      position: { x: 1000, y: 600 }, // Adjusted for center alignment
      data: {
        technique: 'BST Validation',
        approach: 'Validate binary search tree properties',
        complexity: 'O(n) time, O(h) space',
        useCases: 'Data structure verification, BST maintenance'
      }
    },

    {
      id: 'leaf10',
      type: 'leaf',
      position: { x: 1200, y: 600 }, // Adjusted for center alignment
      data: {
        technique: 'Tree Properties',
        approach: 'Calculate height, diameter, balance',
        complexity: 'O(n) time, O(h) space',
        useCases: 'Tree analysis, balancing decisions'
      }
    },

    {
      id: 'leaf11',
      type: 'leaf',
      position: { x: 1400, y: 600 }, // Adjusted for center alignment
      data: {
        technique: 'Lowest Common Ancestor',
        approach: 'Find LCA of two nodes',
        complexity: 'O(n) time, O(h) space',
        useCases: 'Tree queries, distance calculations'
      }
    },

    {
      id: 'leaf12',
      type: 'leaf',
      position: { x: 1600, y: 600 }, // Adjusted for center alignment
      data: {
        technique: 'Path Sum Problems',
        approach: 'Find paths with specific sum',
        complexity: 'O(n) time, O(h) space',
        useCases: 'Path finding, sum optimization'
      }
    },

    {
      id: 'leaf13',
      type: 'leaf',
      position: { x: 800, y: 760 }, // Adjusted for center alignment
      data: {
        technique: 'Tree DP',
        approach: 'Dynamic programming on trees',
        complexity: 'O(n) time, O(h) space',
        useCases: 'Optimization problems, house robber on trees'
      }
    },

    {
      id: 'leaf14',
      type: 'leaf',
      position: { x: 1000, y: 760 }, // Adjusted for center alignment
      data: {
        technique: 'Symmetric Tree',
        approach: 'Check tree symmetry/mirror properties',
        complexity: 'O(n) time, O(h) space',
        useCases: 'Tree validation, mirror operations'
      }
    },

    {
      id: 'leaf15',
      type: 'leaf',
      position: { x: 1200, y: 760 }, // Adjusted for center alignment
      data: {
        technique: 'Subtree Matching',
        approach: 'Check if one tree is subtree of another',
        complexity: 'O(m*n) time, O(h) space',
        useCases: 'Pattern matching, tree comparison'
      }
    },

    // Problem Nodes - adjusted for center alignment (problem nodes are ~375px wide)
    {
      id: 'problems1',
      type: 'problem',
      position: { x: -25, y: 740 }, // Adjusted for center alignment
      data: {
        problems: [
          { number: 144, title: 'Binary Tree Preorder Traversal', url: 'https://leetcode.com/problems/binary-tree-preorder-traversal/', difficulty: 'Easy' },
          { number: 589, title: 'N-ary Tree Preorder Traversal', url: 'https://leetcode.com/problems/n-ary-tree-preorder-traversal/', difficulty: 'Easy' },
          { number: 606, title: 'Construct String from Binary Tree', url: 'https://leetcode.com/problems/construct-string-from-binary-tree/', difficulty: 'Easy' },
          { number: 971, title: 'Flip Binary Tree To Match Preorder Traversal', url: 'https://leetcode.com/problems/flip-binary-tree-to-match-preorder-traversal/', difficulty: 'Medium' },
        ]
      }
    },

    {
      id: 'problems2',
      type: 'problem',
      position: { x: 175, y: 740 }, // Adjusted for center alignment
      data: {
        problems: [
          { number: 94, title: 'Binary Tree Inorder Traversal', url: 'https://leetcode.com/problems/binary-tree-inorder-traversal/', difficulty: 'Easy' },
          { number: 230, title: 'Kth Smallest Element in a BST', url: 'https://leetcode.com/problems/kth-smallest-element-in-a-bst/', difficulty: 'Medium' },
          { number: 98, title: 'Validate Binary Search Tree', url: 'https://leetcode.com/problems/validate-binary-search-tree/', difficulty: 'Medium' },
          { number: 173, title: 'Binary Search Tree Iterator', url: 'https://leetcode.com/problems/binary-search-tree-iterator/', difficulty: 'Medium' },
        ]
      }
    },

    {
      id: 'problems3',
      type: 'problem',
      position: { x: -25, y: 900 }, // Adjusted for center alignment
      data: {
        problems: [
          { number: 145, title: 'Binary Tree Postorder Traversal', url: 'https://leetcode.com/problems/binary-tree-postorder-traversal/', difficulty: 'Easy' },
          { number: 590, title: 'N-ary Tree Postorder Traversal', url: 'https://leetcode.com/problems/n-ary-tree-postorder-traversal/', difficulty: 'Easy' },
          { number: 1120, title: 'Maximum Average Subtree', url: 'https://leetcode.com/problems/maximum-average-subtree/', difficulty: 'Medium' },
          { number: 366, title: 'Find Leaves of Binary Tree', url: 'https://leetcode.com/problems/find-leaves-of-binary-tree/', difficulty: 'Medium' },
        ]
      }
    },

    {
      id: 'problems4',
      type: 'problem',
      position: { x: 175, y: 900 }, // Adjusted for center alignment
      data: {
        problems: [
          { number: 102, title: 'Binary Tree Level Order Traversal', url: 'https://leetcode.com/problems/binary-tree-level-order-traversal/', difficulty: 'Medium' },
          { number: 103, title: 'Binary Tree Zigzag Level Order Traversal', url: 'https://leetcode.com/problems/binary-tree-zigzag-level-order-traversal/', difficulty: 'Medium' },
          { number: 107, title: 'Binary Tree Level Order Traversal II', url: 'https://leetcode.com/problems/binary-tree-level-order-traversal-ii/', difficulty: 'Medium' },
          { number: 429, title: 'N-ary Tree Level Order Traversal', url: 'https://leetcode.com/problems/n-ary-tree-level-order-traversal/', difficulty: 'Medium' },
        ]
      }
    },

    {
      id: 'problems5',
      type: 'problem',
      position: { x: 375, y: 740 }, // Adjusted for center alignment
      data: {
        problems: [
          { number: 99, title: 'Recover Binary Search Tree', url: 'https://leetcode.com/problems/recover-binary-search-tree/', difficulty: 'Medium' },
          { number: 116, title: 'Populating Next Right Pointers in Each Node', url: 'https://leetcode.com/problems/populating-next-right-pointers-in-each-node/', difficulty: 'Medium' },
          { number: 117, title: 'Populating Next Right Pointers in Each Node II', url: 'https://leetcode.com/problems/populating-next-right-pointers-in-each-node-ii/', difficulty: 'Medium' },
          { number: 156, title: 'Binary Tree Upside Down', url: 'https://leetcode.com/problems/binary-tree-upside-down/', difficulty: 'Medium' },
        ]
      }
    },

    {
      id: 'problems6',
      type: 'problem',
      position: { x: 575, y: 740 }, // Adjusted for center alignment
      data: {
        problems: [
          { number: 104, title: 'Maximum Depth of Binary Tree', url: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/', difficulty: 'Easy' },
          { number: 144, title: 'Binary Tree Preorder Traversal', url: 'https://leetcode.com/problems/binary-tree-preorder-traversal/', difficulty: 'Easy' },
          { number: 94, title: 'Binary Tree Inorder Traversal', url: 'https://leetcode.com/problems/binary-tree-inorder-traversal/', difficulty: 'Easy' },
          { number: 145, title: 'Binary Tree Postorder Traversal', url: 'https://leetcode.com/problems/binary-tree-postorder-traversal/', difficulty: 'Easy' },
        ]
      }
    },

    {
      id: 'problems7',
      type: 'problem',
      position: { x: 475, y: 600 }, // Adjusted for center alignment
      data: {
        problems: [
          { number: 105, title: 'Construct Binary Tree from Preorder and Inorder Traversal', url: 'https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/', difficulty: 'Medium' },
          { number: 106, title: 'Construct Binary Tree from Inorder and Postorder Traversal', url: 'https://leetcode.com/problems/construct-binary-tree-from-inorder-and-postorder-traversal/', difficulty: 'Medium' },
          { number: 889, title: 'Construct Binary Tree from Preorder and Postorder Traversal', url: 'https://leetcode.com/problems/construct-binary-tree-from-preorder-and-postorder-traversal/', difficulty: 'Medium' },
          { number: 108, title: 'Convert Sorted Array to Binary Search Tree', url: 'https://leetcode.com/problems/convert-sorted-array-to-binary-search-tree/', difficulty: 'Easy' },
        ]
      }
    },

    {
      id: 'problems8',
      type: 'problem',
      position: { x: 875, y: 740 }, // Adjusted for center alignment
      data: {
        problems: [
          { number: 297, title: 'Serialize and Deserialize Binary Tree', url: 'https://leetcode.com/problems/serialize-and-deserialize-binary-tree/', difficulty: 'Hard' },
          { number: 449, title: 'Serialize and Deserialize BST', url: 'https://leetcode.com/problems/serialize-and-deserialize-bst/', difficulty: 'Medium' },
          { number: 428, title: 'Serialize and Deserialize N-ary Tree', url: 'https://leetcode.com/problems/serialize-and-deserialize-n-ary-tree/', difficulty: 'Hard' },
          { number: 331, title: 'Verify Preorder Serialization of a Binary Tree', url: 'https://leetcode.com/problems/verify-preorder-serialization-of-a-binary-tree/', difficulty: 'Medium' },
        ]
      }
    },

    {
      id: 'problems9',
      type: 'problem',
      position: { x: 975, y: 740 }, // Adjusted for center alignment
      data: {
        problems: [
          { number: 98, title: 'Validate Binary Search Tree', url: 'https://leetcode.com/problems/validate-binary-search-tree/', difficulty: 'Medium' },
          { number: 700, title: 'Search in a Binary Search Tree', url: 'https://leetcode.com/problems/search-in-a-binary-search-tree/', difficulty: 'Easy' },
          { number: 701, title: 'Insert into a Binary Search Tree', url: 'https://leetcode.com/problems/insert-into-a-binary-search-tree/', difficulty: 'Medium' },
          { number: 450, title: 'Delete Node in a BST', url: 'https://leetcode.com/problems/delete-node-in-a-bst/', difficulty: 'Medium' },
        ]
      }
    },

    {
      id: 'problems10',
      type: 'problem',
      position: { x: 1175, y: 740 }, // Adjusted for center alignment
      data: {
        problems: [
          { number: 104, title: 'Maximum Depth of Binary Tree', url: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/', difficulty: 'Easy' },
          { number: 111, title: 'Minimum Depth of Binary Tree', url: 'https://leetcode.com/problems/minimum-depth-of-binary-tree/', difficulty: 'Easy' },
          { number: 543, title: 'Diameter of Binary Tree', url: 'https://leetcode.com/problems/diameter-of-binary-tree/', difficulty: 'Easy' },
          { number: 110, title: 'Balanced Binary Tree', url: 'https://leetcode.com/problems/balanced-binary-tree/', difficulty: 'Easy' },
        ]
      }
    },

    {
      id: 'problems11',
      type: 'problem',
      position: { x: 1375, y: 740 }, // Adjusted for center alignment
      data: {
        problems: [
          { number: 236, title: 'Lowest Common Ancestor of a Binary Tree', url: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/', difficulty: 'Medium' },
          { number: 235, title: 'Lowest Common Ancestor of a Binary Search Tree', url: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/', difficulty: 'Easy' },
          { number: 1644, title: 'Lowest Common Ancestor of a Binary Tree II', url: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree-ii/', difficulty: 'Medium' },
          { number: 1650, title: 'Lowest Common Ancestor of a Binary Tree III', url: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree-iii/', difficulty: 'Medium' },
        ]
      }
    },

    {
      id: 'problems12',
      type: 'problem',
      position: { x: 1575, y: 740 }, // Adjusted for center alignment
      data: {
        problems: [
          { number: 112, title: 'Path Sum', url: 'https://leetcode.com/problems/path-sum/', difficulty: 'Easy' },
          { number: 113, title: 'Path Sum II', url: 'https://leetcode.com/problems/path-sum-ii/', difficulty: 'Medium' },
          { number: 437, title: 'Path Sum III', url: 'https://leetcode.com/problems/path-sum-iii/', difficulty: 'Medium' },
          { number: 124, title: 'Binary Tree Maximum Path Sum', url: 'https://leetcode.com/problems/binary-tree-maximum-path-sum/', difficulty: 'Hard' },
        ]
      }
    },

    {
      id: 'problems13',
      type: 'problem',
      position: { x: 775, y: 900 }, // Adjusted for center alignment
      data: {
        problems: [
          { number: 337, title: 'House Robber III', url: 'https://leetcode.com/problems/house-robber-iii/', difficulty: 'Medium' },
          { number: 968, title: 'Binary Tree Cameras', url: 'https://leetcode.com/problems/binary-tree-cameras/', difficulty: 'Hard' },
          { number: 124, title: 'Binary Tree Maximum Path Sum', url: 'https://leetcode.com/problems/binary-tree-maximum-path-sum/', difficulty: 'Hard' },
          { number: 1372, title: 'Longest ZigZag Path in a Binary Tree', url: 'https://leetcode.com/problems/longest-zigzag-path-in-a-binary-tree/', difficulty: 'Medium' },
        ]
      }
    },

    {
      id: 'problems14',
      type: 'problem',
      position: { x: 975, y: 900 }, // Adjusted for center alignment
      data: {
        problems: [
          { number: 101, title: 'Symmetric Tree', url: 'https://leetcode.com/problems/symmetric-tree/', difficulty: 'Easy' },
          { number: 226, title: 'Invert Binary Tree', url: 'https://leetcode.com/problems/invert-binary-tree/', difficulty: 'Easy' },
          { number: 951, title: 'Flip Equivalent Binary Trees', url: 'https://leetcode.com/problems/flip-equivalent-binary-trees/', difficulty: 'Medium' },
          { number: 1367, title: 'Linked List in Binary Tree', url: 'https://leetcode.com/problems/linked-list-in-binary-tree/', difficulty: 'Medium' },
        ]
      }
    },

    {
      id: 'problems15',
      type: 'problem',
      position: { x: 1175, y: 900 }, // Adjusted for center alignment
      data: {
        problems: [
          { number: 572, title: 'Subtree of Another Tree', url: 'https://leetcode.com/problems/subtree-of-another-tree/', difficulty: 'Easy' },
          { number: 100, title: 'Same Tree', url: 'https://leetcode.com/problems/same-tree/', difficulty: 'Easy' },
          { number: 1367, title: 'Linked List in Binary Tree', url: 'https://leetcode.com/problems/linked-list-in-binary-tree/', difficulty: 'Medium' },
          { number: 1490, title: 'Clone N-ary Tree', url: 'https://leetcode.com/problems/clone-n-ary-tree/', difficulty: 'Medium' },
        ]
      }
    },
  ],
  
  edges: [
    // Root to Level 1
    { id: 'e1', source: 'root', target: 'operation-type', animated: true },
    
    // Level 1 to Level 2
    { id: 'e2', source: 'operation-type', sourceHandle: 'yes', target: 'traversal-type', label: 'Traversal', style: { stroke: '#10b981' } },
    { id: 'e3', source: 'operation-type', sourceHandle: 'no', target: 'construction-type', label: 'Construction', style: { stroke: '#ef4444' } },
    
    // Additional branches
    { id: 'e3b', source: 'construction-type', sourceHandle: 'no', target: 'validation-type', label: 'Validation', style: { stroke: '#ef4444' } },
    { id: 'e3c', source: 'validation-type', sourceHandle: 'no', target: 'search-path-type', label: 'Search/Path', style: { stroke: '#ef4444' } },
    
    // Level 2 to Level 3
    { id: 'e4', source: 'traversal-type', sourceHandle: 'yes', target: 'dfs-order', label: 'DFS', style: { stroke: '#10b981' } },
    { id: 'e5', source: 'traversal-type', sourceHandle: 'no', target: 'space-constraint', label: 'BFS/Special', style: { stroke: '#ef4444' } },
    { id: 'e6', source: 'construction-type', sourceHandle: 'yes', target: 'leaf7', label: 'Yes', style: { stroke: '#10b981' } },
    { id: 'e7', source: 'validation-type', sourceHandle: 'yes', target: 'tree-structure', label: 'Tree Props', style: { stroke: '#10b981' } },
    { id: 'e8', source: 'search-path-type', sourceHandle: 'yes', target: 'path-type', label: 'Paths', style: { stroke: '#10b981' } },
    
    // Level 3 to Leaves
    { id: 'e9', source: 'dfs-order', sourceHandle: 'yes', target: 'leaf1', label: 'Preorder', style: { stroke: '#10b981' } },
    { id: 'e10', source: 'dfs-order', sourceHandle: 'no', target: 'leaf2', label: 'Inorder', style: { stroke: '#ef4444' } },
    { id: 'e11', source: 'space-constraint', sourceHandle: 'yes', target: 'leaf5', label: 'O(1) Space', style: { stroke: '#10b981' } },
    { id: 'e12', source: 'space-constraint', sourceHandle: 'no', target: 'leaf4', label: 'Normal', style: { stroke: '#ef4444' } },
    { id: 'e13', source: 'tree-structure', sourceHandle: 'yes', target: 'leaf9', label: 'BST', style: { stroke: '#10b981' } },
    { id: 'e14', source: 'tree-structure', sourceHandle: 'no', target: 'leaf10', label: 'General', style: { stroke: '#ef4444' } },
    { id: 'e15', source: 'path-type', sourceHandle: 'yes', target: 'leaf12', label: 'Yes', style: { stroke: '#10b981' } },
    { id: 'e16', source: 'path-type', sourceHandle: 'no', target: 'leaf11', label: 'No (LCA)', style: { stroke: '#ef4444' } },
    
    // Additional connections
    { id: 'e17', source: 'dfs-order', target: 'leaf3', label: 'Postorder', style: { stroke: '#8b5cf6' } },
    { id: 'e18', source: 'space-constraint', target: 'leaf6', label: 'Iterative', style: { stroke: '#8b5cf6' } },
    { id: 'e19', source: 'construction-type', target: 'leaf8', label: 'Serialize', style: { stroke: '#8b5cf6' } },
    { id: 'e20', source: 'validation-type', target: 'leaf14', label: 'Symmetric', style: { stroke: '#8b5cf6' } },
    { id: 'e21', source: 'search-path-type', target: 'leaf13', label: 'DP', style: { stroke: '#8b5cf6' } },
    { id: 'e22', source: 'search-path-type', target: 'leaf15', label: 'Subtree', style: { stroke: '#8b5cf6' } },
    
    // Leaf nodes to Problem nodes
    { id: 'e23', source: 'leaf1', target: 'problems1', style: { stroke: '#f97316' } },
    { id: 'e24', source: 'leaf2', target: 'problems2', style: { stroke: '#f97316' } },
    { id: 'e25', source: 'leaf3', target: 'problems3', style: { stroke: '#f97316' } },
    { id: 'e26', source: 'leaf4', target: 'problems4', style: { stroke: '#f97316' } },
    { id: 'e27', source: 'leaf5', target: 'problems5', style: { stroke: '#f97316' } },
    { id: 'e28', source: 'leaf6', target: 'problems6', style: { stroke: '#f97316' } },
    { id: 'e29', source: 'leaf7', target: 'problems7', style: { stroke: '#f97316' } },
    { id: 'e30', source: 'leaf8', target: 'problems8', style: { stroke: '#f97316' } },
    { id: 'e31', source: 'leaf9', target: 'problems9', style: { stroke: '#f97316' } },
    { id: 'e32', source: 'leaf10', target: 'problems10', style: { stroke: '#f97316' } },
    { id: 'e33', source: 'leaf11', target: 'problems11', style: { stroke: '#f97316' } },
    { id: 'e34', source: 'leaf12', target: 'problems12', style: { stroke: '#f97316' } },
    { id: 'e35', source: 'leaf13', target: 'problems13', style: { stroke: '#f97316' } },
    { id: 'e36', source: 'leaf14', target: 'problems14', style: { stroke: '#f97316' } },
    { id: 'e37', source: 'leaf15', target: 'problems15', style: { stroke: '#f97316' } },
  ]
}

// Algorithm Approach Data (how to solve it?)
const algorithmApproachData = {
  nodes: [
    // Root
    {
      id: 'root',
      type: 'root',
      position: { x: 800, y: 50 }, // Adjusted for center alignment
      data: { label: 'Binary Tree Algorithms by Approach' }
    },
    
    // Level 1: Main algorithmic approaches
    {
      id: 'approach-type',
      type: 'decision',
      position: { x: 650, y: 180 }, // Adjusted for center alignment
      data: { 
        label: 'What algorithmic approach do you need?',
        tooltip: 'Different algorithmic strategies for tree problems'
      }
    },

    // Level 2A: DFS-based approaches
    {
      id: 'dfs-strategy',
      type: 'decision',
      position: { x: 300, y: 320 }, // Adjusted for center alignment
      data: { 
        label: 'What type of DFS strategy?',
        tooltip: 'Recursive vs iterative DFS implementations'
      }
    },

    // Level 2B: BFS-based approaches
    {
      id: 'bfs-strategy',
      type: 'decision',
      position: { x: 650, y: 320 }, // Adjusted for center alignment
      data: { 
        label: 'Do you need level-wise processing?',
        tooltip: 'BFS for level-order vs general breadth-first operations'
      }
    },

    // Level 2C: Dynamic Programming approaches
    {
      id: 'dp-strategy',
      type: 'decision',
      position: { x: 1050, y: 320 }, // Adjusted for center alignment
      data: { 
        label: 'Do you need optimization across subtrees?',
        tooltip: 'Tree DP for optimization problems'
      }
    },

    // Level 2D: Special techniques
    {
      id: 'special-strategy',
      type: 'decision',
      position: { x: 1450, y: 320 }, // Adjusted for center alignment
      data: { 
        label: 'Do you need space optimization?',
        tooltip: 'Morris traversal and other space-efficient techniques'
      }
    },

    // Level 3: Further refinement
    {
      id: 'recursive-type',
      type: 'decision',
      position: { x: 200, y: 460 },
      data: { 
        label: 'What recursive pattern?',
        tooltip: 'Different recursive traversal patterns'
      }
    },

    {
      id: 'iterative-type',
      type: 'decision',
      position: { x: 600, y: 460 },
      data: { 
        label: 'Do you need explicit stack control?',
        tooltip: 'Stack-based iterative vs queue-based approaches'
      }
    },

    {
      id: 'level-processing',
      type: 'decision',
      position: { x: 800, y: 460 },
      data: { 
        label: 'Do you need level-by-level results?',
        tooltip: 'Level order with grouping vs simple BFS'
      }
    },

    {
      id: 'optimization-type',
      type: 'decision',
      position: { x: 1200, y: 460 },
      data: { 
        label: 'What type of optimization?',
        tooltip: 'Path optimization vs subtree optimization'
      }
    },

    // Algorithm Leaf Nodes (organized by approach)
    {
      id: 'alg-leaf1',
      type: 'leaf',
      position: { x: 100, y: 600 },
      data: {
        technique: 'Recursive DFS (Preorder)',
        approach: 'Top-down recursive traversal',
        complexity: 'O(n) time, O(h) space',
        useCases: 'Tree copying, path finding, node processing'
      }
    },

    {
      id: 'alg-leaf2',
      type: 'leaf',
      position: { x: 300, y: 600 },
      data: {
        technique: 'Recursive DFS (Inorder)',
        approach: 'Left-root-right recursive pattern',
        complexity: 'O(n) time, O(h) space',
        useCases: 'BST operations, sorted output, validation'
      }
    },

    {
      id: 'alg-leaf3',
      type: 'leaf',
      position: { x: 100, y: 760 },
      data: {
        technique: 'Recursive DFS (Postorder)',
        approach: 'Bottom-up recursive processing',
        complexity: 'O(n) time, O(h) space',
        useCases: 'Tree deletion, size calculation, bottom-up DP'
      }
    },

    {
      id: 'alg-leaf4',
      type: 'leaf',
      position: { x: 500, y: 600 },
      data: {
        technique: 'Iterative DFS (Stack)',
        approach: 'Explicit stack for traversal',
        complexity: 'O(n) time, O(h) space',
        useCases: 'Avoiding recursion, custom traversal order'
      }
    },

    {
      id: 'alg-leaf5',
      type: 'leaf',
      position: { x: 700, y: 600 },
      data: {
        technique: 'Two-Pointer Tree Techniques',
        approach: 'Parent pointers and node relationships',
        complexity: 'O(n) time, O(1) extra space',
        useCases: 'LCA with parent pointers, tree threading'
      }
    },

    {
      id: 'alg-leaf6',
      type: 'leaf',
      position: { x: 800, y: 600 },
      data: {
        technique: 'BFS Level Order',
        approach: 'Queue-based level-by-level processing',
        complexity: 'O(n) time, O(w) space',
        useCases: 'Level order traversal, width calculations'
      }
    },

    {
      id: 'alg-leaf7',
      type: 'leaf',
      position: { x: 900, y: 760 },
      data: {
        technique: 'BFS with Level Grouping',
        approach: 'Queue with level separation',
        complexity: 'O(n) time, O(w) space',
        useCases: 'Level-wise results, zigzag traversal'
      }
    },

    {
      id: 'alg-leaf8',
      type: 'leaf',
      position: { x: 1100, y: 600 },
      data: {
        technique: 'Tree DP (Bottom-up)',
        approach: 'Dynamic programming from leaves to root',
        complexity: 'O(n) time, O(h) space',
        useCases: 'House robber, tree cameras, path optimization'
      }
    },

    {
      id: 'alg-leaf9',
      type: 'leaf',
      position: { x: 1300, y: 600 },
      data: {
        technique: 'Tree DP (Top-down)',
        approach: 'Memoized recursion with state passing',
        complexity: 'O(n) time, O(n) space',
        useCases: 'Path sum problems, state-dependent optimization'
      }
    },

    {
      id: 'alg-leaf10',
      type: 'leaf',
      position: { x: 1500, y: 600 },
      data: {
        technique: 'Morris Traversal',
        approach: 'Threaded binary tree traversal',
        complexity: 'O(n) time, O(1) space',
        useCases: 'Space-optimized inorder/preorder traversal'
      }
    },

    {
      id: 'alg-leaf11',
      type: 'leaf',
      position: { x: 1700, y: 600 },
      data: {
        technique: 'Divide and Conquer',
        approach: 'Split problem into subproblems',
        complexity: 'O(n) time, O(h) space',
        useCases: 'Tree construction, balanced operations'
      }
    },

    {
      id: 'alg-leaf12',
      type: 'leaf',
      position: { x: 300, y: 760 },
      data: {
        technique: 'Backtracking on Trees',
        approach: 'DFS with path tracking and backtracking',
        complexity: 'O(n*h) time, O(h) space',
        useCases: 'All paths, path sum variations'
      }
    },

    {
      id: 'alg-leaf13',
      type: 'leaf',
      position: { x: 500, y: 760 },
      data: {
        technique: 'Tree Serialization',
        approach: 'Convert tree structure to linear format',
        complexity: 'O(n) time, O(n) space',
        useCases: 'Tree storage, comparison, transmission'
      }
    },

    {
      id: 'alg-leaf14',
      type: 'leaf',
      position: { x: 700, y: 760 },
      data: {
        technique: 'Binary Search on Trees',
        approach: 'Leverage BST properties for search',
        complexity: 'O(log n) to O(n) time, O(h) space',
        useCases: 'BST operations, range queries'
      }
    },

    {
      id: 'alg-leaf15',
      type: 'leaf',
      position: { x: 1100, y: 760 },
      data: {
        technique: 'Tree Reconstruction',
        approach: 'Build tree from traversal sequences',
        complexity: 'O(n) time, O(n) space',
        useCases: 'Tree building from arrays, parsing'
      }
    },

    // Algorithm approach problem nodes
    {
      id: 'alg-problems1',
      type: 'problem',
      position: { x: 100, y: 740 },
      data: {
        problems: [
          { number: 144, title: 'Binary Tree Preorder Traversal', url: 'https://leetcode.com/problems/binary-tree-preorder-traversal/', difficulty: 'Easy' },
          { number: 589, title: 'N-ary Tree Preorder Traversal', url: 'https://leetcode.com/problems/n-ary-tree-preorder-traversal/', difficulty: 'Easy' },
          { number: 257, title: 'Binary Tree Paths', url: 'https://leetcode.com/problems/binary-tree-paths/', difficulty: 'Easy' },
          { number: 129, title: 'Sum Root to Leaf Numbers', url: 'https://leetcode.com/problems/sum-root-to-leaf-numbers/', difficulty: 'Medium' },
        ]
      }
    },

    {
      id: 'alg-problems2',
      type: 'problem',
      position: { x: 300, y: 740 },
      data: {
        problems: [
          { number: 94, title: 'Binary Tree Inorder Traversal', url: 'https://leetcode.com/problems/binary-tree-inorder-traversal/', difficulty: 'Easy' },
          { number: 230, title: 'Kth Smallest Element in a BST', url: 'https://leetcode.com/problems/kth-smallest-element-in-a-bst/', difficulty: 'Medium' },
          { number: 98, title: 'Validate Binary Search Tree', url: 'https://leetcode.com/problems/validate-binary-search-tree/', difficulty: 'Medium' },
          { number: 285, title: 'Inorder Successor in BST', url: 'https://leetcode.com/problems/inorder-successor-in-bst/', difficulty: 'Medium' },
        ]
      }
    },

    {
      id: 'alg-problems3',
      type: 'problem',
      position: { x: 100, y: 900 },
      data: {
        problems: [
          { number: 145, title: 'Binary Tree Postorder Traversal', url: 'https://leetcode.com/problems/binary-tree-postorder-traversal/', difficulty: 'Easy' },
          { number: 104, title: 'Maximum Depth of Binary Tree', url: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/', difficulty: 'Easy' },
          { number: 543, title: 'Diameter of Binary Tree', url: 'https://leetcode.com/problems/diameter-of-binary-tree/', difficulty: 'Easy' },
          { number: 110, title: 'Balanced Binary Tree', url: 'https://leetcode.com/problems/balanced-binary-tree/', difficulty: 'Easy' },
        ]
      }
    },

    {
      id: 'alg-problems4',
      type: 'problem',
      position: { x: 500, y: 740 },
      data: {
        problems: [
          { number: 103, title: 'Binary Tree Zigzag Level Order Traversal', url: 'https://leetcode.com/problems/binary-tree-zigzag-level-order-traversal/', difficulty: 'Medium' },
          { number: 173, title: 'Binary Search Tree Iterator', url: 'https://leetcode.com/problems/binary-search-tree-iterator/', difficulty: 'Medium' },
          { number: 150, title: 'Evaluate Reverse Polish Notation', url: 'https://leetcode.com/problems/evaluate-reverse-polish-notation/', difficulty: 'Medium' },
          { number: 1008, title: 'Construct Binary Search Tree from Preorder Traversal', url: 'https://leetcode.com/problems/construct-binary-search-tree-from-preorder-traversal/', difficulty: 'Medium' },
        ]
      }
    },

    {
      id: 'alg-problems5',
      type: 'problem',
      position: { x: 700, y: 740 },
      data: {
        problems: [
          { number: 1650, title: 'Lowest Common Ancestor of a Binary Tree III', url: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree-iii/', difficulty: 'Medium' },
          { number: 1123, title: 'Lowest Common Ancestor of Deepest Leaves', url: 'https://leetcode.com/problems/lowest-common-ancestor-of-deepest-leaves/', difficulty: 'Medium' },
          { number: 116, title: 'Populating Next Right Pointers in Each Node', url: 'https://leetcode.com/problems/populating-next-right-pointers-in-each-node/', difficulty: 'Medium' },
          { number: 117, title: 'Populating Next Right Pointers in Each Node II', url: 'https://leetcode.com/problems/populating-next-right-pointers-in-each-node-ii/', difficulty: 'Medium' },
        ]
      }
    },

    {
      id: 'alg-problems6',
      type: 'problem',
      position: { x: 800, y: 740 },
      data: {
        problems: [
          { number: 102, title: 'Binary Tree Level Order Traversal', url: 'https://leetcode.com/problems/binary-tree-level-order-traversal/', difficulty: 'Medium' },
          { number: 199, title: 'Binary Tree Right Side View', url: 'https://leetcode.com/problems/binary-tree-right-side-view/', difficulty: 'Medium' },
          { number: 515, title: 'Find Largest Value in Each Tree Row', url: 'https://leetcode.com/problems/find-largest-value-in-each-tree-row/', difficulty: 'Medium' },
          { number: 637, title: 'Average of Levels in Binary Tree', url: 'https://leetcode.com/problems/average-of-levels-in-binary-tree/', difficulty: 'Easy' },
        ]
      }
    },

    {
      id: 'alg-problems7',
      type: 'problem',
      position: { x: 900, y: 900 },
      data: {
        problems: [
          { number: 107, title: 'Binary Tree Level Order Traversal II', url: 'https://leetcode.com/problems/binary-tree-level-order-traversal-ii/', difficulty: 'Medium' },
          { number: 314, title: 'Binary Tree Vertical Order Traversal', url: 'https://leetcode.com/problems/binary-tree-vertical-order-traversal/', difficulty: 'Medium' },
          { number: 987, title: 'Vertical Order Traversal of a Binary Tree', url: 'https://leetcode.com/problems/vertical-order-traversal-of-a-binary-tree/', difficulty: 'Hard' },
          { number: 429, title: 'N-ary Tree Level Order Traversal', url: 'https://leetcode.com/problems/n-ary-tree-level-order-traversal/', difficulty: 'Medium' },
        ]
      }
    },

    {
      id: 'alg-problems8',
      type: 'problem',
      position: { x: 1100, y: 740 },
      data: {
        problems: [
          { number: 337, title: 'House Robber III', url: 'https://leetcode.com/problems/house-robber-iii/', difficulty: 'Medium' },
          { number: 968, title: 'Binary Tree Cameras', url: 'https://leetcode.com/problems/binary-tree-cameras/', difficulty: 'Hard' },
          { number: 1130, title: 'Minimum Cost Tree From Leaf Values', url: 'https://leetcode.com/problems/minimum-cost-tree-from-leaf-values/', difficulty: 'Medium' },
          { number: 1339, title: 'Maximum Product of Splitted Binary Tree', url: 'https://leetcode.com/problems/maximum-product-of-splitted-binary-tree/', difficulty: 'Medium' },
        ]
      }
    },

    {
      id: 'alg-problems9',
      type: 'problem',
      position: { x: 1300, y: 740 },
      data: {
        problems: [
          { number: 437, title: 'Path Sum III', url: 'https://leetcode.com/problems/path-sum-iii/', difficulty: 'Medium' },
          { number: 124, title: 'Binary Tree Maximum Path Sum', url: 'https://leetcode.com/problems/binary-tree-maximum-path-sum/', difficulty: 'Hard' },
          { number: 1372, title: 'Longest ZigZag Path in a Binary Tree', url: 'https://leetcode.com/problems/longest-zigzag-path-in-a-binary-tree/', difficulty: 'Medium' },
          { number: 687, title: 'Longest Univalue Path', url: 'https://leetcode.com/problems/longest-univalue-path/', difficulty: 'Medium' },
        ]
      }
    },

    {
      id: 'alg-problems10',
      type: 'problem',
      position: { x: 1500, y: 740 },
      data: {
        problems: [
          { number: 99, title: 'Recover Binary Search Tree', url: 'https://leetcode.com/problems/recover-binary-search-tree/', difficulty: 'Medium' },
          { number: 501, title: 'Find Mode in Binary Search Tree', url: 'https://leetcode.com/problems/find-mode-in-binary-search-tree/', difficulty: 'Easy' },
          { number: 530, title: 'Minimum Absolute Difference in BST', url: 'https://leetcode.com/problems/minimum-absolute-difference-in-bst/', difficulty: 'Easy' },
          { number: 783, title: 'Minimum Distance Between BST Nodes', url: 'https://leetcode.com/problems/minimum-distance-between-bst-nodes/', difficulty: 'Easy' },
        ]
      }
    },

    {
      id: 'alg-problems11',
      type: 'problem',
      position: { x: 1700, y: 740 },
      data: {
        problems: [
          { number: 105, title: 'Construct Binary Tree from Preorder and Inorder Traversal', url: 'https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/', difficulty: 'Medium' },
          { number: 106, title: 'Construct Binary Tree from Inorder and Postorder Traversal', url: 'https://leetcode.com/problems/construct-binary-tree-from-inorder-and-postorder-traversal/', difficulty: 'Medium' },
          { number: 108, title: 'Convert Sorted Array to Binary Search Tree', url: 'https://leetcode.com/problems/convert-sorted-array-to-binary-search-tree/', difficulty: 'Easy' },
          { number: 109, title: 'Convert Sorted List to Binary Search Tree', url: 'https://leetcode.com/problems/convert-sorted-list-to-binary-search-tree/', difficulty: 'Medium' },
        ]
      }
    },

    {
      id: 'alg-problems12',
      type: 'problem',
      position: { x: 300, y: 900 },
      data: {
        problems: [
          { number: 113, title: 'Path Sum II', url: 'https://leetcode.com/problems/path-sum-ii/', difficulty: 'Medium' },
          { number: 257, title: 'Binary Tree Paths', url: 'https://leetcode.com/problems/binary-tree-paths/', difficulty: 'Easy' },
          { number: 988, title: 'Smallest String Starting From Leaf', url: 'https://leetcode.com/problems/smallest-string-starting-from-leaf/', difficulty: 'Medium' },
          { number: 1022, title: 'Sum of Root To Leaf Binary Numbers', url: 'https://leetcode.com/problems/sum-of-root-to-leaf-binary-numbers/', difficulty: 'Easy' },
        ]
      }
    },

    {
      id: 'alg-problems13',
      type: 'problem',
      position: { x: 500, y: 900 },
      data: {
        problems: [
          { number: 297, title: 'Serialize and Deserialize Binary Tree', url: 'https://leetcode.com/problems/serialize-and-deserialize-binary-tree/', difficulty: 'Hard' },
          { number: 449, title: 'Serialize and Deserialize BST', url: 'https://leetcode.com/problems/serialize-and-deserialize-bst/', difficulty: 'Medium' },
          { number: 428, title: 'Serialize and Deserialize N-ary Tree', url: 'https://leetcode.com/problems/serialize-and-deserialize-n-ary-tree/', difficulty: 'Hard' },
          { number: 331, title: 'Verify Preorder Serialization of a Binary Tree', url: 'https://leetcode.com/problems/verify-preorder-serialization-of-a-binary-tree/', difficulty: 'Medium' },
        ]
      }
    },

    {
      id: 'alg-problems14',
      type: 'problem',
      position: { x: 700, y: 900 },
      data: {
        problems: [
          { number: 700, title: 'Search in a Binary Search Tree', url: 'https://leetcode.com/problems/search-in-a-binary-search-tree/', difficulty: 'Easy' },
          { number: 701, title: 'Insert into a Binary Search Tree', url: 'https://leetcode.com/problems/insert-into-a-binary-search-tree/', difficulty: 'Medium' },
          { number: 450, title: 'Delete Node in a BST', url: 'https://leetcode.com/problems/delete-node-in-a-bst/', difficulty: 'Medium' },
          { number: 669, title: 'Trim a Binary Search Tree', url: 'https://leetcode.com/problems/trim-a-binary-search-tree/', difficulty: 'Medium' },
        ]
      }
    },

    {
      id: 'alg-problems15',
      type: 'problem',
      position: { x: 1100, y: 900 },
      data: {
        problems: [
          { number: 889, title: 'Construct Binary Tree from Preorder and Postorder Traversal', url: 'https://leetcode.com/problems/construct-binary-tree-from-preorder-and-postorder-traversal/', difficulty: 'Medium' },
          { number: 654, title: 'Maximum Binary Tree', url: 'https://leetcode.com/problems/maximum-binary-tree/', difficulty: 'Medium' },
          { number: 998, title: 'Maximum Binary Tree II', url: 'https://leetcode.com/problems/maximum-binary-tree-ii/', difficulty: 'Medium' },
          { number: 1008, title: 'Construct Binary Search Tree from Preorder Traversal', url: 'https://leetcode.com/problems/construct-binary-search-tree-from-preorder-traversal/', difficulty: 'Medium' },
        ]
      }
    },
  ],
  
  edges: [
    // Root to Level 1
    { id: 'alg-e1', source: 'root', target: 'approach-type', animated: true },
    
    // Level 1 to Level 2
    { id: 'alg-e2', source: 'approach-type', sourceHandle: 'yes', target: 'dfs-strategy', label: 'DFS', style: { stroke: '#10b981' } },
    { id: 'alg-e3', source: 'approach-type', sourceHandle: 'no', target: 'bfs-strategy', label: 'BFS', style: { stroke: '#ef4444' } },
    
    // Additional branches
    { id: 'alg-e3b', source: 'bfs-strategy', sourceHandle: 'no', target: 'dp-strategy', label: 'DP', style: { stroke: '#ef4444' } },
    { id: 'alg-e3c', source: 'dp-strategy', sourceHandle: 'no', target: 'special-strategy', label: 'Special', style: { stroke: '#ef4444' } },
    
    // Level 2 to Level 3
    { id: 'alg-e4', source: 'dfs-strategy', sourceHandle: 'yes', target: 'recursive-type', label: 'Recursive', style: { stroke: '#10b981' } },
    { id: 'alg-e5', source: 'dfs-strategy', sourceHandle: 'no', target: 'iterative-type', label: 'Iterative', style: { stroke: '#ef4444' } },
    { id: 'alg-e6', source: 'bfs-strategy', sourceHandle: 'yes', target: 'level-processing', label: 'Yes', style: { stroke: '#10b981' } },
    { id: 'alg-e7', source: 'dp-strategy', sourceHandle: 'yes', target: 'optimization-type', label: 'Yes', style: { stroke: '#10b981' } },
    
    // Level 3 to Leaves
    { id: 'alg-e8', source: 'recursive-type', sourceHandle: 'yes', target: 'alg-leaf1', label: 'Preorder', style: { stroke: '#10b981' } },
    { id: 'alg-e9', source: 'recursive-type', sourceHandle: 'no', target: 'alg-leaf2', label: 'Inorder', style: { stroke: '#ef4444' } },
    { id: 'alg-e10', source: 'iterative-type', sourceHandle: 'yes', target: 'alg-leaf4', label: 'Stack', style: { stroke: '#10b981' } },
    { id: 'alg-e11', source: 'iterative-type', sourceHandle: 'no', target: 'alg-leaf5', label: 'Two-Pointer', style: { stroke: '#ef4444' } },
    { id: 'alg-e12', source: 'level-processing', sourceHandle: 'yes', target: 'alg-leaf7', label: 'Grouped', style: { stroke: '#10b981' } },
    { id: 'alg-e13', source: 'level-processing', sourceHandle: 'no', target: 'alg-leaf6', label: 'Simple', style: { stroke: '#ef4444' } },
    { id: 'alg-e14', source: 'optimization-type', sourceHandle: 'yes', target: 'alg-leaf8', label: 'Bottom-up', style: { stroke: '#10b981' } },
    { id: 'alg-e15', source: 'optimization-type', sourceHandle: 'no', target: 'alg-leaf9', label: 'Top-down', style: { stroke: '#ef4444' } },
    
    // Additional connections
    { id: 'alg-e16', source: 'recursive-type', target: 'alg-leaf3', label: 'Postorder', style: { stroke: '#8b5cf6' } },
    { id: 'alg-e17', source: 'special-strategy', sourceHandle: 'yes', target: 'alg-leaf10', label: 'O(1) Space', style: { stroke: '#10b981' } },
    { id: 'alg-e18', source: 'special-strategy', sourceHandle: 'no', target: 'alg-leaf11', label: 'Divide & Conquer', style: { stroke: '#ef4444' } },
    { id: 'alg-e19', source: 'recursive-type', target: 'alg-leaf12', label: 'Backtrack', style: { stroke: '#8b5cf6' } },
    { id: 'alg-e20', source: 'iterative-type', target: 'alg-leaf13', label: 'Serialize', style: { stroke: '#8b5cf6' } },
    { id: 'alg-e21', source: 'bfs-strategy', target: 'alg-leaf14', label: 'BST Search', style: { stroke: '#8b5cf6' } },
    { id: 'alg-e22', source: 'special-strategy', target: 'alg-leaf15', label: 'Reconstruction', style: { stroke: '#8b5cf6' } },
    
    // Leaf nodes to Problem nodes
    { id: 'alg-e23', source: 'alg-leaf1', target: 'alg-problems1', style: { stroke: '#f97316' } },
    { id: 'alg-e24', source: 'alg-leaf2', target: 'alg-problems2', style: { stroke: '#f97316' } },
    { id: 'alg-e25', source: 'alg-leaf3', target: 'alg-problems3', style: { stroke: '#f97316' } },
    { id: 'alg-e26', source: 'alg-leaf4', target: 'alg-problems4', style: { stroke: '#f97316' } },
    { id: 'alg-e27', source: 'alg-leaf5', target: 'alg-problems5', style: { stroke: '#f97316' } },
    { id: 'alg-e28', source: 'alg-leaf6', target: 'alg-problems6', style: { stroke: '#f97316' } },
    { id: 'alg-e29', source: 'alg-leaf7', target: 'alg-problems7', style: { stroke: '#f97316' } },
    { id: 'alg-e30', source: 'alg-leaf8', target: 'alg-problems8', style: { stroke: '#f97316' } },
    { id: 'alg-e31', source: 'alg-leaf9', target: 'alg-problems9', style: { stroke: '#f97316' } },
    { id: 'alg-e32', source: 'alg-leaf10', target: 'alg-problems10', style: { stroke: '#f97316' } },
    { id: 'alg-e33', source: 'alg-leaf11', target: 'alg-problems11', style: { stroke: '#f97316' } },
    { id: 'alg-e34', source: 'alg-leaf12', target: 'alg-problems12', style: { stroke: '#f97316' } },
    { id: 'alg-e35', source: 'alg-leaf13', target: 'alg-problems13', style: { stroke: '#f97316' } },
    { id: 'alg-e36', source: 'alg-leaf14', target: 'alg-problems14', style: { stroke: '#f97316' } },
    { id: 'alg-e37', source: 'alg-leaf15', target: 'alg-problems15', style: { stroke: '#f97316' } },
  ]
}
// Tree Characteristics Data (what type of tree?)
const treeCharacteristicsData = {
  nodes: [
    // Root
    {
      id: 'root',
      type: 'root',
      position: { x: 1000, y: 50 },
      data: { label: 'Binary Tree by Characteristics' }
    },
    
    // Level 1: Main tree categorization
    {
      id: 'tree-type',
      type: 'decision',
      position: { x: 1000, y: 180 },
      data: { 
        label: 'What type of binary tree?',
        tooltip: 'Different tree types have different properties and algorithms'
      }
    },

    // Level 2A: Binary Search Tree
    {
      id: 'bst-operations',
      type: 'decision',
      position: { x: 400, y: 320 },
      data: { 
        label: 'What BST operation do you need?',
        tooltip: 'BST-specific operations and validations'
      }
    },

    // Level 2B: General Binary Tree
    {
      id: 'general-tree-ops',
      type: 'decision',
      position: { x: 800, y: 320 },
      data: { 
        label: 'What general tree operation?',
        tooltip: 'Operations for any binary tree structure'
      }
    },

    // Level 2C: Balanced Tree
    {
      id: 'balanced-operations',
      type: 'decision',
      position: { x: 1200, y: 320 },
      data: { 
        label: 'What balanced tree property?',
        tooltip: 'Height-balanced and self-balancing tree operations'
      }
    },

    // Level 2D: Special Tree Properties
    {
      id: 'special-properties',
      type: 'decision',
      position: { x: 1600, y: 320 },
      data: { 
        label: 'What special property?',
        tooltip: 'Perfect, complete, symmetric, and other special trees'
      }
    },

    // Level 3: Further refinement
    {
      id: 'bst-modification',
      type: 'decision',
      position: { x: 200, y: 460 },
      data: { 
        label: 'Are you modifying the BST?',
        tooltip: 'Insert/delete vs search/validate operations'
      }
    },

    {
      id: 'bst-traversal',
      type: 'decision',
      position: { x: 600, y: 460 },
      data: { 
        label: 'Do you need sorted order?',
        tooltip: 'Inorder traversal vs other BST operations'
      }
    },

    {
      id: 'tree-structure-analysis',
      type: 'decision',
      position: { x: 800, y: 460 },
      data: { 
        label: 'Are you analyzing structure?',
        tooltip: 'Tree properties vs tree modification'
      }
    },

    {
      id: 'balance-check',
      type: 'decision',
      position: { x: 1200, y: 460 },
      data: { 
        label: 'Are you checking balance?',
        tooltip: 'Balance validation vs height calculations'
      }
    },

    {
      id: 'symmetry-completeness',
      type: 'decision',
      position: { x: 1600, y: 460 },
      data: { 
        label: 'Is it about symmetry?',
        tooltip: 'Symmetric trees vs complete/perfect trees'
      }
    },

    // Tree Characteristics Leaf Nodes
    {
      id: 'char-leaf1',
      type: 'leaf',
      position: { x: 100, y: 600 },
      data: {
        technique: 'BST Search & Validation',
        approach: 'Leverage BST ordering property',
        complexity: 'O(log n) to O(n) time, O(h) space',
        useCases: 'Search, validation, range queries'
      }
    },

    {
      id: 'char-leaf2',
      type: 'leaf',
      position: { x: 300, y: 600 },
      data: {
        technique: 'BST Insertion & Deletion',
        approach: 'Maintain BST property during modifications',
        complexity: 'O(log n) to O(n) time, O(h) space',
        useCases: 'Dynamic BST operations, tree building'
      }
    },

    {
      id: 'char-leaf3',
      type: 'leaf',
      position: { x: 500, y: 600 },
      data: {
        technique: 'BST Inorder Operations',
        approach: 'Use inorder traversal for sorted access',
        complexity: 'O(n) time, O(h) space',
        useCases: 'Kth element, range sum, sorted output'
      }
    },

    {
      id: 'char-leaf4',
      type: 'leaf',
      position: { x: 700, y: 600 },
      data: {
        technique: 'Tree Structure Analysis',
        approach: 'Calculate tree properties and metrics',
        complexity: 'O(n) time, O(h) space',
        useCases: 'Height, diameter, node count, depth analysis'
      }
    },

    {
      id: 'char-leaf5',
      type: 'leaf',
      position: { x: 900, y: 600 },
      data: {
        technique: 'Tree Transformation',
        approach: 'Modify tree structure while preserving properties',
        complexity: 'O(n) time, O(h) space',
        useCases: 'Tree inversion, flattening, threading'
      }
    },

    {
      id: 'char-leaf6',
      type: 'leaf',
      position: { x: 1100, y: 600 },
      data: {
        technique: 'Balance Validation',
        approach: 'Check height-balanced property',
        complexity: 'O(n) time, O(h) space',
        useCases: 'AVL validation, balance checking'
      }
    },

    {
      id: 'char-leaf7',
      type: 'leaf',
      position: { x: 1300, y: 600 },
      data: {
        technique: 'Height & Depth Calculations',
        approach: 'Recursive height computation',
        complexity: 'O(n) time, O(h) space',
        useCases: 'Tree metrics, balance decisions'
      }
    },

    {
      id: 'char-leaf8',
      type: 'leaf',
      position: { x: 1500, y: 600 },
      data: {
        technique: 'Symmetric Tree Operations',
        approach: 'Mirror comparison and validation',
        complexity: 'O(n) time, O(h) space',
        useCases: 'Symmetry check, mirror trees'
      }
    },

    {
      id: 'char-leaf9',
      type: 'leaf',
      position: { x: 1700, y: 600 },
      data: {
        technique: 'Complete Tree Operations',
        approach: 'Level-order completeness validation',
        complexity: 'O(n) time, O(w) space',
        useCases: 'Heap validation, complete tree check'
      }
    },

    {
      id: 'char-leaf10',
      type: 'leaf',
      position: { x: 200, y: 760 },
      data: {
        technique: 'BST Range Operations',
        approach: 'Use BST property for range queries',
        complexity: 'O(log n + k) time, O(h) space',
        useCases: 'Range sum, range search, trimming'
      }
    },

    {
      id: 'char-leaf11',
      type: 'leaf',
      position: { x: 400, y: 760 },
      data: {
        technique: 'BST Construction',
        approach: 'Build balanced BST from sorted data',
        complexity: 'O(n) time, O(n) space',
        useCases: 'Convert sorted array/list to BST'
      }
    },

    {
      id: 'char-leaf12',
      type: 'leaf',
      position: { x: 600, y: 760 },
      data: {
        technique: 'Tree Comparison',
        approach: 'Structural and value comparison',
        complexity: 'O(min(m,n)) time, O(h) space',
        useCases: 'Same tree, subtree matching'
      }
    },

    {
      id: 'char-leaf13',
      type: 'leaf',
      position: { x: 800, y: 760 },
      data: {
        technique: 'Ancestor & Descendant',
        approach: 'Tree relationship analysis',
        complexity: 'O(n) time, O(h) space',
        useCases: 'LCA, ancestor validation, path finding'
      }
    },

    {
      id: 'char-leaf14',
      type: 'leaf',
      position: { x: 1000, y: 760 },
      data: {
        technique: 'Perfect Tree Operations',
        approach: 'Full binary tree properties',
        complexity: 'O(log n) time, O(1) space',
        useCases: 'Perfect tree validation, indexing'
      }
    },

    {
      id: 'char-leaf15',
      type: 'leaf',
      position: { x: 1200, y: 760 },
      data: {
        technique: 'Tree Threading',
        approach: 'Add threading for O(1) traversal',
        complexity: 'O(n) time, O(1) space',
        useCases: 'Space-efficient traversal, threading'
      }
    },

    // Tree characteristics problem nodes
    {
      id: 'char-problems1',
      type: 'problem',
      position: { x: 100, y: 740 },
      data: {
        problems: [
          { number: 98, title: 'Validate Binary Search Tree', url: 'https://leetcode.com/problems/validate-binary-search-tree/', difficulty: 'Medium' },
          { number: 700, title: 'Search in a Binary Search Tree', url: 'https://leetcode.com/problems/search-in-a-binary-search-tree/', difficulty: 'Easy' },
          { number: 938, title: 'Range Sum of BST', url: 'https://leetcode.com/problems/range-sum-of-bst/', difficulty: 'Easy' },
          { number: 1038, title: 'Binary Search Tree to Greater Sum Tree', url: 'https://leetcode.com/problems/binary-search-tree-to-greater-sum-tree/', difficulty: 'Medium' },
        ]
      }
    },

    {
      id: 'char-problems2',
      type: 'problem',
      position: { x: 300, y: 740 },
      data: {
        problems: [
          { number: 701, title: 'Insert into a Binary Search Tree', url: 'https://leetcode.com/problems/insert-into-a-binary-search-tree/', difficulty: 'Medium' },
          { number: 450, title: 'Delete Node in a BST', url: 'https://leetcode.com/problems/delete-node-in-a-bst/', difficulty: 'Medium' },
          { number: 669, title: 'Trim a Binary Search Tree', url: 'https://leetcode.com/problems/trim-a-binary-search-tree/', difficulty: 'Medium' },
          { number: 1008, title: 'Construct Binary Search Tree from Preorder Traversal', url: 'https://leetcode.com/problems/construct-binary-search-tree-from-preorder-traversal/', difficulty: 'Medium' },
        ]
      }
    },

    {
      id: 'char-problems3',
      type: 'problem',
      position: { x: 500, y: 740 },
      data: {
        problems: [
          { number: 230, title: 'Kth Smallest Element in a BST', url: 'https://leetcode.com/problems/kth-smallest-element-in-a-bst/', difficulty: 'Medium' },
          { number: 538, title: 'Convert BST to Greater Tree', url: 'https://leetcode.com/problems/convert-bst-to-greater-tree/', difficulty: 'Medium' },
          { number: 285, title: 'Inorder Successor in BST', url: 'https://leetcode.com/problems/inorder-successor-in-bst/', difficulty: 'Medium' },
          { number: 510, title: 'Inorder Successor in BST II', url: 'https://leetcode.com/problems/inorder-successor-in-bst-ii/', difficulty: 'Medium' },
        ]
      }
    },

    {
      id: 'char-problems4',
      type: 'problem',
      position: { x: 700, y: 740 },
      data: {
        problems: [
          { number: 104, title: 'Maximum Depth of Binary Tree', url: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/', difficulty: 'Easy' },
          { number: 111, title: 'Minimum Depth of Binary Tree', url: 'https://leetcode.com/problems/minimum-depth-of-binary-tree/', difficulty: 'Easy' },
          { number: 543, title: 'Diameter of Binary Tree', url: 'https://leetcode.com/problems/diameter-of-binary-tree/', difficulty: 'Easy' },
          { number: 222, title: 'Count Complete Tree Nodes', url: 'https://leetcode.com/problems/count-complete-tree-nodes/', difficulty: 'Medium' },
        ]
      }
    },

    {
      id: 'char-problems5',
      type: 'problem',
      position: { x: 900, y: 740 },
      data: {
        problems: [
          { number: 226, title: 'Invert Binary Tree', url: 'https://leetcode.com/problems/invert-binary-tree/', difficulty: 'Easy' },
          { number: 114, title: 'Flatten Binary Tree to Linked List', url: 'https://leetcode.com/problems/flatten-binary-tree-to-linked-list/', difficulty: 'Medium' },
          { number: 116, title: 'Populating Next Right Pointers in Each Node', url: 'https://leetcode.com/problems/populating-next-right-pointers-in-each-node/', difficulty: 'Medium' },
          { number: 117, title: 'Populating Next Right Pointers in Each Node II', url: 'https://leetcode.com/problems/populating-next-right-pointers-in-each-node-ii/', difficulty: 'Medium' },
        ]
      }
    },

    {
      id: 'char-problems6',
      type: 'problem',
      position: { x: 1100, y: 740 },
      data: {
        problems: [
          { number: 110, title: 'Balanced Binary Tree', url: 'https://leetcode.com/problems/balanced-binary-tree/', difficulty: 'Easy' },
          { number: 1382, title: 'Balance a Binary Search Tree', url: 'https://leetcode.com/problems/balance-a-binary-search-tree/', difficulty: 'Medium' },
          { number: 1469, title: 'Find All The Lonely Nodes', url: 'https://leetcode.com/problems/find-all-the-lonely-nodes/', difficulty: 'Easy' },
          { number: 1104, title: 'Path In Zigzag Labelled Binary Tree', url: 'https://leetcode.com/problems/path-in-zigzag-labelled-binary-tree/', difficulty: 'Medium' },
        ]
      }
    },

    {
      id: 'char-problems7',
      type: 'problem',
      position: { x: 1300, y: 740 },
      data: {
        problems: [
          { number: 559, title: 'Maximum Depth of N-ary Tree', url: 'https://leetcode.com/problems/maximum-depth-of-n-ary-tree/', difficulty: 'Easy' },
          { number: 662, title: 'Maximum Width of Binary Tree', url: 'https://leetcode.com/problems/maximum-width-of-binary-tree/', difficulty: 'Medium' },
          { number: 987, title: 'Vertical Order Traversal of a Binary Tree', url: 'https://leetcode.com/problems/vertical-order-traversal-of-a-binary-tree/', difficulty: 'Hard' },
          { number: 1448, title: 'Count Good Nodes in Binary Tree', url: 'https://leetcode.com/problems/count-good-nodes-in-binary-tree/', difficulty: 'Medium' },
        ]
      }
    },

    {
      id: 'char-problems8',
      type: 'problem',
      position: { x: 1500, y: 740 },
      data: {
        problems: [
          { number: 101, title: 'Symmetric Tree', url: 'https://leetcode.com/problems/symmetric-tree/', difficulty: 'Easy' },
          { number: 951, title: 'Flip Equivalent Binary Trees', url: 'https://leetcode.com/problems/flip-equivalent-binary-trees/', difficulty: 'Medium' },
          { number: 1457, title: 'Pseudo-Palindromic Paths in a Binary Tree', url: 'https://leetcode.com/problems/pseudo-palindromic-paths-in-a-binary-tree/', difficulty: 'Medium' },
          { number: 1026, title: 'Maximum Difference Between Node and Ancestor', url: 'https://leetcode.com/problems/maximum-difference-between-node-and-ancestor/', difficulty: 'Medium' },
        ]
      }
    },

    {
      id: 'char-problems9',
      type: 'problem',
      position: { x: 1700, y: 740 },
      data: {
        problems: [
          { number: 958, title: 'Check Completeness of a Binary Tree', url: 'https://leetcode.com/problems/check-completeness-of-a-binary-tree/', difficulty: 'Medium' },
          { number: 919, title: 'Complete Binary Tree Inserter', url: 'https://leetcode.com/problems/complete-binary-tree-inserter/', difficulty: 'Medium' },
          { number: 1379, title: 'Find a Corresponding Node of a Binary Tree in a Clone of That Tree', url: 'https://leetcode.com/problems/find-a-corresponding-node-of-a-binary-tree-in-a-clone-of-that-tree/', difficulty: 'Medium' },
          { number: 894, title: 'All Possible Full Binary Trees', url: 'https://leetcode.com/problems/all-possible-full-binary-trees/', difficulty: 'Medium' },
        ]
      }
    },

    {
      id: 'char-problems10',
      type: 'problem',
      position: { x: 200, y: 900 },
      data: {
        problems: [
          { number: 783, title: 'Minimum Distance Between BST Nodes', url: 'https://leetcode.com/problems/minimum-distance-between-bst-nodes/', difficulty: 'Easy' },
          { number: 530, title: 'Minimum Absolute Difference in BST', url: 'https://leetcode.com/problems/minimum-absolute-difference-in-bst/', difficulty: 'Easy' },
          { number: 501, title: 'Find Mode in Binary Search Tree', url: 'https://leetcode.com/problems/find-mode-in-binary-search-tree/', difficulty: 'Easy' },
          { number: 1214, title: 'Two Sum BSTs', url: 'https://leetcode.com/problems/two-sum-bsts/', difficulty: 'Medium' },
        ]
      }
    },

    {
      id: 'char-problems11',
      type: 'problem',
      position: { x: 400, y: 900 },
      data: {
        problems: [
          { number: 108, title: 'Convert Sorted Array to Binary Search Tree', url: 'https://leetcode.com/problems/convert-sorted-array-to-binary-search-tree/', difficulty: 'Easy' },
          { number: 109, title: 'Convert Sorted List to Binary Search Tree', url: 'https://leetcode.com/problems/convert-sorted-list-to-binary-search-tree/', difficulty: 'Medium' },
          { number: 1008, title: 'Construct Binary Search Tree from Preorder Traversal', url: 'https://leetcode.com/problems/construct-binary-search-tree-from-preorder-traversal/', difficulty: 'Medium' },
          { number: 95, title: 'Unique Binary Search Trees II', url: 'https://leetcode.com/problems/unique-binary-search-trees-ii/', difficulty: 'Medium' },
        ]
      }
    },

    {
      id: 'char-problems12',
      type: 'problem',
      position: { x: 600, y: 900 },
      data: {
        problems: [
          { number: 100, title: 'Same Tree', url: 'https://leetcode.com/problems/same-tree/', difficulty: 'Easy' },
          { number: 572, title: 'Subtree of Another Tree', url: 'https://leetcode.com/problems/subtree-of-another-tree/', difficulty: 'Easy' },
          { number: 965, title: 'Univalued Binary Tree', url: 'https://leetcode.com/problems/univalued-binary-tree/', difficulty: 'Easy' },
          { number: 1367, title: 'Linked List in Binary Tree', url: 'https://leetcode.com/problems/linked-list-in-binary-tree/', difficulty: 'Medium' },
        ]
      }
    },

    {
      id: 'char-problems13',
      type: 'problem',
      position: { x: 800, y: 900 },
      data: {
        problems: [
          { number: 236, title: 'Lowest Common Ancestor of a Binary Tree', url: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/', difficulty: 'Medium' },
          { number: 235, title: 'Lowest Common Ancestor of a Binary Search Tree', url: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/', difficulty: 'Easy' },
          { number: 1644, title: 'Lowest Common Ancestor of a Binary Tree II', url: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree-ii/', difficulty: 'Medium' },
          { number: 1650, title: 'Lowest Common Ancestor of a Binary Tree III', url: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree-iii/', difficulty: 'Medium' },
        ]
      }
    },

    {
      id: 'char-problems14',
      type: 'problem',
      position: { x: 1000, y: 900 },
      data: {
        problems: [
          { number: 1430, title: 'Check If a String Is a Valid Sequence from Root to Leaves Path in a Binary Tree', url: 'https://leetcode.com/problems/check-if-a-string-is-a-valid-sequence-from-root-to-leaves-path-in-a-binary-tree/', difficulty: 'Medium' },
          { number: 1261, title: 'Find Elements in a Contaminated Binary Tree', url: 'https://leetcode.com/problems/find-elements-in-a-contaminated-binary-tree/', difficulty: 'Medium' },
          { number: 1028, title: 'Recover a Tree From Preorder Traversal', url: 'https://leetcode.com/problems/recover-a-tree-from-preorder-traversal/', difficulty: 'Hard' },
          { number: 331, title: 'Verify Preorder Serialization of a Binary Tree', url: 'https://leetcode.com/problems/verify-preorder-serialization-of-a-binary-tree/', difficulty: 'Medium' },
        ]
      }
    },

    {
      id: 'char-problems15',
      type: 'problem',
      position: { x: 1200, y: 900 },
      data: {
        problems: [
          { number: 99, title: 'Recover Binary Search Tree', url: 'https://leetcode.com/problems/recover-binary-search-tree/', difficulty: 'Medium' },
          { number: 156, title: 'Binary Tree Upside Down', url: 'https://leetcode.com/problems/binary-tree-upside-down/', difficulty: 'Medium' },
          { number: 1522, title: 'Diameter of N-Ary Tree', url: 'https://leetcode.com/problems/diameter-of-n-ary-tree/', difficulty: 'Medium' },
          { number: 1110, title: 'Delete Nodes And Return Forest', url: 'https://leetcode.com/problems/delete-nodes-and-return-forest/', difficulty: 'Medium' },
        ]
      }
    },
  ],
  
  edges: [
    // Root to Level 1
    { id: 'char-e1', source: 'root', target: 'tree-type', animated: true },
    
    // Level 1 to Level 2
    { id: 'char-e2', source: 'tree-type', sourceHandle: 'yes', target: 'bst-operations', label: 'BST', style: { stroke: '#10b981' } },
    { id: 'char-e3', source: 'tree-type', sourceHandle: 'no', target: 'general-tree-ops', label: 'General', style: { stroke: '#ef4444' } },
    
    // Additional branches
    { id: 'char-e3b', source: 'general-tree-ops', sourceHandle: 'no', target: 'balanced-operations', label: 'Balanced', style: { stroke: '#ef4444' } },
    { id: 'char-e3c', source: 'balanced-operations', sourceHandle: 'no', target: 'special-properties', label: 'Special', style: { stroke: '#ef4444' } },
    
    // Level 2 to Level 3
    { id: 'char-e4', source: 'bst-operations', sourceHandle: 'yes', target: 'bst-modification', label: 'Operations', style: { stroke: '#10b981' } },
    { id: 'char-e5', source: 'bst-operations', sourceHandle: 'no', target: 'bst-traversal', label: 'Traversal', style: { stroke: '#ef4444' } },
    { id: 'char-e6', source: 'general-tree-ops', sourceHandle: 'yes', target: 'tree-structure-analysis', label: 'Analysis', style: { stroke: '#10b981' } },
    { id: 'char-e7', source: 'balanced-operations', sourceHandle: 'yes', target: 'balance-check', label: 'Balance', style: { stroke: '#10b981' } },
    { id: 'char-e8', source: 'special-properties', sourceHandle: 'yes', target: 'symmetry-completeness', label: 'Properties', style: { stroke: '#10b981' } },
    
    // Level 3 to Leaves
    { id: 'char-e9', source: 'bst-modification', sourceHandle: 'yes', target: 'char-leaf2', label: 'Insert/Delete', style: { stroke: '#10b981' } },
    { id: 'char-e10', source: 'bst-modification', sourceHandle: 'no', target: 'char-leaf1', label: 'Search/Validate', style: { stroke: '#ef4444' } },
    { id: 'char-e11', source: 'bst-traversal', sourceHandle: 'yes', target: 'char-leaf3', label: 'Sorted', style: { stroke: '#10b981' } },
    { id: 'char-e12', source: 'bst-traversal', sourceHandle: 'no', target: 'char-leaf10', label: 'Range', style: { stroke: '#ef4444' } },
    { id: 'char-e13', source: 'tree-structure-analysis', sourceHandle: 'yes', target: 'char-leaf4', label: 'Analysis', style: { stroke: '#10b981' } },
    { id: 'char-e14', source: 'tree-structure-analysis', sourceHandle: 'no', target: 'char-leaf5', label: 'Transform', style: { stroke: '#ef4444' } },
    { id: 'char-e15', source: 'balance-check', sourceHandle: 'yes', target: 'char-leaf6', label: 'Validate', style: { stroke: '#10b981' } },
    { id: 'char-e16', source: 'balance-check', sourceHandle: 'no', target: 'char-leaf7', label: 'Calculate', style: { stroke: '#ef4444' } },
    { id: 'char-e17', source: 'symmetry-completeness', sourceHandle: 'yes', target: 'char-leaf8', label: 'Symmetric', style: { stroke: '#10b981' } },
    { id: 'char-e18', source: 'symmetry-completeness', sourceHandle: 'no', target: 'char-leaf9', label: 'Complete', style: { stroke: '#ef4444' } },
    
    // Additional connections
    { id: 'char-e19', source: 'bst-operations', target: 'char-leaf11', label: 'Construction', style: { stroke: '#8b5cf6' } },
    { id: 'char-e20', source: 'general-tree-ops', target: 'char-leaf12', label: 'Comparison', style: { stroke: '#8b5cf6' } },
    { id: 'char-e21', source: 'general-tree-ops', target: 'char-leaf13', label: 'Relationships', style: { stroke: '#8b5cf6' } },
    { id: 'char-e22', source: 'special-properties', target: 'char-leaf14', label: 'Perfect', style: { stroke: '#8b5cf6' } },
    { id: 'char-e23', source: 'special-properties', target: 'char-leaf15', label: 'Threading', style: { stroke: '#8b5cf6' } },
    
    // Leaf nodes to Problem nodes
    { id: 'char-e24', source: 'char-leaf1', target: 'char-problems1', style: { stroke: '#f97316' } },
    { id: 'char-e25', source: 'char-leaf2', target: 'char-problems2', style: { stroke: '#f97316' } },
    { id: 'char-e26', source: 'char-leaf3', target: 'char-problems3', style: { stroke: '#f97316' } },
    { id: 'char-e27', source: 'char-leaf4', target: 'char-problems4', style: { stroke: '#f97316' } },
    { id: 'char-e28', source: 'char-leaf5', target: 'char-problems5', style: { stroke: '#f97316' } },
    { id: 'char-e29', source: 'char-leaf6', target: 'char-problems6', style: { stroke: '#f97316' } },
    { id: 'char-e30', source: 'char-leaf7', target: 'char-problems7', style: { stroke: '#f97316' } },
    { id: 'char-e31', source: 'char-leaf8', target: 'char-problems8', style: { stroke: '#f97316' } },
    { id: 'char-e32', source: 'char-leaf9', target: 'char-problems9', style: { stroke: '#f97316' } },
    { id: 'char-e33', source: 'char-leaf10', target: 'char-problems10', style: { stroke: '#f97316' } },
    { id: 'char-e34', source: 'char-leaf11', target: 'char-problems11', style: { stroke: '#f97316' } },
    { id: 'char-e35', source: 'char-leaf12', target: 'char-problems12', style: { stroke: '#f97316' } },
    { id: 'char-e36', source: 'char-leaf13', target: 'char-problems13', style: { stroke: '#f97316' } },
    { id: 'char-e37', source: 'char-leaf14', target: 'char-problems14', style: { stroke: '#f97316' } },
    { id: 'char-e38', source: 'char-leaf15', target: 'char-problems15', style: { stroke: '#f97316' } },
  ]
}

// Main Flow Component
function BinaryTreeFlow() {
  const reactFlowInstance = useReactFlow()
  const [viewType, setViewType] = useState('problem-type') // 'problem-type', 'algorithm-approach', 'tree-characteristics'

  const currentData = useMemo(() => {
    switch(viewType) {
      case 'problem-type': return problemTypeData
      case 'algorithm-approach': return algorithmApproachData  
      case 'tree-characteristics': return treeCharacteristicsData
      default: return problemTypeData
    }
  }, [viewType])

  const [nodes, setNodes, onNodesChange] = useNodesState(currentData.nodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(currentData.edges)

  // Force update when viewType changes
  React.useEffect(() => {
    setNodes(currentData.nodes)
    setEdges(currentData.edges)
  }, [currentData.nodes, currentData.edges, setNodes, setEdges])

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  return (
    <div style={{ width: '100vw', height: 'calc(100vh - 64px)' }}>
      <div className="p-4 bg-gray-100 border-b">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-800">Binary Tree Decision Tree</h1>
            <div className="flex items-center gap-2 bg-white rounded-lg p-1 shadow-sm">
              <button
                onClick={() => setViewType('problem-type')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
                  viewType === 'problem-type' 
                    ? 'bg-blue-500 text-white shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Problem Type
              </button>
              <button
                onClick={() => setViewType('algorithm-approach')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
                  viewType === 'algorithm-approach' 
                    ? 'bg-blue-500 text-white shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Algorithm Approach
              </button>
              <button
                onClick={() => setViewType('tree-characteristics')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
                  viewType === 'tree-characteristics' 
                    ? 'bg-blue-500 text-white shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Tree Characteristics
              </button>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => downloadSvg(reactFlowInstance, viewType)}
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
              onClick={() => downloadPng(reactFlowInstance, viewType)}
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
        

      </div>
      
              <div style={{ width: '100%', height: 'calc(100vh - 204px)' }}>
        <ReactFlow
          key={viewType}
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
                onClick={() => downloadSvg(reactFlowInstance, viewType)}
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
                onClick={() => downloadPng(reactFlowInstance, viewType)}
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

export default function BinaryTreeDecisionTree() {
  return (
    <div>
      <Navbar />
      <ReactFlowProvider>
        <BinaryTreeFlow />
      </ReactFlowProvider>
    </div>
  )
}