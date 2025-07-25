'use client'

import React, { useCallback, useMemo } from 'react'
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

// Custom Leaf Node Component (DP Techniques)
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

export default function DynamicProgrammingTree() {
  const patternData = {
    nodes: [
      // Root
      {
        id: 'root',
        type: 'root',
        position: { x: 800, y: 50 },
        data: { label: 'Dynamic Programming Problems' }
      },
      
      // Level 1: Main categorization
      {
        id: 'problem-type',
        type: 'decision',
        position: { x: 800, y: 180 },
        data: { 
          label: 'Is your problem working with sequences or arrays?',
          tooltip: 'Single array/list problems vs other data structures'
        }
      },

      // Level 2A: Sequence/Array branch
      {
        id: 'sequence-type',
        type: 'decision',
        position: { x: 400, y: 320 },
        data: { 
          label: 'Is it a simple sequence optimization?',
          tooltip: 'Single array/list with adjacent elements or simple choices'
        }
      },

      // Level 2B: Grid/Matrix branch  
      {
        id: 'grid-type',
        type: 'decision',
        position: { x: 800, y: 320 },
        data: { 
          label: 'Are you working with a 2D grid/matrix?',
          tooltip: 'Problems involving paths, grids, or 2D optimization'
        }
      },

      // Level 2C: String/Choice branch
      {
        id: 'string-choice',
        type: 'decision',
        position: { x: 1200, y: 320 },
        data: { 
          label: 'Does your problem involve string manipulation?',
          tooltip: 'String problems vs item selection/choice problems'
        }
      },

      // Level 3A: String problems
      {
        id: 'string-operation',
        type: 'decision',
        position: { x: 1000, y: 460 },
        data: { 
          label: 'Are you comparing two strings?',
          tooltip: 'Two string comparison vs single string manipulation'
        }
      },

      // Level 3B: Choice problems
      {
        id: 'choice-type',
        type: 'decision',
        position: { x: 1400, y: 460 },
        data: { 
          label: 'Can you use items multiple times?',
          tooltip: 'Determines if you need bounded or unbounded knapsack'
        }
      },

      // Level 3C: Advanced structures
      {
        id: 'advanced-type',
        type: 'decision',
        position: { x: 600, y: 460 },
        data: { 
          label: 'Does your problem involve tree structures?',
          tooltip: 'Tree-based problems vs state machine/complex state problems'
        }
      },

      // Leaf Nodes (DP Techniques)
      {
        id: 'leaf1',
        type: 'leaf',
        position: { x: 200, y: 460 },
        data: {
          technique: '1D DP (Linear)',
          approach: 'Single array, adjacent decisions',
          complexity: 'O(n) time, O(n) or O(1) space',
          useCases: 'Fibonacci, climbing stairs, house robber'
        }
      },

      {
        id: 'leaf2',
        type: 'leaf',
        position: { x: 600, y: 600 },
        data: {
          technique: '2D Grid DP',
          approach: 'Matrix traversal with optimal paths',
          complexity: 'O(m*n) time, O(m*n) space',
          useCases: 'Unique paths, minimum path sum, robot movement'
        }
      },

      {
        id: 'leaf3',
        type: 'leaf',
        position: { x: 1000, y: 600 },
        data: {
          technique: 'Edit Distance DP',
          approach: 'String transformation operations',
          complexity: 'O(m*n) time, O(m*n) space',
          useCases: 'Edit distance, LCS, string alignment'
        }
      },

      {
        id: 'leaf4',
        type: 'leaf',
        position: { x: 800, y: 600 },
        data: {
          technique: 'Palindrome DP',
          approach: 'Substring expansion and optimization',
          complexity: 'O(n²) time, O(n²) space',
          useCases: 'Longest palindromic substring, palindrome partitioning'
        }
      },

      {
        id: 'leaf5',
        type: 'leaf',
        position: { x: 1200, y: 600 },
        data: {
          technique: '0/1 Knapsack',
          approach: 'Include/exclude decisions for each item',
          complexity: 'O(n*W) time, O(n*W) space',
          useCases: 'Subset sum, partition equal subset, target sum'
        }
      },

      {
        id: 'leaf6',
        type: 'leaf',
        position: { x: 1400, y: 600 },
        data: {
          technique: 'Unbounded Knapsack',
          approach: 'Unlimited use of each item type',
          complexity: 'O(n*W) time, O(W) space',
          useCases: 'Coin change, combination sum, word break'
        }
      },

      {
        id: 'leaf7',
        type: 'leaf',
        position: { x: 400, y: 600 },
        data: {
          technique: 'Tree DP',
          approach: 'Bottom-up computation on tree nodes',
          complexity: 'O(n) time, O(h) space',
          useCases: 'Tree diameter, house robber III, binary tree max path'
        }
      },

      {
        id: 'leaf8',
        type: 'leaf',
        position: { x: 200, y: 600 },
        data: {
          technique: 'State Machine DP',
          approach: 'Track different states and transitions',
          complexity: 'O(n*k) time, O(k) space',
          useCases: 'Stock trading, state-based optimization'
        }
      },

      {
        id: 'leaf9',
        type: 'leaf',
        position: { x: 0, y: 460 },
        data: {
          technique: 'Interval DP',
          approach: 'Optimize over ranges/intervals',
          complexity: 'O(n³) time, O(n²) space',
          useCases: 'Matrix chain multiplication, burst balloons'
        }
      },

      {
        id: 'leaf10',
        type: 'leaf',
        position: { x: 1600, y: 460 },
        data: {
          technique: 'Bitmask DP',
          approach: 'Use bitmasks to represent subsets',
          complexity: 'O(n*2ⁿ) time, O(2ⁿ) space',
          useCases: 'Traveling salesman, subset enumeration'
        }
      },

      {
        id: 'leaf11',
        type: 'leaf',
        position: { x: 1800, y: 460 },
        data: {
          technique: 'Digit DP',
          approach: 'Build numbers digit by digit with constraints',
          complexity: 'O(log n * states) time, O(log n * states) space',
          useCases: 'Count numbers with properties, digit constraints'
        }
      },

      // Problem Nodes
      {
        id: 'problems1',
        type: 'problem',
        position: { x: 200, y: 740 },
        data: {
          problems: [
            { number: 70, title: 'Climbing Stairs', url: 'https://leetcode.com/problems/climbing-stairs/', difficulty: 'Easy' },
            { number: 198, title: 'House Robber', url: 'https://leetcode.com/problems/house-robber/', difficulty: 'Medium' },
            { number: 746, title: 'Min Cost Climbing Stairs', url: 'https://leetcode.com/problems/min-cost-climbing-stairs/', difficulty: 'Easy' },
            { number: 213, title: 'House Robber II', url: 'https://leetcode.com/problems/house-robber-ii/', difficulty: 'Medium' },
          ]
        }
      },

      {
        id: 'problems2',
        type: 'problem',
        position: { x: 600, y: 740 },
        data: {
          problems: [
            { number: 62, title: 'Unique Paths', url: 'https://leetcode.com/problems/unique-paths/', difficulty: 'Medium' },
            { number: 63, title: 'Unique Paths II', url: 'https://leetcode.com/problems/unique-paths-ii/', difficulty: 'Medium' },
            { number: 64, title: 'Minimum Path Sum', url: 'https://leetcode.com/problems/minimum-path-sum/', difficulty: 'Medium' },
            { number: 120, title: 'Triangle', url: 'https://leetcode.com/problems/triangle/', difficulty: 'Medium' },
          ]
        }
      },

      {
        id: 'problems3',
        type: 'problem',
        position: { x: 1000, y: 740 },
        data: {
          problems: [
            { number: 72, title: 'Edit Distance', url: 'https://leetcode.com/problems/edit-distance/', difficulty: 'Medium' },
            { number: 1143, title: 'Longest Common Subsequence', url: 'https://leetcode.com/problems/longest-common-subsequence/', difficulty: 'Medium' },
            { number: 583, title: 'Delete Operation for Two Strings', url: 'https://leetcode.com/problems/delete-operation-for-two-strings/', difficulty: 'Medium' },
            { number: 712, title: 'Minimum ASCII Delete Sum', url: 'https://leetcode.com/problems/minimum-ascii-delete-sum-for-two-strings/', difficulty: 'Medium' },
          ]
        }
      },

      {
        id: 'problems4',
        type: 'problem',
        position: { x: 800, y: 740 },
        data: {
          problems: [
            { number: 5, title: 'Longest Palindromic Substring', url: 'https://leetcode.com/problems/longest-palindromic-substring/', difficulty: 'Medium' },
            { number: 647, title: 'Palindromic Substrings', url: 'https://leetcode.com/problems/palindromic-substrings/', difficulty: 'Medium' },
            { number: 132, title: 'Palindrome Partitioning II', url: 'https://leetcode.com/problems/palindrome-partitioning-ii/', difficulty: 'Hard' },
            { number: 516, title: 'Longest Palindromic Subsequence', url: 'https://leetcode.com/problems/longest-palindromic-subsequence/', difficulty: 'Medium' },
          ]
        }
      },

      {
        id: 'problems5',
        type: 'problem',
        position: { x: 1200, y: 740 },
        data: {
          problems: [
            { number: 416, title: 'Partition Equal Subset Sum', url: 'https://leetcode.com/problems/partition-equal-subset-sum/', difficulty: 'Medium' },
            { number: 494, title: 'Target Sum', url: 'https://leetcode.com/problems/target-sum/', difficulty: 'Medium' },
            { number: 474, title: 'Ones and Zeroes', url: 'https://leetcode.com/problems/ones-and-zeroes/', difficulty: 'Medium' },
            { number: 1049, title: 'Last Stone Weight II', url: 'https://leetcode.com/problems/last-stone-weight-ii/', difficulty: 'Medium' },
          ]
        }
      },

      {
        id: 'problems6',
        type: 'problem',
        position: { x: 1400, y: 740 },
        data: {
          problems: [
            { number: 322, title: 'Coin Change', url: 'https://leetcode.com/problems/coin-change/', difficulty: 'Medium' },
            { number: 518, title: 'Coin Change II', url: 'https://leetcode.com/problems/coin-change-ii/', difficulty: 'Medium' },
            { number: 139, title: 'Word Break', url: 'https://leetcode.com/problems/word-break/', difficulty: 'Medium' },
            { number: 377, title: 'Combination Sum IV', url: 'https://leetcode.com/problems/combination-sum-iv/', difficulty: 'Medium' },
          ]
        }
      },

      {
        id: 'problems7',
        type: 'problem',
        position: { x: 400, y: 740 },
        data: {
          problems: [
            { number: 337, title: 'House Robber III', url: 'https://leetcode.com/problems/house-robber-iii/', difficulty: 'Medium' },
            { number: 543, title: 'Diameter of Binary Tree', url: 'https://leetcode.com/problems/diameter-of-binary-tree/', difficulty: 'Easy' },
            { number: 124, title: 'Binary Tree Maximum Path Sum', url: 'https://leetcode.com/problems/binary-tree-maximum-path-sum/', difficulty: 'Hard' },
            { number: 968, title: 'Binary Tree Cameras', url: 'https://leetcode.com/problems/binary-tree-cameras/', difficulty: 'Hard' },
          ]
        }
      },

      {
        id: 'problems8',
        type: 'problem',
        position: { x: 200, y: 880 },
        data: {
          problems: [
            { number: 121, title: 'Best Time to Buy and Sell Stock', url: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/', difficulty: 'Easy' },
            { number: 122, title: 'Best Time to Buy and Sell Stock II', url: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock-ii/', difficulty: 'Medium' },
            { number: 123, title: 'Best Time to Buy and Sell Stock III', url: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iii/', difficulty: 'Hard' },
            { number: 309, title: 'Best Time to Buy and Sell Stock with Cooldown', url: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock-with-cooldown/', difficulty: 'Medium' },
          ]
        }
      },

      {
        id: 'problems9',
        type: 'problem',
        position: { x: 0, y: 600 },
        data: {
          problems: [
            { number: 516, title: 'Longest Palindromic Subsequence', url: 'https://leetcode.com/problems/longest-palindromic-subsequence/', difficulty: 'Medium' },
            { number: 312, title: 'Burst Balloons', url: 'https://leetcode.com/problems/burst-balloons/', difficulty: 'Hard' },
            { number: 1000, title: 'Minimum Cost to Merge Stones', url: 'https://leetcode.com/problems/minimum-cost-to-merge-stones/', difficulty: 'Hard' },
          ]
        }
      },

      {
        id: 'problems10',
        type: 'problem',
        position: { x: 1600, y: 600 },
        data: {
          problems: [
            { number: 691, title: 'Stickers to Spell Word', url: 'https://leetcode.com/problems/stickers-to-spell-word/', difficulty: 'Hard' },
            { number: 464, title: 'Can I Win', url: 'https://leetcode.com/problems/can-i-win/', difficulty: 'Medium' },
            { number: 847, title: 'Shortest Path Visiting All Nodes', url: 'https://leetcode.com/problems/shortest-path-visiting-all-nodes/', difficulty: 'Hard' },
          ]
        }
      },

      {
        id: 'problems11',
        type: 'problem',
        position: { x: 1800, y: 600 },
        data: {
          problems: [
            { number: 233, title: 'Number of Digit One', url: 'https://leetcode.com/problems/number-of-digit-one/', difficulty: 'Hard' },
            { number: 902, title: 'Numbers At Most N Given Digit Set', url: 'https://leetcode.com/problems/numbers-at-most-n-given-digit-set/', difficulty: 'Hard' },
            { number: 1012, title: 'Numbers With Repeated Digits', url: 'https://leetcode.com/problems/numbers-with-repeated-digits/', difficulty: 'Hard' },
          ]
        }
      },
    ],
    
    edges: [
      // Root to Level 1
      { id: 'e1', source: 'root', target: 'problem-type', animated: true },
      
      // Level 1 to Level 2
      { id: 'e2', source: 'problem-type', sourceHandle: 'yes', target: 'sequence-type', label: 'Yes', style: { stroke: '#10b981' } },
      { id: 'e3', source: 'problem-type', sourceHandle: 'no', target: 'grid-type', label: 'No', style: { stroke: '#ef4444' } },
      
      // Additional branches from problem-type
      { id: 'e3b', source: 'grid-type', sourceHandle: 'no', target: 'string-choice', label: 'No', style: { stroke: '#ef4444' } },
      
      // Level 2 to Level 3 and Leaves
      { id: 'e4', source: 'sequence-type', sourceHandle: 'yes', target: 'leaf1', label: 'Yes', style: { stroke: '#10b981' } },
      { id: 'e5', source: 'sequence-type', sourceHandle: 'no', target: 'advanced-type', label: 'No', style: { stroke: '#ef4444' } },
      { id: 'e6', source: 'grid-type', sourceHandle: 'yes', target: 'leaf2', label: 'Yes', style: { stroke: '#10b981' } },
      { id: 'e7', source: 'string-choice', sourceHandle: 'yes', target: 'string-operation', label: 'Yes', style: { stroke: '#10b981' } },
      { id: 'e8', source: 'string-choice', sourceHandle: 'no', target: 'choice-type', label: 'No', style: { stroke: '#ef4444' } },
      
      // Level 3 to Leaves
      { id: 'e9', source: 'string-operation', sourceHandle: 'yes', target: 'leaf3', label: 'Yes', style: { stroke: '#10b981' } },
      { id: 'e10', source: 'string-operation', sourceHandle: 'no', target: 'leaf4', label: 'No', style: { stroke: '#ef4444' } },
      { id: 'e11', source: 'choice-type', sourceHandle: 'yes', target: 'leaf6', label: 'Yes', style: { stroke: '#10b981' } },
      { id: 'e12', source: 'choice-type', sourceHandle: 'no', target: 'leaf5', label: 'No', style: { stroke: '#ef4444' } },
      { id: 'e13', source: 'advanced-type', sourceHandle: 'yes', target: 'leaf7', label: 'Yes', style: { stroke: '#10b981' } },
      { id: 'e14', source: 'advanced-type', sourceHandle: 'no', target: 'leaf8', label: 'No', style: { stroke: '#ef4444' } },
      
      // Additional advanced techniques (connected directly from root for now)
      { id: 'e15', source: 'sequence-type', target: 'leaf9', label: 'Intervals', style: { stroke: '#8b5cf6' } },
      { id: 'e16', source: 'choice-type', target: 'leaf10', label: 'Subsets', style: { stroke: '#8b5cf6' } },
      { id: 'e17', source: 'choice-type', target: 'leaf11', label: 'Digits', style: { stroke: '#8b5cf6' } },
      
      // Leaf nodes to Problem nodes
      { id: 'e18', source: 'leaf1', target: 'problems1', style: { stroke: '#f97316' } },
      { id: 'e19', source: 'leaf2', target: 'problems2', style: { stroke: '#f97316' } },
      { id: 'e20', source: 'leaf3', target: 'problems3', style: { stroke: '#f97316' } },
      { id: 'e21', source: 'leaf4', target: 'problems4', style: { stroke: '#f97316' } },
      { id: 'e22', source: 'leaf5', target: 'problems5', style: { stroke: '#f97316' } },
      { id: 'e23', source: 'leaf6', target: 'problems6', style: { stroke: '#f97316' } },
      { id: 'e24', source: 'leaf7', target: 'problems7', style: { stroke: '#f97316' } },
      { id: 'e25', source: 'leaf8', target: 'problems8', style: { stroke: '#f97316' } },
      { id: 'e26', source: 'leaf9', target: 'problems9', style: { stroke: '#f97316' } },
      { id: 'e27', source: 'leaf10', target: 'problems10', style: { stroke: '#f97316' } },
      { id: 'e28', source: 'leaf11', target: 'problems11', style: { stroke: '#f97316' } },
    ]
  }

  const [nodes, setNodes, onNodesChange] = useNodesState(patternData.nodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(patternData.edges)

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <div className="p-4 bg-gray-100 border-b">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-bold text-gray-800">Dynamic Programming Decision Tree</h1>
        </div>
        
        <div className="text-sm text-gray-500">
          <strong>How to use:</strong> Follow the decision path based on your problem characteristics. 
          Each green node shows a DP technique with approach and complexity, while orange nodes contain related LeetCode problems.
          <br />
          <strong>Coverage:</strong> 11 major DP patterns including 1D DP, Grid DP, Knapsack, String DP, Tree DP, State Machine, Interval DP, Bitmask DP, and Digit DP.
          <br />
          <strong>Controls:</strong> Zoom with mouse wheel, pan by dragging.
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
        </ReactFlow>
      </div>
    </div>
  )
}