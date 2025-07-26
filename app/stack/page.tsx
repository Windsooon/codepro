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

// Custom Leaf Node Component (Stack Techniques)
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
    Stack - ${viewType === 'problem-type' ? 'Problem Type View' : viewType === 'algorithm-approach' ? 'Algorithm Approach View' : 'Data Pattern View'}
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
    link.download = `stack-${viewType}-view.svg`
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
      link.download = `stack-${viewType}-view.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Error exporting PNG:', error)
      downloadSvg(reactFlowInstance, viewType)
    }
  }
}

// Problem Type Data (what kind of stack problem?)
const problemTypeData = {
  nodes: [
    // Root
    {
      id: 'root',
      type: 'root',
      position: { x: 1000, y: 50 },
      data: { label: 'Stack Problems' }
    },
    
    // Level 1: Main categorization
    {
      id: 'operation-type',
      type: 'decision',
      position: { x: 1000, y: 180 },
      data: { 
        label: 'What type of stack operation do you need?',
        tooltip: 'Categorize by the main type of stack problem'
      }
    },

    // Level 2A: Expression Processing
    {
      id: 'expression-type',
      type: 'decision',
      position: { x: 400, y: 320 },
      data: { 
        label: 'What type of expression processing?',
        tooltip: 'Different expression and parsing operations'
      }
    },

    // Level 2B: Sequence Validation
    {
      id: 'validation-type',
      type: 'decision',
      position: { x: 800, y: 320 },
      data: { 
        label: 'What needs to be validated?',
        tooltip: 'Bracket matching and pattern validation'
      }
    },

    // Level 2C: Optimization Problems
    {
      id: 'optimization-type',
      type: 'decision',
      position: { x: 1200, y: 320 },
      data: { 
        label: 'What optimization pattern?',
        tooltip: 'Monotonic stack and optimization problems'
      }
    },

    // Level 2D: Simulation & State
    {
      id: 'simulation-type',
      type: 'decision',
      position: { x: 1600, y: 320 },
      data: { 
        label: 'What needs simulation?',
        tooltip: 'State management and simulation problems'
      }
    },

    // Level 3: Further refinement
    {
      id: 'bracket-complexity',
      type: 'decision',
      position: { x: 200, y: 460 },
      data: { 
        label: 'Multiple bracket types?',
        tooltip: 'Simple vs complex bracket matching'
      }
    },

    {
      id: 'expression-complexity',
      type: 'decision',
      position: { x: 600, y: 460 },
      data: { 
        label: 'Need expression evaluation?',
        tooltip: 'Parsing vs full evaluation'
      }
    },

    {
      id: 'pattern-complexity',
      type: 'decision',
      position: { x: 800, y: 460 },
      data: { 
        label: 'Complex validation rules?',
        tooltip: 'Simple matching vs complex pattern validation'
      }
    },

    {
      id: 'monotonic-direction',
      type: 'decision',
      position: { x: 1200, y: 460 },
      data: { 
        label: 'Looking for greater or smaller?',
        tooltip: 'Next greater vs next smaller patterns'
      }
    },

    {
      id: 'state-complexity',
      type: 'decision',
      position: { x: 1600, y: 460 },
      data: { 
        label: 'Multiple operations or single?',
        tooltip: 'Simple state vs complex state management'
      }
    },

    // Leaf Nodes (Stack Techniques)
    {
      id: 'leaf1',
      type: 'leaf',
      position: { x: 100, y: 600 },
      data: {
        technique: 'Basic Parentheses Matching',
        approach: 'Simple stack push/pop for single bracket type',
        complexity: 'O(n) time, O(n) space',
        useCases: 'Simple bracket validation, balanced parentheses'
      }
    },

    {
      id: 'leaf2',
      type: 'leaf',
      position: { x: 300, y: 600 },
      data: {
        technique: 'Multi-Bracket Validation',
        approach: 'Stack with bracket type tracking',
        complexity: 'O(n) time, O(n) space',
        useCases: 'Complex bracket matching, syntax validation'
      }
    },

    {
      id: 'leaf3',
      type: 'leaf',
      position: { x: 500, y: 600 },
      data: {
        technique: 'Expression Parsing',
        approach: 'Stack-based string parsing and tokenization',
        complexity: 'O(n) time, O(n) space',
        useCases: 'String decoding, path parsing, nested structures'
      }
    },

    {
      id: 'leaf4',
      type: 'leaf',
      position: { x: 700, y: 600 },
      data: {
        technique: 'Expression Evaluation',
        approach: 'Two-stack or postfix evaluation',
        complexity: 'O(n) time, O(n) space',
        useCases: 'Calculator, postfix evaluation, operator precedence'
      }
    },

    {
      id: 'leaf5',
      type: 'leaf',
      position: { x: 900, y: 600 },
      data: {
        technique: 'Pattern Validation',
        approach: 'Stack-based state machine for complex patterns',
        complexity: 'O(n) time, O(n) space',
        useCases: 'String validation, pattern matching, state tracking'
      }
    },

    {
      id: 'leaf6',
      type: 'leaf',
      position: { x: 1100, y: 600 },
      data: {
        technique: 'Next Greater Element',
        approach: 'Monotonic decreasing stack',
        complexity: 'O(n) time, O(n) space',
        useCases: 'Stock span, daily temperatures, next greater problems'
      }
    },

    {
      id: 'leaf7',
      type: 'leaf',
      position: { x: 1300, y: 600 },
      data: {
        technique: 'Next Smaller Element',
        approach: 'Monotonic increasing stack',
        complexity: 'O(n) time, O(n) space',
        useCases: 'Largest rectangle, trapping rain water'
      }
    },

    {
      id: 'leaf8',
      type: 'leaf',
      position: { x: 1500, y: 600 },
      data: {
        technique: 'Stack-based State Management',
        approach: 'Stack for operation history and state',
        complexity: 'O(n) time, O(n) space',
        useCases: 'Undo/redo, browser history, function calls'
      }
    },

    {
      id: 'leaf9',
      type: 'leaf',
      position: { x: 1700, y: 600 },
      data: {
        technique: 'Multi-Operation Simulation',
        approach: 'Complex stack state with multiple operations',
        complexity: 'O(n) time, O(n) space',
        useCases: 'Game state, complex simulations, multi-step operations'
      }
    },

    {
      id: 'leaf10',
      type: 'leaf',
      position: { x: 300, y: 760 },
      data: {
        technique: 'Stack with Min/Max',
        approach: 'Auxiliary stack for tracking extremes',
        complexity: 'O(1) operations, O(n) space',
        useCases: 'Min stack, max stack, range queries'
      }
    },

    {
      id: 'leaf11',
      type: 'leaf',
      position: { x: 500, y: 760 },
      data: {
        technique: 'Stack Sorting',
        approach: 'Use additional stack for sorting',
        complexity: 'O(n²) time, O(n) space',
        useCases: 'Stack sorting, data organization'
      }
    },

    {
      id: 'leaf12',
      type: 'leaf',
      position: { x: 700, y: 760 },
      data: {
        technique: 'Queue using Stacks',
        approach: 'Two stacks to simulate queue operations',
        complexity: 'O(1) amortized, O(n) space',
        useCases: 'Queue implementation, order reversal'
      }
    },

    {
      id: 'leaf13',
      type: 'leaf',
      position: { x: 900, y: 760 },
      data: {
        technique: 'Stack-based DFS',
        approach: 'Iterative DFS using explicit stack',
        complexity: 'O(V+E) time, O(V) space',
        useCases: 'Tree/graph traversal, avoiding recursion'
      }
    },

    {
      id: 'leaf14',
      type: 'leaf',
      position: { x: 1100, y: 760 },
      data: {
        technique: 'Largest Rectangle',
        approach: 'Monotonic stack for histogram problems',
        complexity: 'O(n) time, O(n) space',
        useCases: 'Largest rectangle in histogram, matrix problems'
      }
    },

    {
      id: 'leaf15',
      type: 'leaf',
      position: { x: 1300, y: 760 },
      data: {
        technique: 'Trap Rain Water',
        approach: 'Stack to track water levels and boundaries',
        complexity: 'O(n) time, O(n) space',
        useCases: 'Rain water trapping, container problems'
      }
    },

    // Problem Nodes
    {
      id: 'problems1',
      type: 'problem',
      position: { x: 100, y: 740 },
      data: {
        problems: [
          { number: 20, title: 'Valid Parentheses', url: 'https://leetcode.com/problems/valid-parentheses/', difficulty: 'Easy' },
          { number: 1021, title: 'Remove Outermost Parentheses', url: 'https://leetcode.com/problems/remove-outermost-parentheses/', difficulty: 'Easy' },
          { number: 1047, title: 'Remove All Adjacent Duplicates In String', url: 'https://leetcode.com/problems/remove-all-adjacent-duplicates-in-string/', difficulty: 'Easy' },
          { number: 1544, title: 'Make The String Great', url: 'https://leetcode.com/problems/make-the-string-great/', difficulty: 'Easy' },
        ]
      }
    },

    {
      id: 'problems2',
      type: 'problem',
      position: { x: 300, y: 740 },
      data: {
        problems: [
          { number: 32, title: 'Longest Valid Parentheses', url: 'https://leetcode.com/problems/longest-valid-parentheses/', difficulty: 'Hard' },
          { number: 921, title: 'Minimum Add to Make Parentheses Valid', url: 'https://leetcode.com/problems/minimum-add-to-make-parentheses-valid/', difficulty: 'Medium' },
          { number: 1249, title: 'Minimum Remove to Make Valid Parentheses', url: 'https://leetcode.com/problems/minimum-remove-to-make-valid-parentheses/', difficulty: 'Medium' },
          { number: 678, title: 'Valid Parenthesis String', url: 'https://leetcode.com/problems/valid-parenthesis-string/', difficulty: 'Medium' },
        ]
      }
    },

    {
      id: 'problems3',
      type: 'problem',
      position: { x: 500, y: 740 },
      data: {
        problems: [
          { number: 394, title: 'Decode String', url: 'https://leetcode.com/problems/decode-string/', difficulty: 'Medium' },
          { number: 71, title: 'Simplify Path', url: 'https://leetcode.com/problems/simplify-path/', difficulty: 'Medium' },
          { number: 385, title: 'Mini Parser', url: 'https://leetcode.com/problems/mini-parser/', difficulty: 'Medium' },
          { number: 726, title: 'Number of Atoms', url: 'https://leetcode.com/problems/number-of-atoms/', difficulty: 'Hard' },
        ]
      }
    },

    {
      id: 'problems4',
      type: 'problem',
      position: { x: 700, y: 740 },
      data: {
        problems: [
          { number: 150, title: 'Evaluate Reverse Polish Notation', url: 'https://leetcode.com/problems/evaluate-reverse-polish-notation/', difficulty: 'Medium' },
          { number: 224, title: 'Basic Calculator', url: 'https://leetcode.com/problems/basic-calculator/', difficulty: 'Hard' },
          { number: 227, title: 'Basic Calculator II', url: 'https://leetcode.com/problems/basic-calculator-ii/', difficulty: 'Medium' },
          { number: 772, title: 'Basic Calculator III', url: 'https://leetcode.com/problems/basic-calculator-iii/', difficulty: 'Hard' },
        ]
      }
    },

    {
      id: 'problems5',
      type: 'problem',
      position: { x: 900, y: 740 },
      data: {
        problems: [
          { number: 856, title: 'Score of Parentheses', url: 'https://leetcode.com/problems/score-of-parentheses/', difficulty: 'Medium' },
          { number: 1190, title: 'Reverse Substrings Between Each Pair of Parentheses', url: 'https://leetcode.com/problems/reverse-substrings-between-each-pair-of-parentheses/', difficulty: 'Medium' },
          { number: 636, title: 'Exclusive Time of Functions', url: 'https://leetcode.com/problems/exclusive-time-of-functions/', difficulty: 'Medium' },
          { number: 1003, title: 'Check If Word Is Valid After Substitutions', url: 'https://leetcode.com/problems/check-if-word-is-valid-after-substitutions/', difficulty: 'Medium' },
        ]
      }
    },

    {
      id: 'problems6',
      type: 'problem',
      position: { x: 1100, y: 740 },
      data: {
        problems: [
          { number: 496, title: 'Next Greater Element I', url: 'https://leetcode.com/problems/next-greater-element-i/', difficulty: 'Easy' },
          { number: 503, title: 'Next Greater Element II', url: 'https://leetcode.com/problems/next-greater-element-ii/', difficulty: 'Medium' },
          { number: 739, title: 'Daily Temperatures', url: 'https://leetcode.com/problems/daily-temperatures/', difficulty: 'Medium' },
          { number: 901, title: 'Online Stock Span', url: 'https://leetcode.com/problems/online-stock-span/', difficulty: 'Medium' },
        ]
      }
    },

    {
      id: 'problems7',
      type: 'problem',
      position: { x: 1300, y: 740 },
      data: {
        problems: [
          { number: 84, title: 'Largest Rectangle in Histogram', url: 'https://leetcode.com/problems/largest-rectangle-in-histogram/', difficulty: 'Hard' },
          { number: 85, title: 'Maximal Rectangle', url: 'https://leetcode.com/problems/maximal-rectangle/', difficulty: 'Hard' },
          { number: 42, title: 'Trapping Rain Water', url: 'https://leetcode.com/problems/trapping-rain-water/', difficulty: 'Hard' },
          { number: 456, title: '132 Pattern', url: 'https://leetcode.com/problems/132-pattern/', difficulty: 'Medium' },
        ]
      }
    },

    {
      id: 'problems8',
      type: 'problem',
      position: { x: 1500, y: 740 },
      data: {
        problems: [
          { number: 155, title: 'Min Stack', url: 'https://leetcode.com/problems/min-stack/', difficulty: 'Medium' },
          { number: 716, title: 'Max Stack', url: 'https://leetcode.com/problems/max-stack/', difficulty: 'Hard' },
          { number: 173, title: 'Binary Search Tree Iterator', url: 'https://leetcode.com/problems/binary-search-tree-iterator/', difficulty: 'Medium' },
          { number: 341, title: 'Flatten Nested List Iterator', url: 'https://leetcode.com/problems/flatten-nested-list-iterator/', difficulty: 'Medium' },
        ]
      }
    },

    {
      id: 'problems9',
      type: 'problem',
      position: { x: 1700, y: 740 },
      data: {
        problems: [
          { number: 895, title: 'Maximum Frequency Stack', url: 'https://leetcode.com/problems/maximum-frequency-stack/', difficulty: 'Hard' },
          { number: 1472, title: 'Design Browser History', url: 'https://leetcode.com/problems/design-browser-history/', difficulty: 'Medium' },
          { number: 1209, title: 'Remove All Adjacent Duplicates in String II', url: 'https://leetcode.com/problems/remove-all-adjacent-duplicates-in-string-ii/', difficulty: 'Medium' },
          { number: 1019, title: 'Next Greater Node In Linked List', url: 'https://leetcode.com/problems/next-greater-node-in-linked-list/', difficulty: 'Medium' },
        ]
      }
    },

    {
      id: 'problems10',
      type: 'problem',
      position: { x: 300, y: 900 },
      data: {
        problems: [
          { number: 946, title: 'Validate Stack Sequences', url: 'https://leetcode.com/problems/validate-stack-sequences/', difficulty: 'Medium' },
          { number: 1441, title: 'Build an Array With Stack Operations', url: 'https://leetcode.com/problems/build-an-array-with-stack-operations/', difficulty: 'Medium' },
          { number: 1597, title: 'Build Binary Expression Tree From Infix Expression', url: 'https://leetcode.com/problems/build-binary-expression-tree-from-infix-expression/', difficulty: 'Hard' },
          { number: 1628, title: 'Design an Expression Tree With Evaluate Function', url: 'https://leetcode.com/problems/design-an-expression-tree-with-evaluate-function/', difficulty: 'Medium' },
        ]
      }
    },

    {
      id: 'problems11',
      type: 'problem',
      position: { x: 500, y: 900 },
      data: {
        problems: [
          { number: 232, title: 'Implement Queue using Stacks', url: 'https://leetcode.com/problems/implement-queue-using-stacks/', difficulty: 'Easy' },
          { number: 225, title: 'Implement Stack using Queues', url: 'https://leetcode.com/problems/implement-stack-using-queues/', difficulty: 'Easy' },
          { number: 1381, title: 'Design a Stack With Increment Operation', url: 'https://leetcode.com/problems/design-a-stack-with-increment-operation/', difficulty: 'Medium' },
          { number: 1396, title: 'Design Underground System', url: 'https://leetcode.com/problems/design-underground-system/', difficulty: 'Medium' },
        ]
      }
    },

    {
      id: 'problems12',
      type: 'problem',
      position: { x: 700, y: 900 },
      data: {
        problems: [
          { number: 144, title: 'Binary Tree Preorder Traversal', url: 'https://leetcode.com/problems/binary-tree-preorder-traversal/', difficulty: 'Easy' },
          { number: 94, title: 'Binary Tree Inorder Traversal', url: 'https://leetcode.com/problems/binary-tree-inorder-traversal/', difficulty: 'Easy' },
          { number: 145, title: 'Binary Tree Postorder Traversal', url: 'https://leetcode.com/problems/binary-tree-postorder-traversal/', difficulty: 'Easy' },
          { number: 589, title: 'N-ary Tree Preorder Traversal', url: 'https://leetcode.com/problems/n-ary-tree-preorder-traversal/', difficulty: 'Easy' },
        ]
      }
    },

    {
      id: 'problems13',
      type: 'problem',
      position: { x: 900, y: 900 },
      data: {
        problems: [
          { number: 331, title: 'Verify Preorder Serialization of a Binary Tree', url: 'https://leetcode.com/problems/verify-preorder-serialization-of-a-binary-tree/', difficulty: 'Medium' },
          { number: 255, title: 'Verify Preorder Sequence in Binary Search Tree', url: 'https://leetcode.com/problems/verify-preorder-sequence-in-binary-search-tree/', difficulty: 'Medium' },
          { number: 1008, title: 'Construct Binary Search Tree from Preorder Traversal', url: 'https://leetcode.com/problems/construct-binary-search-tree-from-preorder-traversal/', difficulty: 'Medium' },
          { number: 297, title: 'Serialize and Deserialize Binary Tree', url: 'https://leetcode.com/problems/serialize-and-deserialize-binary-tree/', difficulty: 'Hard' },
        ]
      }
    },

    {
      id: 'problems14',
      type: 'problem',
      position: { x: 1100, y: 900 },
      data: {
        problems: [
          { number: 1504, title: 'Count Submatrices With All Ones', url: 'https://leetcode.com/problems/count-submatrices-with-all-ones/', difficulty: 'Medium' },
          { number: 1793, title: 'Maximum Score of a Good Subarray', url: 'https://leetcode.com/problems/maximum-score-of-a-good-subarray/', difficulty: 'Hard' },
          { number: 907, title: 'Sum of Subarray Minimums', url: 'https://leetcode.com/problems/sum-of-subarray-minimums/', difficulty: 'Medium' },
          { number: 1856, title: 'Maximum Subarray Min-Product', url: 'https://leetcode.com/problems/maximum-subarray-min-product/', difficulty: 'Medium' },
        ]
      }
    },

    {
      id: 'problems15',
      type: 'problem',
      position: { x: 1300, y: 900 },
      data: {
        problems: [
          { number: 407, title: 'Trapping Rain Water II', url: 'https://leetcode.com/problems/trapping-rain-water-ii/', difficulty: 'Hard' },
          { number: 1115, title: 'Print FooBar Alternately', url: 'https://leetcode.com/problems/print-foobar-alternately/', difficulty: 'Medium' },
          { number: 735, title: 'Asteroid Collision', url: 'https://leetcode.com/problems/asteroid-collision/', difficulty: 'Medium' },
          { number: 1776, title: 'Car Fleet II', url: 'https://leetcode.com/problems/car-fleet-ii/', difficulty: 'Hard' },
        ]
      }
    },
  ],
  
  edges: [
    // Root to Level 1
    { id: 'e1', source: 'root', target: 'operation-type', animated: true },
    
    // Level 1 to Level 2
    { id: 'e2', source: 'operation-type', sourceHandle: 'yes', target: 'expression-type', label: 'Expression', style: { stroke: '#10b981' } },
    { id: 'e3', source: 'operation-type', sourceHandle: 'no', target: 'validation-type', label: 'Validation', style: { stroke: '#ef4444' } },
    
    // Additional branches
    { id: 'e3b', source: 'validation-type', sourceHandle: 'no', target: 'optimization-type', label: 'Optimization', style: { stroke: '#ef4444' } },
    { id: 'e3c', source: 'optimization-type', sourceHandle: 'no', target: 'simulation-type', label: 'Simulation', style: { stroke: '#ef4444' } },
    
    // Level 2 to Level 3
    { id: 'e4', source: 'expression-type', sourceHandle: 'yes', target: 'bracket-complexity', label: 'Brackets', style: { stroke: '#10b981' } },
    { id: 'e5', source: 'expression-type', sourceHandle: 'no', target: 'expression-complexity', label: 'Evaluation', style: { stroke: '#ef4444' } },
    { id: 'e6', source: 'validation-type', sourceHandle: 'yes', target: 'pattern-complexity', label: 'Pattern', style: { stroke: '#10b981' } },
    { id: 'e7', source: 'optimization-type', sourceHandle: 'yes', target: 'monotonic-direction', label: 'Monotonic', style: { stroke: '#10b981' } },
    { id: 'e8', source: 'simulation-type', sourceHandle: 'yes', target: 'state-complexity', label: 'State', style: { stroke: '#10b981' } },
    
    // Level 3 to Leaves
    { id: 'e9', source: 'bracket-complexity', sourceHandle: 'yes', target: 'leaf2', label: 'Multi-type', style: { stroke: '#10b981' } },
    { id: 'e10', source: 'bracket-complexity', sourceHandle: 'no', target: 'leaf1', label: 'Simple', style: { stroke: '#ef4444' } },
    { id: 'e11', source: 'expression-complexity', sourceHandle: 'yes', target: 'leaf4', label: 'Evaluate', style: { stroke: '#10b981' } },
    { id: 'e12', source: 'expression-complexity', sourceHandle: 'no', target: 'leaf3', label: 'Parse', style: { stroke: '#ef4444' } },
    { id: 'e13', source: 'pattern-complexity', sourceHandle: 'yes', target: 'leaf5', label: 'Complex', style: { stroke: '#10b981' } },
    { id: 'e14', source: 'monotonic-direction', sourceHandle: 'yes', target: 'leaf6', label: 'Greater', style: { stroke: '#10b981' } },
    { id: 'e15', source: 'monotonic-direction', sourceHandle: 'no', target: 'leaf7', label: 'Smaller', style: { stroke: '#ef4444' } },
    { id: 'e16', source: 'state-complexity', sourceHandle: 'yes', target: 'leaf9', label: 'Multi-op', style: { stroke: '#10b981' } },
    { id: 'e17', source: 'state-complexity', sourceHandle: 'no', target: 'leaf8', label: 'Simple', style: { stroke: '#ef4444' } },
    
    // Additional connections
    { id: 'e18', source: 'validation-type', target: 'leaf10', label: 'Min/Max', style: { stroke: '#8b5cf6' } },
    { id: 'e19', source: 'simulation-type', target: 'leaf11', label: 'Sorting', style: { stroke: '#8b5cf6' } },
    { id: 'e20', source: 'simulation-type', target: 'leaf12', label: 'Queue', style: { stroke: '#8b5cf6' } },
    { id: 'e21', source: 'simulation-type', target: 'leaf13', label: 'DFS', style: { stroke: '#8b5cf6' } },
    { id: 'e22', source: 'optimization-type', target: 'leaf14', label: 'Rectangle', style: { stroke: '#8b5cf6' } },
    { id: 'e23', source: 'optimization-type', target: 'leaf15', label: 'Rain Water', style: { stroke: '#8b5cf6' } },
    
    // Leaf nodes to Problem nodes
    { id: 'e24', source: 'leaf1', target: 'problems1', style: { stroke: '#f97316' } },
    { id: 'e25', source: 'leaf2', target: 'problems2', style: { stroke: '#f97316' } },
    { id: 'e26', source: 'leaf3', target: 'problems3', style: { stroke: '#f97316' } },
    { id: 'e27', source: 'leaf4', target: 'problems4', style: { stroke: '#f97316' } },
    { id: 'e28', source: 'leaf5', target: 'problems5', style: { stroke: '#f97316' } },
    { id: 'e29', source: 'leaf6', target: 'problems6', style: { stroke: '#f97316' } },
    { id: 'e30', source: 'leaf7', target: 'problems7', style: { stroke: '#f97316' } },
    { id: 'e31', source: 'leaf8', target: 'problems8', style: { stroke: '#f97316' } },
    { id: 'e32', source: 'leaf9', target: 'problems9', style: { stroke: '#f97316' } },
    { id: 'e33', source: 'leaf10', target: 'problems10', style: { stroke: '#f97316' } },
    { id: 'e34', source: 'leaf11', target: 'problems11', style: { stroke: '#f97316' } },
    { id: 'e35', source: 'leaf12', target: 'problems12', style: { stroke: '#f97316' } },
    { id: 'e36', source: 'leaf13', target: 'problems13', style: { stroke: '#f97316' } },
    { id: 'e37', source: 'leaf14', target: 'problems14', style: { stroke: '#f97316' } },
    { id: 'e38', source: 'leaf15', target: 'problems15', style: { stroke: '#f97316' } },
  ]
}

// Algorithm Approach Data (how to solve it?)
const algorithmApproachData = {
  nodes: [
    // Root
    {
      id: 'root',
      type: 'root',
      position: { x: 1000, y: 50 },
      data: { label: 'Stack Algorithms by Approach' }
    },
    
    // Level 1: Main algorithmic approaches
    {
      id: 'approach-type',
      type: 'decision',
      position: { x: 1000, y: 180 },
      data: { 
        label: 'What algorithmic approach do you need?',
        tooltip: 'Different algorithmic strategies for stack problems'
      }
    },

    // Level 2A: Basic Stack Operations
    {
      id: 'basic-operations',
      type: 'decision',
      position: { x: 300, y: 320 },
      data: { 
        label: 'What basic stack operation?',
        tooltip: 'Core stack push/pop patterns and validations'
      }
    },

    // Level 2B: Monotonic Stack
    {
      id: 'monotonic-strategy',
      type: 'decision',
      position: { x: 700, y: 320 },
      data: { 
        label: 'What monotonic stack pattern?',
        tooltip: 'Increasing or decreasing monotonic stack'
      }
    },

    // Level 2C: Two-Stack Techniques
    {
      id: 'two-stack-strategy',
      type: 'decision',
      position: { x: 1100, y: 320 },
      data: { 
        label: 'What two-stack technique?',
        tooltip: 'Using two stacks for complex operations'
      }
    },

    // Level 2D: Stack Simulation
    {
      id: 'simulation-strategy',
      type: 'decision',
      position: { x: 1500, y: 320 },
      data: { 
        label: 'What simulation approach?',
        tooltip: 'Stack for simulating other data structures or processes'
      }
    },

    // Level 3: Further refinement
    {
      id: 'validation-vs-construction',
      type: 'decision',
      position: { x: 150, y: 460 },
      data: { 
        label: 'Validation or construction?',
        tooltip: 'Validating existing vs constructing new'
      }
    },

    {
      id: 'tracking-vs-operations',
      type: 'decision',
      position: { x: 450, y: 460 },
      data: { 
        label: 'Tracking extremes or operations?',
        tooltip: 'Min/max tracking vs operation history'
      }
    },

    {
      id: 'direction-preference',
      type: 'decision',
      position: { x: 700, y: 460 },
      data: { 
        label: 'Next greater or smaller?',
        tooltip: 'Direction of monotonic stack comparison'
      }
    },

    {
      id: 'queue-vs-sorting',
      type: 'decision',
      position: { x: 1100, y: 460 },
      data: { 
        label: 'Queue simulation or sorting?',
        tooltip: 'Different two-stack applications'
      }
    },

    {
      id: 'traversal-vs-state',
      type: 'decision',
      position: { x: 1500, y: 460 },
      data: { 
        label: 'Traversal or state management?',
        tooltip: 'Tree/graph traversal vs state simulation'
      }
    },

    // Algorithm Approach Leaf Nodes
    {
      id: 'alg-leaf1',
      type: 'leaf',
      position: { x: 50, y: 600 },
      data: {
        technique: 'Stack Validation',
        approach: 'Use stack to validate sequences and patterns',
        complexity: 'O(n) time, O(n) space',
        useCases: 'Parentheses matching, sequence validation'
      }
    },

    {
      id: 'alg-leaf2',
      type: 'leaf',
      position: { x: 250, y: 600 },
      data: {
        technique: 'Stack Construction',
        approach: 'Build and manipulate stack during processing',
        complexity: 'O(n) time, O(n) space',
        useCases: 'Expression parsing, nested structure building'
      }
    },

    {
      id: 'alg-leaf3',
      type: 'leaf',
      position: { x: 350, y: 600 },
      data: {
        technique: 'Min/Max Stack',
        approach: 'Auxiliary stack for tracking extremes',
        complexity: 'O(1) operations, O(n) space',
        useCases: 'Minimum stack, maximum tracking, range queries'
      }
    },

    {
      id: 'alg-leaf4',
      type: 'leaf',
      position: { x: 550, y: 600 },
      data: {
        technique: 'Operation History Stack',
        approach: 'Stack for undo/redo and state management',
        complexity: 'O(1) operations, O(n) space',
        useCases: 'Browser history, undo operations, state tracking'
      }
    },

    {
      id: 'alg-leaf5',
      type: 'leaf',
      position: { x: 600, y: 600 },
      data: {
        technique: 'Next Greater Element',
        approach: 'Monotonic decreasing stack for comparisons',
        complexity: 'O(n) time, O(n) space',
        useCases: 'Stock span, daily temperatures, next greater'
      }
    },

    {
      id: 'alg-leaf6',
      type: 'leaf',
      position: { x: 800, y: 600 },
      data: {
        technique: 'Next Smaller Element',
        approach: 'Monotonic increasing stack for boundaries',
        complexity: 'O(n) time, O(n) space',
        useCases: 'Largest rectangle, histogram problems'
      }
    },

    {
      id: 'alg-leaf7',
      type: 'leaf',
      position: { x: 1000, y: 600 },
      data: {
        technique: 'Queue using Two Stacks',
        approach: 'Input and output stacks for FIFO simulation',
        complexity: 'O(1) amortized, O(n) space',
        useCases: 'Queue implementation, order reversal'
      }
    },

    {
      id: 'alg-leaf8',
      type: 'leaf',
      position: { x: 1200, y: 600 },
      data: {
        technique: 'Stack Sorting',
        approach: 'Use auxiliary stack for sorting elements',
        complexity: 'O(n²) time, O(n) space',
        useCases: 'Sort stack, arrange elements'
      }
    },

    {
      id: 'alg-leaf9',
      type: 'leaf',
      position: { x: 1400, y: 600 },
      data: {
        technique: 'Stack-based DFS',
        approach: 'Iterative traversal using explicit stack',
        complexity: 'O(V+E) time, O(V) space',
        useCases: 'Tree/graph traversal, avoiding recursion'
      }
    },

    {
      id: 'alg-leaf10',
      type: 'leaf',
      position: { x: 1600, y: 600 },
      data: {
        technique: 'Function Call Simulation',
        approach: 'Stack to simulate recursive function calls',
        complexity: 'O(n) time, O(h) space',
        useCases: 'Call stack simulation, recursive to iterative'
      }
    },

    {
      id: 'alg-leaf11',
      type: 'leaf',
      position: { x: 200, y: 760 },
      data: {
        technique: 'Expression Evaluation Stack',
        approach: 'Stack for operator precedence and evaluation',
        complexity: 'O(n) time, O(n) space',
        useCases: 'Calculator, postfix evaluation, expression parsing'
      }
    },

    {
      id: 'alg-leaf12',
      type: 'leaf',
      position: { x: 400, y: 760 },
      data: {
        technique: 'Backtracking Stack',
        approach: 'Stack for state backtracking and exploration',
        complexity: 'O(n!) time, O(n) space',
        useCases: 'Maze solving, permutation generation'
      }
    },

    {
      id: 'alg-leaf13',
      type: 'leaf',
      position: { x: 600, y: 760 },
      data: {
        technique: 'Monotonic Stack Optimization',
        approach: 'Stack for range optimization problems',
        complexity: 'O(n) time, O(n) space',
        useCases: 'Maximum rectangle, sliding window maximum'
      }
    },

    {
      id: 'alg-leaf14',
      type: 'leaf',
      position: { x: 800, y: 760 },
      data: {
        technique: 'Multi-Stack Coordination',
        approach: 'Multiple stacks working together',
        complexity: 'O(n) time, O(n) space',
        useCases: 'Complex simulations, multi-level undo'
      }
    },

    {
      id: 'alg-leaf15',
      type: 'leaf',
      position: { x: 1000, y: 760 },
      data: {
        technique: 'Stack-based Parsing',
        approach: 'Stack for syntax analysis and parsing',
        complexity: 'O(n) time, O(n) space',
        useCases: 'Compiler parsing, syntax validation'
      }
    },

    // Algorithm approach problem nodes
    {
      id: 'alg-problems1',
      type: 'problem',
      position: { x: 50, y: 740 },
      data: {
        problems: [
          { number: 20, title: 'Valid Parentheses', url: 'https://leetcode.com/problems/valid-parentheses/', difficulty: 'Easy' },
          { number: 946, title: 'Validate Stack Sequences', url: 'https://leetcode.com/problems/validate-stack-sequences/', difficulty: 'Medium' },
          { number: 1047, title: 'Remove All Adjacent Duplicates In String', url: 'https://leetcode.com/problems/remove-all-adjacent-duplicates-in-string/', difficulty: 'Easy' },
          { number: 1003, title: 'Check If Word Is Valid After Substitutions', url: 'https://leetcode.com/problems/check-if-word-is-valid-after-substitutions/', difficulty: 'Medium' },
        ]
      }
    },

    {
      id: 'alg-problems2',
      type: 'problem',
      position: { x: 250, y: 740 },
      data: {
        problems: [
          { number: 394, title: 'Decode String', url: 'https://leetcode.com/problems/decode-string/', difficulty: 'Medium' },
          { number: 636, title: 'Exclusive Time of Functions', url: 'https://leetcode.com/problems/exclusive-time-of-functions/', difficulty: 'Medium' },
          { number: 1209, title: 'Remove All Adjacent Duplicates in String II', url: 'https://leetcode.com/problems/remove-all-adjacent-duplicates-in-string-ii/', difficulty: 'Medium' },
          { number: 1597, title: 'Build Binary Expression Tree From Infix Expression', url: 'https://leetcode.com/problems/build-binary-expression-tree-from-infix-expression/', difficulty: 'Hard' },
        ]
      }
    },

    {
      id: 'alg-problems3',
      type: 'problem',
      position: { x: 350, y: 740 },
      data: {
        problems: [
          { number: 155, title: 'Min Stack', url: 'https://leetcode.com/problems/min-stack/', difficulty: 'Medium' },
          { number: 716, title: 'Max Stack', url: 'https://leetcode.com/problems/max-stack/', difficulty: 'Hard' },
          { number: 1381, title: 'Design a Stack With Increment Operation', url: 'https://leetcode.com/problems/design-a-stack-with-increment-operation/', difficulty: 'Medium' },
          { number: 895, title: 'Maximum Frequency Stack', url: 'https://leetcode.com/problems/maximum-frequency-stack/', difficulty: 'Hard' },
        ]
      }
    },

    {
      id: 'alg-problems4',
      type: 'problem',
      position: { x: 550, y: 740 },
      data: {
        problems: [
          { number: 1472, title: 'Design Browser History', url: 'https://leetcode.com/problems/design-browser-history/', difficulty: 'Medium' },
          { number: 1441, title: 'Build an Array With Stack Operations', url: 'https://leetcode.com/problems/build-an-array-with-stack-operations/', difficulty: 'Medium' },
          { number: 1396, title: 'Design Underground System', url: 'https://leetcode.com/problems/design-underground-system/', difficulty: 'Medium' },
          { number: 341, title: 'Flatten Nested List Iterator', url: 'https://leetcode.com/problems/flatten-nested-list-iterator/', difficulty: 'Medium' },
        ]
      }
    },

    {
      id: 'alg-problems5',
      type: 'problem',
      position: { x: 600, y: 740 },
      data: {
        problems: [
          { number: 496, title: 'Next Greater Element I', url: 'https://leetcode.com/problems/next-greater-element-i/', difficulty: 'Easy' },
          { number: 503, title: 'Next Greater Element II', url: 'https://leetcode.com/problems/next-greater-element-ii/', difficulty: 'Medium' },
          { number: 739, title: 'Daily Temperatures', url: 'https://leetcode.com/problems/daily-temperatures/', difficulty: 'Medium' },
          { number: 901, title: 'Online Stock Span', url: 'https://leetcode.com/problems/online-stock-span/', difficulty: 'Medium' },
        ]
      }
    },

    {
      id: 'alg-problems6',
      type: 'problem',
      position: { x: 800, y: 740 },
      data: {
        problems: [
          { number: 84, title: 'Largest Rectangle in Histogram', url: 'https://leetcode.com/problems/largest-rectangle-in-histogram/', difficulty: 'Hard' },
          { number: 85, title: 'Maximal Rectangle', url: 'https://leetcode.com/problems/maximal-rectangle/', difficulty: 'Hard' },
          { number: 42, title: 'Trapping Rain Water', url: 'https://leetcode.com/problems/trapping-rain-water/', difficulty: 'Hard' },
          { number: 456, title: '132 Pattern', url: 'https://leetcode.com/problems/132-pattern/', difficulty: 'Medium' },
        ]
      }
    },

    {
      id: 'alg-problems7',
      type: 'problem',
      position: { x: 1000, y: 740 },
      data: {
        problems: [
          { number: 232, title: 'Implement Queue using Stacks', url: 'https://leetcode.com/problems/implement-queue-using-stacks/', difficulty: 'Easy' },
          { number: 225, title: 'Implement Stack using Queues', url: 'https://leetcode.com/problems/implement-stack-using-queues/', difficulty: 'Easy' },
          { number: 622, title: 'Design Circular Queue', url: 'https://leetcode.com/problems/design-circular-queue/', difficulty: 'Medium' },
          { number: 641, title: 'Design Circular Deque', url: 'https://leetcode.com/problems/design-circular-deque/', difficulty: 'Medium' },
        ]
      }
    },

    {
      id: 'alg-problems8',
      type: 'problem',
      position: { x: 1200, y: 740 },
      data: {
        problems: [
          { number: 1047, title: 'Remove All Adjacent Duplicates In String', url: 'https://leetcode.com/problems/remove-all-adjacent-duplicates-in-string/', difficulty: 'Easy' },
          { number: 1544, title: 'Make The String Great', url: 'https://leetcode.com/problems/make-the-string-great/', difficulty: 'Easy' },
          { number: 735, title: 'Asteroid Collision', url: 'https://leetcode.com/problems/asteroid-collision/', difficulty: 'Medium' },
          { number: 1776, title: 'Car Fleet II', url: 'https://leetcode.com/problems/car-fleet-ii/', difficulty: 'Hard' },
        ]
      }
    },

    {
      id: 'alg-problems9',
      type: 'problem',
      position: { x: 1400, y: 740 },
      data: {
        problems: [
          { number: 144, title: 'Binary Tree Preorder Traversal', url: 'https://leetcode.com/problems/binary-tree-preorder-traversal/', difficulty: 'Easy' },
          { number: 94, title: 'Binary Tree Inorder Traversal', url: 'https://leetcode.com/problems/binary-tree-inorder-traversal/', difficulty: 'Easy' },
          { number: 145, title: 'Binary Tree Postorder Traversal', url: 'https://leetcode.com/problems/binary-tree-postorder-traversal/', difficulty: 'Easy' },
          { number: 589, title: 'N-ary Tree Preorder Traversal', url: 'https://leetcode.com/problems/n-ary-tree-preorder-traversal/', difficulty: 'Easy' },
        ]
      }
    },

    {
      id: 'alg-problems10',
      type: 'problem',
      position: { x: 1600, y: 740 },
      data: {
        problems: [
          { number: 173, title: 'Binary Search Tree Iterator', url: 'https://leetcode.com/problems/binary-search-tree-iterator/', difficulty: 'Medium' },
          { number: 331, title: 'Verify Preorder Serialization of a Binary Tree', url: 'https://leetcode.com/problems/verify-preorder-serialization-of-a-binary-tree/', difficulty: 'Medium' },
          { number: 385, title: 'Mini Parser', url: 'https://leetcode.com/problems/mini-parser/', difficulty: 'Medium' },
          { number: 1628, title: 'Design an Expression Tree With Evaluate Function', url: 'https://leetcode.com/problems/design-an-expression-tree-with-evaluate-function/', difficulty: 'Medium' },
        ]
      }
    },

    {
      id: 'alg-problems11',
      type: 'problem',
      position: { x: 200, y: 900 },
      data: {
        problems: [
          { number: 150, title: 'Evaluate Reverse Polish Notation', url: 'https://leetcode.com/problems/evaluate-reverse-polish-notation/', difficulty: 'Medium' },
          { number: 224, title: 'Basic Calculator', url: 'https://leetcode.com/problems/basic-calculator/', difficulty: 'Hard' },
          { number: 227, title: 'Basic Calculator II', url: 'https://leetcode.com/problems/basic-calculator-ii/', difficulty: 'Medium' },
          { number: 772, title: 'Basic Calculator III', url: 'https://leetcode.com/problems/basic-calculator-iii/', difficulty: 'Hard' },
        ]
      }
    },

    {
      id: 'alg-problems12',
      type: 'problem',
      position: { x: 400, y: 900 },
      data: {
        problems: [
          { number: 22, title: 'Generate Parentheses', url: 'https://leetcode.com/problems/generate-parentheses/', difficulty: 'Medium' },
          { number: 39, title: 'Combination Sum', url: 'https://leetcode.com/problems/combination-sum/', difficulty: 'Medium' },
          { number: 46, title: 'Permutations', url: 'https://leetcode.com/problems/permutations/', difficulty: 'Medium' },
          { number: 77, title: 'Combinations', url: 'https://leetcode.com/problems/combinations/', difficulty: 'Medium' },
        ]
      }
    },

    {
      id: 'alg-problems13',
      type: 'problem',
      position: { x: 600, y: 900 },
      data: {
        problems: [
          { number: 1504, title: 'Count Submatrices With All Ones', url: 'https://leetcode.com/problems/count-submatrices-with-all-ones/', difficulty: 'Medium' },
          { number: 1793, title: 'Maximum Score of a Good Subarray', url: 'https://leetcode.com/problems/maximum-score-of-a-good-subarray/', difficulty: 'Hard' },
          { number: 907, title: 'Sum of Subarray Minimums', url: 'https://leetcode.com/problems/sum-of-subarray-minimums/', difficulty: 'Medium' },
          { number: 1856, title: 'Maximum Subarray Min-Product', url: 'https://leetcode.com/problems/maximum-subarray-min-product/', difficulty: 'Medium' },
        ]
      }
    },

    {
      id: 'alg-problems14',
      type: 'problem',
      position: { x: 800, y: 900 },
      data: {
        problems: [
          { number: 856, title: 'Score of Parentheses', url: 'https://leetcode.com/problems/score-of-parentheses/', difficulty: 'Medium' },
          { number: 1190, title: 'Reverse Substrings Between Each Pair of Parentheses', url: 'https://leetcode.com/problems/reverse-substrings-between-each-pair-of-parentheses/', difficulty: 'Medium' },
          { number: 1019, title: 'Next Greater Node In Linked List', url: 'https://leetcode.com/problems/next-greater-node-in-linked-list/', difficulty: 'Medium' },
          { number: 1021, title: 'Remove Outermost Parentheses', url: 'https://leetcode.com/problems/remove-outermost-parentheses/', difficulty: 'Easy' },
        ]
      }
    },

    {
      id: 'alg-problems15',
      type: 'problem',
      position: { x: 1000, y: 900 },
      data: {
        problems: [
          { number: 71, title: 'Simplify Path', url: 'https://leetcode.com/problems/simplify-path/', difficulty: 'Medium' },
          { number: 726, title: 'Number of Atoms', url: 'https://leetcode.com/problems/number-of-atoms/', difficulty: 'Hard' },
          { number: 1249, title: 'Minimum Remove to Make Valid Parentheses', url: 'https://leetcode.com/problems/minimum-remove-to-make-valid-parentheses/', difficulty: 'Medium' },
          { number: 921, title: 'Minimum Add to Make Parentheses Valid', url: 'https://leetcode.com/problems/minimum-add-to-make-parentheses-valid/', difficulty: 'Medium' },
        ]
      }
    },
  ],
  
  edges: [
    // Root to Level 1
    { id: 'alg-e1', source: 'root', target: 'approach-type', animated: true },
    
    // Level 1 to Level 2
    { id: 'alg-e2', source: 'approach-type', sourceHandle: 'yes', target: 'basic-operations', label: 'Basic', style: { stroke: '#10b981' } },
    { id: 'alg-e3', source: 'approach-type', sourceHandle: 'no', target: 'monotonic-strategy', label: 'Monotonic', style: { stroke: '#ef4444' } },
    
    // Additional branches
    { id: 'alg-e3b', source: 'monotonic-strategy', sourceHandle: 'no', target: 'two-stack-strategy', label: 'Two-Stack', style: { stroke: '#ef4444' } },
    { id: 'alg-e3c', source: 'two-stack-strategy', sourceHandle: 'no', target: 'simulation-strategy', label: 'Simulation', style: { stroke: '#ef4444' } },
    
    // Level 2 to Level 3
    { id: 'alg-e4', source: 'basic-operations', sourceHandle: 'yes', target: 'validation-vs-construction', label: 'Core Ops', style: { stroke: '#10b981' } },
    { id: 'alg-e5', source: 'basic-operations', sourceHandle: 'no', target: 'tracking-vs-operations', label: 'Advanced', style: { stroke: '#ef4444' } },
    { id: 'alg-e6', source: 'monotonic-strategy', sourceHandle: 'yes', target: 'direction-preference', label: 'Direction', style: { stroke: '#10b981' } },
    { id: 'alg-e7', source: 'two-stack-strategy', sourceHandle: 'yes', target: 'queue-vs-sorting', label: 'Application', style: { stroke: '#10b981' } },
    { id: 'alg-e8', source: 'simulation-strategy', sourceHandle: 'yes', target: 'traversal-vs-state', label: 'Type', style: { stroke: '#10b981' } },
    
    // Level 3 to Leaves
    { id: 'alg-e9', source: 'validation-vs-construction', sourceHandle: 'yes', target: 'alg-leaf1', label: 'Validation', style: { stroke: '#10b981' } },
    { id: 'alg-e10', source: 'validation-vs-construction', sourceHandle: 'no', target: 'alg-leaf2', label: 'Construction', style: { stroke: '#ef4444' } },
    { id: 'alg-e11', source: 'tracking-vs-operations', sourceHandle: 'yes', target: 'alg-leaf3', label: 'Tracking', style: { stroke: '#10b981' } },
    { id: 'alg-e12', source: 'tracking-vs-operations', sourceHandle: 'no', target: 'alg-leaf4', label: 'Operations', style: { stroke: '#ef4444' } },
    { id: 'alg-e13', source: 'direction-preference', sourceHandle: 'yes', target: 'alg-leaf5', label: 'Greater', style: { stroke: '#10b981' } },
    { id: 'alg-e14', source: 'direction-preference', sourceHandle: 'no', target: 'alg-leaf6', label: 'Smaller', style: { stroke: '#ef4444' } },
    { id: 'alg-e15', source: 'queue-vs-sorting', sourceHandle: 'yes', target: 'alg-leaf7', label: 'Queue', style: { stroke: '#10b981' } },
    { id: 'alg-e16', source: 'queue-vs-sorting', sourceHandle: 'no', target: 'alg-leaf8', label: 'Sorting', style: { stroke: '#ef4444' } },
    { id: 'alg-e17', source: 'traversal-vs-state', sourceHandle: 'yes', target: 'alg-leaf9', label: 'Traversal', style: { stroke: '#10b981' } },
    { id: 'alg-e18', source: 'traversal-vs-state', sourceHandle: 'no', target: 'alg-leaf10', label: 'State', style: { stroke: '#ef4444' } },
    
    // Additional connections
    { id: 'alg-e19', source: 'basic-operations', target: 'alg-leaf11', label: 'Expression', style: { stroke: '#8b5cf6' } },
    { id: 'alg-e20', source: 'simulation-strategy', target: 'alg-leaf12', label: 'Backtrack', style: { stroke: '#8b5cf6' } },
    { id: 'alg-e21', source: 'monotonic-strategy', target: 'alg-leaf13', label: 'Optimization', style: { stroke: '#8b5cf6' } },
    { id: 'alg-e22', source: 'two-stack-strategy', target: 'alg-leaf14', label: 'Multi-Stack', style: { stroke: '#8b5cf6' } },
    { id: 'alg-e23', source: 'simulation-strategy', target: 'alg-leaf15', label: 'Parsing', style: { stroke: '#8b5cf6' } },
    
    // Leaf nodes to Problem nodes
    { id: 'alg-e24', source: 'alg-leaf1', target: 'alg-problems1', style: { stroke: '#f97316' } },
    { id: 'alg-e25', source: 'alg-leaf2', target: 'alg-problems2', style: { stroke: '#f97316' } },
    { id: 'alg-e26', source: 'alg-leaf3', target: 'alg-problems3', style: { stroke: '#f97316' } },
    { id: 'alg-e27', source: 'alg-leaf4', target: 'alg-problems4', style: { stroke: '#f97316' } },
    { id: 'alg-e28', source: 'alg-leaf5', target: 'alg-problems5', style: { stroke: '#f97316' } },
    { id: 'alg-e29', source: 'alg-leaf6', target: 'alg-problems6', style: { stroke: '#f97316' } },
    { id: 'alg-e30', source: 'alg-leaf7', target: 'alg-problems7', style: { stroke: '#f97316' } },
    { id: 'alg-e31', source: 'alg-leaf8', target: 'alg-problems8', style: { stroke: '#f97316' } },
    { id: 'alg-e32', source: 'alg-leaf9', target: 'alg-problems9', style: { stroke: '#f97316' } },
    { id: 'alg-e33', source: 'alg-leaf10', target: 'alg-problems10', style: { stroke: '#f97316' } },
    { id: 'alg-e34', source: 'alg-leaf11', target: 'alg-problems11', style: { stroke: '#f97316' } },
    { id: 'alg-e35', source: 'alg-leaf12', target: 'alg-problems12', style: { stroke: '#f97316' } },
    { id: 'alg-e36', source: 'alg-leaf13', target: 'alg-problems13', style: { stroke: '#f97316' } },
    { id: 'alg-e37', source: 'alg-leaf14', target: 'alg-problems14', style: { stroke: '#f97316' } },
    { id: 'alg-e38', source: 'alg-leaf15', target: 'alg-problems15', style: { stroke: '#f97316' } },
  ]
}
// Data Pattern Data (what data pattern?)
const dataPatternData = {
  nodes: [
    // Root
    {
      id: 'root',
      type: 'root',
      position: { x: 1000, y: 50 },
      data: { label: 'Stack by Data Pattern' }
    },
    
    // Level 1: Main data patterns
    {
      id: 'pattern-type',
      type: 'decision',
      position: { x: 1000, y: 180 },
      data: { 
        label: 'What data structure pattern?',
        tooltip: 'Different data patterns that benefit from stack'
      }
    },

    // Level 2A: Nested Structures
    {
      id: 'nested-pattern',
      type: 'decision',
      position: { x: 400, y: 320 },
      data: { 
        label: 'What type of nesting?',
        tooltip: 'Different nested structure patterns'
      }
    },

    // Level 2B: Sequential Processing
    {
      id: 'sequential-pattern',
      type: 'decision',
      position: { x: 800, y: 320 },
      data: { 
        label: 'What sequential pattern?',
        tooltip: 'One-pass algorithms and streaming data'
      }
    },

    // Level 2C: Optimization Patterns
    {
      id: 'optimization-pattern',
      type: 'decision',
      position: { x: 1200, y: 320 },
      data: { 
        label: 'What optimization goal?',
        tooltip: 'Stack for optimization problems'
      }
    },

    // Level 2D: State Management
    {
      id: 'state-pattern',
      type: 'decision',
      position: { x: 1600, y: 320 },
      data: { 
        label: 'What state management?',
        tooltip: 'History tracking and reversible operations'
      }
    },

    // Level 3: Further refinement
    {
      id: 'bracket-vs-hierarchical',
      type: 'decision',
      position: { x: 200, y: 460 },
      data: { 
        label: 'Brackets or hierarchical data?',
        tooltip: 'Simple brackets vs complex hierarchical structures'
      }
    },

    {
      id: 'call-vs-expression',
      type: 'decision',
      position: { x: 600, y: 460 },
      data: { 
        label: 'Function calls or expressions?',
        tooltip: 'Function call structures vs expression evaluation'
      }
    },

    {
      id: 'single-vs-multiple',
      type: 'decision',
      position: { x: 800, y: 460 },
      data: { 
        label: 'Single pass or multiple elements?',
        tooltip: 'One-pass validation vs multi-element processing'
      }
    },

    {
      id: 'range-vs-extremes',
      type: 'decision',
      position: { x: 1200, y: 460 },
      data: { 
        label: 'Range queries or extremes?',
        tooltip: 'Range optimization vs extreme value tracking'
      }
    },

    {
      id: 'history-vs-operations',
      type: 'decision',
      position: { x: 1600, y: 460 },
      data: { 
        label: 'History tracking or operations?',
        tooltip: 'State history vs operation management'
      }
    },

    // Data Pattern Leaf Nodes
    {
      id: 'data-leaf1',
      type: 'leaf',
      position: { x: 100, y: 600 },
      data: {
        technique: 'Bracket Matching Pattern',
        approach: 'Stack for balanced bracket validation',
        complexity: 'O(n) time, O(n) space',
        useCases: 'Parentheses, brackets, code validation'
      }
    },

    {
      id: 'data-leaf2',
      type: 'leaf',
      position: { x: 300, y: 600 },
      data: {
        technique: 'Hierarchical Data Pattern',
        approach: 'Stack for nested structure processing',
        complexity: 'O(n) time, O(d) space where d is depth',
        useCases: 'JSON parsing, XML processing, nested objects'
      }
    },

    {
      id: 'data-leaf3',
      type: 'leaf',
      position: { x: 500, y: 600 },
      data: {
        technique: 'Function Call Pattern',
        approach: 'Stack for call stack simulation',
        complexity: 'O(n) time, O(h) space',
        useCases: 'Recursion to iteration, call tracking'
      }
    },

    {
      id: 'data-leaf4',
      type: 'leaf',
      position: { x: 700, y: 600 },
      data: {
        technique: 'Expression Evaluation Pattern',
        approach: 'Stack for operator precedence handling',
        complexity: 'O(n) time, O(n) space',
        useCases: 'Calculator, mathematical expressions'
      }
    },

    {
      id: 'data-leaf5',
      type: 'leaf',
      position: { x: 750, y: 600 },
      data: {
        technique: 'One-Pass Validation Pattern',
        approach: 'Stack for single-pass sequence validation',
        complexity: 'O(n) time, O(n) space',
        useCases: 'Sequence validation, pattern matching'
      }
    },

    {
      id: 'data-leaf6',
      type: 'leaf',
      position: { x: 950, y: 600 },
      data: {
        technique: 'Multi-Element Processing Pattern',
        approach: 'Stack for comparing multiple elements',
        complexity: 'O(n) time, O(n) space',
        useCases: 'Next greater/smaller, comparisons'
      }
    },

    {
      id: 'data-leaf7',
      type: 'leaf',
      position: { x: 1100, y: 600 },
      data: {
        technique: 'Range Optimization Pattern',
        approach: 'Stack for range-based optimization',
        complexity: 'O(n) time, O(n) space',
        useCases: 'Largest rectangle, subarray problems'
      }
    },

    {
      id: 'data-leaf8',
      type: 'leaf',
      position: { x: 1300, y: 600 },
      data: {
        technique: 'Extreme Value Pattern',
        approach: 'Stack for tracking min/max values',
        complexity: 'O(1) operations, O(n) space',
        useCases: 'Min/max stack, sliding window extremes'
      }
    },

    {
      id: 'data-leaf9',
      type: 'leaf',
      position: { x: 1500, y: 600 },
      data: {
        technique: 'History Tracking Pattern',
        approach: 'Stack for maintaining operation history',
        complexity: 'O(1) operations, O(n) space',
        useCases: 'Undo/redo, browser history, state tracking'
      }
    },

    {
      id: 'data-leaf10',
      type: 'leaf',
      position: { x: 1700, y: 600 },
      data: {
        technique: 'Operation Management Pattern',
        approach: 'Stack for managing complex operations',
        complexity: 'O(n) time, O(n) space',
        useCases: 'Multi-step operations, transaction management'
      }
    },

    {
      id: 'data-leaf11',
      type: 'leaf',
      position: { x: 200, y: 760 },
      data: {
        technique: 'Monotonic Sequence Pattern',
        approach: 'Stack maintaining monotonic property',
        complexity: 'O(n) time, O(n) space',
        useCases: 'Increasing/decreasing sequences'
      }
    },

    {
      id: 'data-leaf12',
      type: 'leaf',
      position: { x: 400, y: 760 },
      data: {
        technique: 'LIFO Processing Pattern',
        approach: 'Stack for last-in-first-out processing',
        complexity: 'O(n) time, O(n) space',
        useCases: 'Reverse processing, backtracking'
      }
    },

    {
      id: 'data-leaf13',
      type: 'leaf',
      position: { x: 600, y: 760 },
      data: {
        technique: 'Delimiter Matching Pattern',
        approach: 'Stack for matching opening/closing delimiters',
        complexity: 'O(n) time, O(n) space',
        useCases: 'String validation, syntax checking'
      }
    },

    {
      id: 'data-leaf14',
      type: 'leaf',
      position: { x: 800, y: 760 },
      data: {
        technique: 'Temporary Storage Pattern',
        approach: 'Stack as temporary storage for algorithms',
        complexity: 'O(n) time, O(n) space',
        useCases: 'Algorithm optimization, intermediate storage'
      }
    },

    {
      id: 'data-leaf15',
      type: 'leaf',
      position: { x: 1000, y: 760 },
      data: {
        technique: 'State Machine Pattern',
        approach: 'Stack for state machine implementation',
        complexity: 'O(n) time, O(k) space',
        useCases: 'Parser states, game states, workflow'
      }
    },

    // Data pattern problem nodes
    {
      id: 'data-problems1',
      type: 'problem',
      position: { x: 100, y: 740 },
      data: {
        problems: [
          { number: 20, title: 'Valid Parentheses', url: 'https://leetcode.com/problems/valid-parentheses/', difficulty: 'Easy' },
          { number: 1021, title: 'Remove Outermost Parentheses', url: 'https://leetcode.com/problems/remove-outermost-parentheses/', difficulty: 'Easy' },
          { number: 921, title: 'Minimum Add to Make Parentheses Valid', url: 'https://leetcode.com/problems/minimum-add-to-make-parentheses-valid/', difficulty: 'Medium' },
          { number: 1249, title: 'Minimum Remove to Make Valid Parentheses', url: 'https://leetcode.com/problems/minimum-remove-to-make-valid-parentheses/', difficulty: 'Medium' },
        ]
      }
    },

    {
      id: 'data-problems2',
      type: 'problem',
      position: { x: 300, y: 740 },
      data: {
        problems: [
          { number: 394, title: 'Decode String', url: 'https://leetcode.com/problems/decode-string/', difficulty: 'Medium' },
          { number: 726, title: 'Number of Atoms', url: 'https://leetcode.com/problems/number-of-atoms/', difficulty: 'Hard' },
          { number: 385, title: 'Mini Parser', url: 'https://leetcode.com/problems/mini-parser/', difficulty: 'Medium' },
          { number: 636, title: 'Exclusive Time of Functions', url: 'https://leetcode.com/problems/exclusive-time-of-functions/', difficulty: 'Medium' },
        ]
      }
    },

    {
      id: 'data-problems3',
      type: 'problem',
      position: { x: 500, y: 740 },
      data: {
        problems: [
          { number: 331, title: 'Verify Preorder Serialization of a Binary Tree', url: 'https://leetcode.com/problems/verify-preorder-serialization-of-a-binary-tree/', difficulty: 'Medium' },
          { number: 341, title: 'Flatten Nested List Iterator', url: 'https://leetcode.com/problems/flatten-nested-list-iterator/', difficulty: 'Medium' },
          { number: 173, title: 'Binary Search Tree Iterator', url: 'https://leetcode.com/problems/binary-search-tree-iterator/', difficulty: 'Medium' },
          { number: 1628, title: 'Design an Expression Tree With Evaluate Function', url: 'https://leetcode.com/problems/design-an-expression-tree-with-evaluate-function/', difficulty: 'Medium' },
        ]
      }
    },

    {
      id: 'data-problems4',
      type: 'problem',
      position: { x: 700, y: 740 },
      data: {
        problems: [
          { number: 150, title: 'Evaluate Reverse Polish Notation', url: 'https://leetcode.com/problems/evaluate-reverse-polish-notation/', difficulty: 'Medium' },
          { number: 224, title: 'Basic Calculator', url: 'https://leetcode.com/problems/basic-calculator/', difficulty: 'Hard' },
          { number: 227, title: 'Basic Calculator II', url: 'https://leetcode.com/problems/basic-calculator-ii/', difficulty: 'Medium' },
          { number: 772, title: 'Basic Calculator III', url: 'https://leetcode.com/problems/basic-calculator-iii/', difficulty: 'Hard' },
        ]
      }
    },

    {
      id: 'data-problems5',
      type: 'problem',
      position: { x: 750, y: 740 },
      data: {
        problems: [
          { number: 946, title: 'Validate Stack Sequences', url: 'https://leetcode.com/problems/validate-stack-sequences/', difficulty: 'Medium' },
          { number: 1003, title: 'Check If Word Is Valid After Substitutions', url: 'https://leetcode.com/problems/check-if-word-is-valid-after-substitutions/', difficulty: 'Medium' },
          { number: 1047, title: 'Remove All Adjacent Duplicates In String', url: 'https://leetcode.com/problems/remove-all-adjacent-duplicates-in-string/', difficulty: 'Easy' },
          { number: 1544, title: 'Make The String Great', url: 'https://leetcode.com/problems/make-the-string-great/', difficulty: 'Easy' },
        ]
      }
    },

    {
      id: 'data-problems6',
      type: 'problem',
      position: { x: 950, y: 740 },
      data: {
        problems: [
          { number: 496, title: 'Next Greater Element I', url: 'https://leetcode.com/problems/next-greater-element-i/', difficulty: 'Easy' },
          { number: 503, title: 'Next Greater Element II', url: 'https://leetcode.com/problems/next-greater-element-ii/', difficulty: 'Medium' },
          { number: 739, title: 'Daily Temperatures', url: 'https://leetcode.com/problems/daily-temperatures/', difficulty: 'Medium' },
          { number: 1019, title: 'Next Greater Node In Linked List', url: 'https://leetcode.com/problems/next-greater-node-in-linked-list/', difficulty: 'Medium' },
        ]
      }
    },

    {
      id: 'data-problems7',
      type: 'problem',
      position: { x: 1100, y: 740 },
      data: {
        problems: [
          { number: 84, title: 'Largest Rectangle in Histogram', url: 'https://leetcode.com/problems/largest-rectangle-in-histogram/', difficulty: 'Hard' },
          { number: 85, title: 'Maximal Rectangle', url: 'https://leetcode.com/problems/maximal-rectangle/', difficulty: 'Hard' },
          { number: 1504, title: 'Count Submatrices With All Ones', url: 'https://leetcode.com/problems/count-submatrices-with-all-ones/', difficulty: 'Medium' },
          { number: 1793, title: 'Maximum Score of a Good Subarray', url: 'https://leetcode.com/problems/maximum-score-of-a-good-subarray/', difficulty: 'Hard' },
        ]
      }
    },

    {
      id: 'data-problems8',
      type: 'problem',
      position: { x: 1300, y: 740 },
      data: {
        problems: [
          { number: 155, title: 'Min Stack', url: 'https://leetcode.com/problems/min-stack/', difficulty: 'Medium' },
          { number: 716, title: 'Max Stack', url: 'https://leetcode.com/problems/max-stack/', difficulty: 'Hard' },
          { number: 895, title: 'Maximum Frequency Stack', url: 'https://leetcode.com/problems/maximum-frequency-stack/', difficulty: 'Hard' },
          { number: 1381, title: 'Design a Stack With Increment Operation', url: 'https://leetcode.com/problems/design-a-stack-with-increment-operation/', difficulty: 'Medium' },
        ]
      }
    },

    {
      id: 'data-problems9',
      type: 'problem',
      position: { x: 1500, y: 740 },
      data: {
        problems: [
          { number: 1472, title: 'Design Browser History', url: 'https://leetcode.com/problems/design-browser-history/', difficulty: 'Medium' },
          { number: 1441, title: 'Build an Array With Stack Operations', url: 'https://leetcode.com/problems/build-an-array-with-stack-operations/', difficulty: 'Medium' },
          { number: 1396, title: 'Design Underground System', url: 'https://leetcode.com/problems/design-underground-system/', difficulty: 'Medium' },
          { number: 146, title: 'LRU Cache', url: 'https://leetcode.com/problems/lru-cache/', difficulty: 'Medium' },
        ]
      }
    },

    {
      id: 'data-problems10',
      type: 'problem',
      position: { x: 1700, y: 740 },
      data: {
        problems: [
          { number: 622, title: 'Design Circular Queue', url: 'https://leetcode.com/problems/design-circular-queue/', difficulty: 'Medium' },
          { number: 232, title: 'Implement Queue using Stacks', url: 'https://leetcode.com/problems/implement-queue-using-stacks/', difficulty: 'Easy' },
          { number: 225, title: 'Implement Stack using Queues', url: 'https://leetcode.com/problems/implement-stack-using-queues/', difficulty: 'Easy' },
          { number: 641, title: 'Design Circular Deque', url: 'https://leetcode.com/problems/design-circular-deque/', difficulty: 'Medium' },
        ]
      }
    },

    {
      id: 'data-problems11',
      type: 'problem',
      position: { x: 200, y: 900 },
      data: {
        problems: [
          { number: 901, title: 'Online Stock Span', url: 'https://leetcode.com/problems/online-stock-span/', difficulty: 'Medium' },
          { number: 456, title: '132 Pattern', url: 'https://leetcode.com/problems/132-pattern/', difficulty: 'Medium' },
          { number: 907, title: 'Sum of Subarray Minimums', url: 'https://leetcode.com/problems/sum-of-subarray-minimums/', difficulty: 'Medium' },
          { number: 1856, title: 'Maximum Subarray Min-Product', url: 'https://leetcode.com/problems/maximum-subarray-min-product/', difficulty: 'Medium' },
        ]
      }
    },

    {
      id: 'data-problems12',
      type: 'problem',
      position: { x: 400, y: 900 },
      data: {
        problems: [
          { number: 144, title: 'Binary Tree Preorder Traversal', url: 'https://leetcode.com/problems/binary-tree-preorder-traversal/', difficulty: 'Easy' },
          { number: 94, title: 'Binary Tree Inorder Traversal', url: 'https://leetcode.com/problems/binary-tree-inorder-traversal/', difficulty: 'Easy' },
          { number: 145, title: 'Binary Tree Postorder Traversal', url: 'https://leetcode.com/problems/binary-tree-postorder-traversal/', difficulty: 'Easy' },
          { number: 589, title: 'N-ary Tree Preorder Traversal', url: 'https://leetcode.com/problems/n-ary-tree-preorder-traversal/', difficulty: 'Easy' },
        ]
      }
    },

    {
      id: 'data-problems13',
      type: 'problem',
      position: { x: 600, y: 900 },
      data: {
        problems: [
          { number: 856, title: 'Score of Parentheses', url: 'https://leetcode.com/problems/score-of-parentheses/', difficulty: 'Medium' },
          { number: 1190, title: 'Reverse Substrings Between Each Pair of Parentheses', url: 'https://leetcode.com/problems/reverse-substrings-between-each-pair-of-parentheses/', difficulty: 'Medium' },
          { number: 678, title: 'Valid Parenthesis String', url: 'https://leetcode.com/problems/valid-parenthesis-string/', difficulty: 'Medium' },
          { number: 32, title: 'Longest Valid Parentheses', url: 'https://leetcode.com/problems/longest-valid-parentheses/', difficulty: 'Hard' },
        ]
      }
    },

    {
      id: 'data-problems14',
      type: 'problem',
      position: { x: 800, y: 900 },
      data: {
        problems: [
          { number: 735, title: 'Asteroid Collision', url: 'https://leetcode.com/problems/asteroid-collision/', difficulty: 'Medium' },
          { number: 42, title: 'Trapping Rain Water', url: 'https://leetcode.com/problems/trapping-rain-water/', difficulty: 'Hard' },
          { number: 1776, title: 'Car Fleet II', url: 'https://leetcode.com/problems/car-fleet-ii/', difficulty: 'Hard' },
          { number: 71, title: 'Simplify Path', url: 'https://leetcode.com/problems/simplify-path/', difficulty: 'Medium' },
        ]
      }
    },

    {
      id: 'data-problems15',
      type: 'problem',
      position: { x: 1000, y: 900 },
      data: {
        problems: [
          { number: 1209, title: 'Remove All Adjacent Duplicates in String II', url: 'https://leetcode.com/problems/remove-all-adjacent-duplicates-in-string-ii/', difficulty: 'Medium' },
          { number: 1597, title: 'Build Binary Expression Tree From Infix Expression', url: 'https://leetcode.com/problems/build-binary-expression-tree-from-infix-expression/', difficulty: 'Hard' },
          { number: 255, title: 'Verify Preorder Sequence in Binary Search Tree', url: 'https://leetcode.com/problems/verify-preorder-sequence-in-binary-search-tree/', difficulty: 'Medium' },
          { number: 1115, title: 'Print FooBar Alternately', url: 'https://leetcode.com/problems/print-foobar-alternately/', difficulty: 'Medium' },
        ]
      }
    },
  ],
  
  edges: [
    // Root to Level 1
    { id: 'data-e1', source: 'root', target: 'pattern-type', animated: true },
    
    // Level 1 to Level 2
    { id: 'data-e2', source: 'pattern-type', sourceHandle: 'yes', target: 'nested-pattern', label: 'Nested', style: { stroke: '#10b981' } },
    { id: 'data-e3', source: 'pattern-type', sourceHandle: 'no', target: 'sequential-pattern', label: 'Sequential', style: { stroke: '#ef4444' } },
    
    // Additional branches
    { id: 'data-e3b', source: 'sequential-pattern', sourceHandle: 'no', target: 'optimization-pattern', label: 'Optimization', style: { stroke: '#ef4444' } },
    { id: 'data-e3c', source: 'optimization-pattern', sourceHandle: 'no', target: 'state-pattern', label: 'State', style: { stroke: '#ef4444' } },
    
    // Level 2 to Level 3
    { id: 'data-e4', source: 'nested-pattern', sourceHandle: 'yes', target: 'bracket-vs-hierarchical', label: 'Structure', style: { stroke: '#10b981' } },
    { id: 'data-e5', source: 'nested-pattern', sourceHandle: 'no', target: 'call-vs-expression', label: 'Function', style: { stroke: '#ef4444' } },
    { id: 'data-e6', source: 'sequential-pattern', sourceHandle: 'yes', target: 'single-vs-multiple', label: 'Processing', style: { stroke: '#10b981' } },
    { id: 'data-e7', source: 'optimization-pattern', sourceHandle: 'yes', target: 'range-vs-extremes', label: 'Goal', style: { stroke: '#10b981' } },
    { id: 'data-e8', source: 'state-pattern', sourceHandle: 'yes', target: 'history-vs-operations', label: 'Management', style: { stroke: '#10b981' } },
    
    // Level 3 to Leaves
    { id: 'data-e9', source: 'bracket-vs-hierarchical', sourceHandle: 'yes', target: 'data-leaf1', label: 'Brackets', style: { stroke: '#10b981' } },
    { id: 'data-e10', source: 'bracket-vs-hierarchical', sourceHandle: 'no', target: 'data-leaf2', label: 'Hierarchical', style: { stroke: '#ef4444' } },
    { id: 'data-e11', source: 'call-vs-expression', sourceHandle: 'yes', target: 'data-leaf3', label: 'Calls', style: { stroke: '#10b981' } },
    { id: 'data-e12', source: 'call-vs-expression', sourceHandle: 'no', target: 'data-leaf4', label: 'Expressions', style: { stroke: '#ef4444' } },
    { id: 'data-e13', source: 'single-vs-multiple', sourceHandle: 'yes', target: 'data-leaf5', label: 'Single', style: { stroke: '#10b981' } },
    { id: 'data-e14', source: 'single-vs-multiple', sourceHandle: 'no', target: 'data-leaf6', label: 'Multiple', style: { stroke: '#ef4444' } },
    { id: 'data-e15', source: 'range-vs-extremes', sourceHandle: 'yes', target: 'data-leaf7', label: 'Range', style: { stroke: '#10b981' } },
    { id: 'data-e16', source: 'range-vs-extremes', sourceHandle: 'no', target: 'data-leaf8', label: 'Extremes', style: { stroke: '#ef4444' } },
    { id: 'data-e17', source: 'history-vs-operations', sourceHandle: 'yes', target: 'data-leaf9', label: 'History', style: { stroke: '#10b981' } },
    { id: 'data-e18', source: 'history-vs-operations', sourceHandle: 'no', target: 'data-leaf10', label: 'Operations', style: { stroke: '#ef4444' } },
    
    // Additional connections
    { id: 'data-e19', source: 'sequential-pattern', target: 'data-leaf11', label: 'Monotonic', style: { stroke: '#8b5cf6' } },
    { id: 'data-e20', source: 'nested-pattern', target: 'data-leaf12', label: 'LIFO', style: { stroke: '#8b5cf6' } },
    { id: 'data-e21', source: 'nested-pattern', target: 'data-leaf13', label: 'Delimiters', style: { stroke: '#8b5cf6' } },
    { id: 'data-e22', source: 'optimization-pattern', target: 'data-leaf14', label: 'Temporary', style: { stroke: '#8b5cf6' } },
    { id: 'data-e23', source: 'state-pattern', target: 'data-leaf15', label: 'State Machine', style: { stroke: '#8b5cf6' } },
    
    // Leaf nodes to Problem nodes
    { id: 'data-e24', source: 'data-leaf1', target: 'data-problems1', style: { stroke: '#f97316' } },
    { id: 'data-e25', source: 'data-leaf2', target: 'data-problems2', style: { stroke: '#f97316' } },
    { id: 'data-e26', source: 'data-leaf3', target: 'data-problems3', style: { stroke: '#f97316' } },
    { id: 'data-e27', source: 'data-leaf4', target: 'data-problems4', style: { stroke: '#f97316' } },
    { id: 'data-e28', source: 'data-leaf5', target: 'data-problems5', style: { stroke: '#f97316' } },
    { id: 'data-e29', source: 'data-leaf6', target: 'data-problems6', style: { stroke: '#f97316' } },
    { id: 'data-e30', source: 'data-leaf7', target: 'data-problems7', style: { stroke: '#f97316' } },
    { id: 'data-e31', source: 'data-leaf8', target: 'data-problems8', style: { stroke: '#f97316' } },
    { id: 'data-e32', source: 'data-leaf9', target: 'data-problems9', style: { stroke: '#f97316' } },
    { id: 'data-e33', source: 'data-leaf10', target: 'data-problems10', style: { stroke: '#f97316' } },
    { id: 'data-e34', source: 'data-leaf11', target: 'data-problems11', style: { stroke: '#f97316' } },
    { id: 'data-e35', source: 'data-leaf12', target: 'data-problems12', style: { stroke: '#f97316' } },
    { id: 'data-e36', source: 'data-leaf13', target: 'data-problems13', style: { stroke: '#f97316' } },
    { id: 'data-e37', source: 'data-leaf14', target: 'data-problems14', style: { stroke: '#f97316' } },
    { id: 'data-e38', source: 'data-leaf15', target: 'data-problems15', style: { stroke: '#f97316' } },
  ]
}

// Main Flow Component
function StackFlow() {
  const reactFlowInstance = useReactFlow()
  const [viewType, setViewType] = useState('problem-type') // 'problem-type', 'algorithm-approach', 'data-pattern'

  const currentData = useMemo(() => {
    switch(viewType) {
      case 'problem-type': return problemTypeData
      case 'algorithm-approach': return algorithmApproachData  
      case 'data-pattern': return dataPatternData
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
            <h1 className="text-2xl font-bold text-gray-800">Stack Decision Tree</h1>
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
                onClick={() => setViewType('data-pattern')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
                  viewType === 'data-pattern' 
                    ? 'bg-blue-500 text-white shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Data Pattern
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

export default function StackDecisionTree() {
  return (
    <div>
      <Navbar />
      <ReactFlowProvider>
        <StackFlow />
      </ReactFlowProvider>
    </div>
  )
}