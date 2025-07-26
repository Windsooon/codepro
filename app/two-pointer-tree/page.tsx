'use client'

import React, { useCallback, useState, useMemo } from 'react'
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

// Custom Leaf Node Component (No code templates)
const LeafNode = ({ data }) => {
  return (
    <div className="px-4 py-3 shadow-lg rounded-xl bg-green-100 border-2 border-green-300 min-w-[300px] max-w-[350px]">
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      <div className="text-center">
        <div className="text-sm font-bold text-green-800 mb-2">{data.technique}</div>
        <div className="text-xs text-green-700 mb-2">
          <div><strong>Data Structures:</strong> {data.dataStructures}</div>
          <div><strong>Complexity:</strong> {data.complexity}</div>
          <div><strong>Keywords:</strong> {data.keywords}</div>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  )
}

// New Problem Node Component
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

export default function TwoPointerTree() {
  const [isAdvanced, setIsAdvanced] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Comprehensive pattern data
  const patternData = {
    simple: {
      nodes: [
        // Root
        {
          id: 'root',
          type: 'root',
          position: { x: 600, y: 50 },
          data: { label: 'Two-Pointer & Sliding Window Problems' }
        },
        
        // Level 1: Problem Type
        {
          id: 'problem-type',
          type: 'decision',
          position: { x: 600, y: 180 },
          data: { 
            label: 'Do you need to find pairs/triplets?',
            tooltip: 'Are you looking for combinations of elements that sum to target?'
          }
        },
    
        // Level 2A: Pair/Triplet branch
        {
          id: 'pair-sorted',
          type: 'decision',
          position: { x: 300, y: 320 },
          data: { 
            label: 'Is the array sorted?',
            tooltip: 'Sorted arrays allow opposite direction pointers'
          }
        },
        
        // Level 2B: Other patterns branch
        {
          id: 'data-structure',
          type: 'decision',
          position: { x: 900, y: 320 },
          data: { 
            label: 'Working with arrays or linked lists?',
            tooltip: 'Different data structures require different pointer techniques'
          }
        },
    
        // Level 3A: Array patterns
        {
          id: 'array-operation',
          type: 'decision',
          position: { x: 750, y: 460 },
          data: { 
            label: 'Need to find subarray/substring?',
            tooltip: 'Contiguous sequences vs individual elements'
          }
        },
        
        // Level 3B: Linked List patterns
        {
          id: 'linked-list-operation',
          type: 'decision',
          position: { x: 1050, y: 460 },
          data: { 
            label: 'Need to detect cycles or find position?',
            tooltip: 'Cycle detection vs position finding in linked lists'
          }
        },
        
        // Level 4: Window type for subarrays
        {
          id: 'window-type',
          type: 'decision',
          position: { x: 650, y: 600 },
          data: { 
            label: 'Is the window size fixed?',
            tooltip: 'Fixed size vs variable size sliding windows'
          }
        },
    
        // Leaf Nodes (Techniques only, no code templates)
        {
          id: 'leaf1',
          type: 'leaf',
          position: { x: 50, y: 480 },
          data: {
            technique: 'Two Sum (Opposite Pointers)',
            dataStructures: 'Sorted Array',
            complexity: 'O(n) time, O(1) space',
            keywords: 'sum, target, pairs, sorted'
          }
        },
    
        {
          id: 'leaf2',
          type: 'leaf',
          position: { x: 400, y: 480 },
          data: {
            technique: 'Hash Map Two Sum',
            dataStructures: 'Array, Hash Map',
            complexity: 'O(n) time, O(n) space',
            keywords: 'sum, target, unsorted, hash'
          }
        },
    
        {
          id: 'leaf3',
          type: 'leaf',
          position: { x: 550, y: 740 },
          data: {
            technique: 'Fixed Window Sliding Window',
            dataStructures: 'Array, Deque',
            complexity: 'O(n) time, O(k) space',
            keywords: 'subarray, fixed size, window, k elements'
          }
        },
        
        {
          id: 'leaf4',
          type: 'leaf',
          position: { x: 750, y: 740 },
          data: {
            technique: 'Variable Window Sliding Window',
            dataStructures: 'Array, Hash Map',
            complexity: 'O(n) time, O(k) space',
            keywords: 'substring, variable size, condition-based'
          }
        },
    
        {
          id: 'leaf5',
          type: 'leaf',
          position: { x: 850, y: 600 },
          data: {
            technique: 'In-Place Array Modification',
            dataStructures: 'Array',
            complexity: 'O(n) time, O(1) space',
            keywords: 'remove, duplicates, in-place, modify'
          }
        },
        
        {
          id: 'leaf6',
          type: 'leaf',
          position: { x: 950, y: 600 },
          data: {
            technique: 'Fast-Slow Pointers (Floyd\'s)',
            dataStructures: 'Linked List, Array',
            complexity: 'O(n) time, O(1) space',
            keywords: 'cycle, detection, linked list, fast slow'
          }
        },
        
        {
          id: 'leaf7',
          type: 'leaf',
          position: { x: 1150, y: 600 },
          data: {
            technique: 'Linked List Position Finding',
            dataStructures: 'Linked List',
            complexity: 'O(n) time, O(1) space',
            keywords: 'nth node, remove, position, linked list'
          }
        },

        // Problem Nodes (Separate blocks for LeetCode problems)
        {
          id: 'problems1',
          type: 'problem',
          position: { x: 50, y: 620 },
          data: {
            problems: [
              { number: 167, title: 'Two Sum II - Input Array Is Sorted', url: 'https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/', difficulty: 'Medium' },
              { number: 15, title: '3Sum', url: 'https://leetcode.com/problems/3sum/', difficulty: 'Medium' },
              { number: 16, title: '3Sum Closest', url: 'https://leetcode.com/problems/3sum-closest/', difficulty: 'Medium' },
              { number: 18, title: '4Sum', url: 'https://leetcode.com/problems/4sum/', difficulty: 'Medium' },
            ]
          }
        },
    
        {
          id: 'problems2',
          type: 'problem',
          position: { x: 400, y: 620 },
          data: {
            problems: [
              { number: 1, title: 'Two Sum', url: 'https://leetcode.com/problems/two-sum/', difficulty: 'Easy' },
              { number: 454, title: '4Sum II', url: 'https://leetcode.com/problems/4sum-ii/', difficulty: 'Medium' },
            ]
          }
        },
    
        {
          id: 'problems3',
          type: 'problem',
          position: { x: 550, y: 880 },
          data: {
            problems: [
              { number: 239, title: 'Sliding Window Maximum', url: 'https://leetcode.com/problems/sliding-window-maximum/', difficulty: 'Hard' },
              { number: 438, title: 'Find All Anagrams in a String', url: 'https://leetcode.com/problems/find-all-anagrams-in-a-string/', difficulty: 'Medium' },
              { number: 567, title: 'Permutation in String', url: 'https://leetcode.com/problems/permutation-in-string/', difficulty: 'Medium' },
            ]
          }
        },
        
        {
          id: 'problems4',
          type: 'problem',
          position: { x: 750, y: 880 },
          data: {
            problems: [
              { number: 3, title: 'Longest Substring Without Repeating Characters', url: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/', difficulty: 'Medium' },
              { number: 76, title: 'Minimum Window Substring', url: 'https://leetcode.com/problems/minimum-window-substring/', difficulty: 'Hard' },
              { number: 209, title: 'Minimum Size Subarray Sum', url: 'https://leetcode.com/problems/minimum-size-subarray-sum/', difficulty: 'Medium' },
              { number: 424, title: 'Longest Repeating Character Replacement', url: 'https://leetcode.com/problems/longest-repeating-character-replacement/', difficulty: 'Medium' },
            ]
          }
        },
    
        {
          id: 'problems5',
          type: 'problem',
          position: { x: 850, y: 740 },
          data: {
            problems: [
              { number: 26, title: 'Remove Duplicates from Sorted Array', url: 'https://leetcode.com/problems/remove-duplicates-from-sorted-array/', difficulty: 'Easy' },
              { number: 27, title: 'Remove Element', url: 'https://leetcode.com/problems/remove-element/', difficulty: 'Easy' },
              { number: 283, title: 'Move Zeroes', url: 'https://leetcode.com/problems/move-zeroes/', difficulty: 'Easy' },
              { number: 75, title: 'Sort Colors', url: 'https://leetcode.com/problems/sort-colors/', difficulty: 'Medium' },
            ]
          }
        },
        
        {
          id: 'problems6',
          type: 'problem',
          position: { x: 950, y: 740 },
          data: {
            problems: [
              { number: 141, title: 'Linked List Cycle', url: 'https://leetcode.com/problems/linked-list-cycle/', difficulty: 'Easy' },
              { number: 142, title: 'Linked List Cycle II', url: 'https://leetcode.com/problems/linked-list-cycle-ii/', difficulty: 'Medium' },
              { number: 876, title: 'Middle of the Linked List', url: 'https://leetcode.com/problems/middle-of-the-linked-list/', difficulty: 'Easy' },
              { number: 287, title: 'Find the Duplicate Number', url: 'https://leetcode.com/problems/find-the-duplicate-number/', difficulty: 'Medium' },
            ]
          }
        },
        
        {
          id: 'problems7',
          type: 'problem',
          position: { x: 1150, y: 740 },
          data: {
            problems: [
              { number: 19, title: 'Remove Nth Node From End', url: 'https://leetcode.com/problems/remove-nth-node-from-end-of-list/', difficulty: 'Medium' },
              { number: 61, title: 'Rotate List', url: 'https://leetcode.com/problems/rotate-list/', difficulty: 'Medium' },
              { number: 234, title: 'Palindrome Linked List', url: 'https://leetcode.com/problems/palindrome-linked-list/', difficulty: 'Easy' },
            ]
          }
        }
      ],
      
      edges: [
        // Root to Level 1
        { id: 'e1', source: 'root', target: 'problem-type', animated: true },
        
        // Level 1 to Level 2
        { id: 'e2', source: 'problem-type', sourceHandle: 'yes', target: 'pair-sorted', label: 'Yes', style: { stroke: '#10b981' } },
        { id: 'e3', source: 'problem-type', sourceHandle: 'no', target: 'data-structure', label: 'No', style: { stroke: '#ef4444' } },
        
        // Level 2 to Level 3 and Leaves
        { id: 'e4', source: 'pair-sorted', sourceHandle: 'yes', target: 'leaf1', label: 'Yes', style: { stroke: '#10b981' } },
        { id: 'e5', source: 'pair-sorted', sourceHandle: 'no', target: 'leaf2', label: 'No', style: { stroke: '#ef4444' } },
        { id: 'e6', source: 'data-structure', sourceHandle: 'yes', target: 'array-operation', label: 'Arrays', style: { stroke: '#10b981' } },
        { id: 'e7', source: 'data-structure', sourceHandle: 'no', target: 'linked-list-operation', label: 'Linked Lists', style: { stroke: '#ef4444' } },
        
        // Level 3 to Level 4 and Leaves
        { id: 'e8', source: 'array-operation', sourceHandle: 'yes', target: 'window-type', label: 'Yes', style: { stroke: '#10b981' } },
        { id: 'e9', source: 'array-operation', sourceHandle: 'no', target: 'leaf5', label: 'No', style: { stroke: '#ef4444' } },
        { id: 'e10', source: 'linked-list-operation', sourceHandle: 'yes', target: 'leaf6', label: 'Yes', style: { stroke: '#10b981' } },
        { id: 'e11', source: 'linked-list-operation', sourceHandle: 'no', target: 'leaf7', label: 'No', style: { stroke: '#ef4444' } },
        
        // Level 4 to Leaves
        { id: 'e12', source: 'window-type', sourceHandle: 'yes', target: 'leaf3', label: 'Yes', style: { stroke: '#10b981' } },
        { id: 'e13', source: 'window-type', sourceHandle: 'no', target: 'leaf4', label: 'No', style: { stroke: '#ef4444' } },

        // Leaf nodes to Problem nodes
        { id: 'e14', source: 'leaf1', target: 'problems1', style: { stroke: '#f97316' } },
        { id: 'e15', source: 'leaf2', target: 'problems2', style: { stroke: '#f97316' } },
        { id: 'e16', source: 'leaf3', target: 'problems3', style: { stroke: '#f97316' } },
        { id: 'e17', source: 'leaf4', target: 'problems4', style: { stroke: '#f97316' } },
        { id: 'e18', source: 'leaf5', target: 'problems5', style: { stroke: '#f97316' } },
        { id: 'e19', source: 'leaf6', target: 'problems6', style: { stroke: '#f97316' } },
        { id: 'e20', source: 'leaf7', target: 'problems7', style: { stroke: '#f97316' } },
      ]
    },
    
    advanced: {
      nodes: [
        // Root
        {
          id: 'root',
          type: 'root',
          position: { x: 700, y: 50 },
          data: { label: 'Advanced Two-Pointer & Sliding Window' }
        },
        
        // Level 1: Enhanced categorization
        {
          id: 'problem-category',
          type: 'decision',
          position: { x: 700, y: 180 },
          data: { 
            label: 'What type of problem?',
            tooltip: 'Categorize by the main objective'
          }
        },
        
        // Advanced Leaf Nodes (No code templates)
        {
          id: 'advanced-leaf1',
          type: 'leaf',
          position: { x: 500, y: 400 },
          data: {
            technique: 'Multi-Sum with Sorting',
            dataStructures: 'Array, Hash Set',
            complexity: 'O(n^(k-1)) time, O(n) space',
            keywords: 'k-sum, combinations, duplicates, sorting'
          }
        },
        
        {
          id: 'advanced-leaf2',
          type: 'leaf',
          position: { x: 900, y: 400 },
          data: {
            technique: 'Advanced Sliding Window',
            dataStructures: 'Array, Hash Map, Deque',
            complexity: 'O(n) time, O(k) space',
            keywords: 'minimum window, optimization, shrinking'
          }
        },

        // Problem Nodes for Advanced View
        {
          id: 'advanced-problems1',
          type: 'problem',
          position: { x: 500, y: 540 },
          data: {
            problems: [
              { number: 15, title: '3Sum', url: 'https://leetcode.com/problems/3sum/', difficulty: 'Medium' },
              { number: 16, title: '3Sum Closest', url: 'https://leetcode.com/problems/3sum-closest/', difficulty: 'Medium' },
              { number: 18, title: '4Sum', url: 'https://leetcode.com/problems/4sum/', difficulty: 'Medium' },
              { number: 259, title: '3Sum Smaller', url: 'https://leetcode.com/problems/3sum-smaller/', difficulty: 'Medium' },
            ]
          }
        },
        
        {
          id: 'advanced-problems2',
          type: 'problem',
          position: { x: 900, y: 540 },
          data: {
            problems: [
              { number: 76, title: 'Minimum Window Substring', url: 'https://leetcode.com/problems/minimum-window-substring/', difficulty: 'Hard' },
              { number: 209, title: 'Minimum Size Subarray Sum', url: 'https://leetcode.com/problems/minimum-size-subarray-sum/', difficulty: 'Medium' },
              { number: 862, title: 'Shortest Subarray with Sum at Least K', url: 'https://leetcode.com/problems/shortest-subarray-with-sum-at-least-k/', difficulty: 'Hard' },
            ]
          }
        },
      ],
      
      edges: [
        // Root to Level 1
        { id: 'ae1', source: 'root', target: 'problem-category', animated: true },
        
        // Level 1 to Leaves
        { id: 'ae2', source: 'problem-category', sourceHandle: 'yes', target: 'advanced-leaf1', label: 'Sum Problems', style: { stroke: '#10b981' } },
        { id: 'ae3', source: 'problem-category', sourceHandle: 'no', target: 'advanced-leaf2', label: 'Window Problems', style: { stroke: '#ef4444' } },
        
        // Leaf nodes to Problem nodes
        { id: 'ae4', source: 'advanced-leaf1', target: 'advanced-problems1', style: { stroke: '#f97316' } },
        { id: 'ae5', source: 'advanced-leaf2', target: 'advanced-problems2', style: { stroke: '#f97316' } },
      ]
    }
  }

  const currentData = useMemo(() => {
    return isAdvanced ? patternData.advanced : patternData.simple
  }, [isAdvanced])

  const [nodes, setNodes, onNodesChange] = useNodesState(currentData.nodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(currentData.edges)

  // Update nodes and edges when switching between simple/advanced
  React.useEffect(() => {
    setNodes(currentData.nodes)
    setEdges(currentData.edges)
  }, [currentData, setNodes, setEdges])

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  // Filter nodes based on search term
  const filteredNodes = useMemo(() => {
    if (!searchTerm.trim()) return nodes
    
    return nodes.map(node => {
      if (node.type === 'leaf') {
        const matchesSearch = 
          node.data.technique.toLowerCase().includes(searchTerm.toLowerCase()) ||
          node.data.keywords.toLowerCase().includes(searchTerm.toLowerCase())
        
        return {
          ...node,
          style: matchesSearch 
            ? { ...node.style, border: '3px solid #f59e0b' }
            : { ...node.style, opacity: 0.3 }
        }
      }
      if (node.type === 'problem') {
        const matchesSearch = 
          node.data.problems.some(problem => 
            problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            problem.number.toString().includes(searchTerm)
          )
        
        return {
          ...node,
          style: matchesSearch 
            ? { ...node.style, border: '3px solid #f59e0b' }
            : { ...node.style, opacity: 0.3 }
        }
      }
      return node
    })
  }, [nodes, searchTerm])

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <div className="p-4 bg-gray-100 border-b">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-bold text-gray-800">Two-Pointer & Sliding Window Decision Tree</h1>
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search problems, keywords, techniques..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-1 border rounded-md text-sm w-64"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              )}
            </div>
            <button
              onClick={() => setIsAdvanced(!isAdvanced)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isAdvanced 
                  ? 'bg-purple-600 text-white hover:bg-purple-700' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isAdvanced ? 'Switch to Simple View' : 'Switch to Advanced View'}
            </button>
          </div>
        </div>
        
        <p className="text-gray-600 text-sm mb-2">
          <strong>Current View:</strong> {isAdvanced ? 'Advanced' : 'Simple'} | 
          <strong> Patterns:</strong> {isAdvanced ? '15+ detailed patterns' : '8 core patterns'}
        </p>
        

      </div>
      
      <div style={{ width: '100%', height: 'calc(100vh - 180px)' }}>
        <ReactFlow
          nodes={filteredNodes}
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
        </ReactFlow>
      </div>
    </div>
  )
}
