'use client'

import React, { useCallback } from 'react'
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

// Custom Leaf Node Component (smaller, without embedded problems)
const LeafNode = ({ data }) => {
  return (
    <div className="px-3 py-2 shadow-lg rounded-xl bg-green-100 border-2 border-green-300 min-w-[220px] max-w-[250px]">
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      <div className="text-center">
        <div className="text-sm font-bold text-green-800 mb-1">{data.technique}</div>
        <div className="text-xs text-green-700">
          <div><strong>Data Structures:</strong> {data.dataStructures}</div>
          <div><strong>Complexity:</strong> {data.complexity}</div>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  )
}

// New LeetCode Problems Node Component
const LeetCodeProblemsNode = ({ data }) => {
  return (
    <div className="px-3 py-2 shadow-lg rounded-lg bg-orange-50 border-2 border-orange-300 min-w-[280px] max-w-[320px]">
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      <div className="text-center">
        <div className="text-sm font-semibold text-orange-800 mb-2 flex items-center justify-center">
          <span className="mr-1">📋</span>
          LeetCode Problems
        </div>
        <div className="text-xs text-orange-700">
          <div className="max-h-32 overflow-y-auto">
            {data.problems.map((problem, index) => (
              <div key={index} className="mb-1">
                <a 
                  href={problem.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  {problem.number}. {problem.title}
                </a>
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
  leetcode: LeetCodeProblemsNode,
  root: RootNode,
}

export default function TwoPointerTree() {
  // Define the decision tree structure with many more popular problems
  const initialNodes = [
    // Root
    {
      id: 'root',
      type: 'root',
      position: { x: 600, y: 50 },
      data: { label: 'Two-Pointer Problem' }
    },
    
    // Level 1: Is input sorted?
    {
      id: 'sorted',
      type: 'decision',
      position: { x: 600, y: 180 },
      data: { 
        label: 'Is the input sorted?',
        tooltip: 'Check if the array/string is already sorted'
      }
    },
    
    // Level 2: Target/Sum branches
    {
      id: 'sorted-target',
      type: 'decision', 
      position: { x: 300, y: 320 },
      data: { 
        label: 'Looking for specific target/sum?',
        tooltip: 'Are we searching for a specific value or sum?'
      }
    },
    
    {
      id: 'unsorted-target',
      type: 'decision',
      position: { x: 900, y: 320 },
      data: { 
        label: 'Looking for specific target/sum?',
        tooltip: 'Are we searching for a specific value or sum?'
      }
    },
    
    // Level 3: More specific decisions
    {
      id: 'sorted-target-movement',
      type: 'decision',
      position: { x: 150, y: 460 },
      data: { 
        label: 'Opposite direction pointers?',
        tooltip: 'Do pointers move towards each other or same direction?'
      }
    },
    
    {
      id: 'sorted-notarget-inplace',
      type: 'decision',
      position: { x: 450, y: 460 },
      data: { 
        label: 'In-place modification?',
        tooltip: 'Are we modifying the array in place?'
      }
    },
    
    {
      id: 'unsorted-target-datatype',
      type: 'decision',
      position: { x: 750, y: 460 },
      data: { 
        label: 'Working with subarrays?',
        tooltip: 'Are we dealing with subarrays/substrings vs individual elements?'
      }
    },
    
    {
      id: 'unsorted-notarget-datatype',
      type: 'decision',
      position: { x: 1050, y: 460 },
      data: { 
        label: 'Working with subarrays?',
        tooltip: 'Are we dealing with subarrays/substrings vs individual elements?'
      }
    },
    
    // Leaf Nodes (smaller, without embedded problems)
    {
      id: 'leaf1',
      type: 'leaf',
      position: { x: 50, y: 600 },
      data: {
        technique: 'Two Sum Pattern (Opposite Pointers)',
        dataStructures: 'Array, Hash Map (optional)',
        complexity: 'O(n) time, O(1) space'
      }
    },
    
    {
      id: 'leaf2',
      type: 'leaf',
      position: { x: 250, y: 600 },
      data: {
        technique: 'Fast-Slow Pointers',
        dataStructures: 'Array, Linked List',
        complexity: 'O(n) time, O(1) space'
      }
    },
    
    {
      id: 'leaf3',
      type: 'leaf',
      position: { x: 350, y: 600 },
      data: {
        technique: 'In-Place Array Modification',
        dataStructures: 'Array',
        complexity: 'O(n) time, O(1) space'
      }
    },
    
    {
      id: 'leaf4',
      type: 'leaf',
      position: { x: 550, y: 600 },
      data: {
        technique: 'Sliding Window (Fixed Size)',
        dataStructures: 'Array, Hash Map',
        complexity: 'O(n) time, O(k) space'
      }
    },
    
    {
      id: 'leaf5',
      type: 'leaf',
      position: { x: 650, y: 600 },
      data: {
        technique: 'Expand Around Centers',
        dataStructures: 'String',
        complexity: 'O(n²) time, O(1) space'
      }
    },
    
    {
      id: 'leaf6',
      type: 'leaf',
      position: { x: 850, y: 600 },
      data: {
        technique: 'Sliding Window (Variable Size)',
        dataStructures: 'Array, Hash Map',
        complexity: 'O(n) time, O(k) space'
      }
    },
    
    {
      id: 'leaf7',
      type: 'leaf',
      position: { x: 950, y: 600 },
      data: {
        technique: 'Opposite Direction (Greedy)',
        dataStructures: 'Array',
        complexity: 'O(n) time, O(1) space'
      }
    },
    
    {
      id: 'leaf8',
      type: 'leaf',
      position: { x: 1150, y: 600 },
      data: {
        technique: 'Advanced Two-Pointer Patterns',
        dataStructures: 'Array, Stack, Deque',
        complexity: 'O(n) time, O(n) space'
      }
    },
    
    // LeetCode Problem Nodes (positioned below leaf nodes)
    {
      id: 'leetcode1',
      type: 'leetcode',
      position: { x: 50, y: 750 },
      data: {
        problems: [
          { number: 1, title: 'Two Sum', url: 'https://leetcode.com/problems/two-sum/' },
          { number: 15, title: '3Sum', url: 'https://leetcode.com/problems/3sum/' },
          { number: 16, title: '3Sum Closest', url: 'https://leetcode.com/problems/3sum-closest/' },
          { number: 18, title: '4Sum', url: 'https://leetcode.com/problems/4sum/' },
          { number: 167, title: 'Two Sum II - Input Array Is Sorted', url: 'https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/' },
          { number: 259, title: '3Sum Smaller', url: 'https://leetcode.com/problems/3sum-smaller/' }
        ]
      }
    },
    
    {
      id: 'leetcode2',
      type: 'leetcode',
      position: { x: 250, y: 750 },
      data: {
        problems: [
          { number: 19, title: 'Remove Nth Node From End', url: 'https://leetcode.com/problems/remove-nth-node-from-end-of-list/' },
          { number: 141, title: 'Linked List Cycle', url: 'https://leetcode.com/problems/linked-list-cycle/' },
          { number: 142, title: 'Linked List Cycle II', url: 'https://leetcode.com/problems/linked-list-cycle-ii/' },
          { number: 876, title: 'Middle of the Linked List', url: 'https://leetcode.com/problems/middle-of-the-linked-list/' },
          { number: 234, title: 'Palindrome Linked List', url: 'https://leetcode.com/problems/palindrome-linked-list/' },
          { number: 287, title: 'Find the Duplicate Number', url: 'https://leetcode.com/problems/find-the-duplicate-number/' }
        ]
      }
    },
    
    {
      id: 'leetcode3',
      type: 'leetcode',
      position: { x: 350, y: 750 },
      data: {
        problems: [
          { number: 26, title: 'Remove Duplicates from Sorted Array', url: 'https://leetcode.com/problems/remove-duplicates-from-sorted-array/' },
          { number: 27, title: 'Remove Element', url: 'https://leetcode.com/problems/remove-element/' },
          { number: 80, title: 'Remove Duplicates from Sorted Array II', url: 'https://leetcode.com/problems/remove-duplicates-from-sorted-array-ii/' },
          { number: 283, title: 'Move Zeroes', url: 'https://leetcode.com/problems/move-zeroes/' },
          { number: 75, title: 'Sort Colors', url: 'https://leetcode.com/problems/sort-colors/' },
          { number: 88, title: 'Merge Sorted Array', url: 'https://leetcode.com/problems/merge-sorted-array/' }
        ]
      }
    },
    
    {
      id: 'leetcode4',
      type: 'leetcode',
      position: { x: 550, y: 750 },
      data: {
        problems: [
          { number: 239, title: 'Sliding Window Maximum', url: 'https://leetcode.com/problems/sliding-window-maximum/' },
          { number: 438, title: 'Find All Anagrams in a String', url: 'https://leetcode.com/problems/find-all-anagrams-in-a-string/' },
          { number: 567, title: 'Permutation in String', url: 'https://leetcode.com/problems/permutation-in-string/' },
          { number: 209, title: 'Minimum Size Subarray Sum', url: 'https://leetcode.com/problems/minimum-size-subarray-sum/' },
          { number: 713, title: 'Subarray Product Less Than K', url: 'https://leetcode.com/problems/subarray-product-less-than-k/' }
        ]
      }
    },
    
    {
      id: 'leetcode5',
      type: 'leetcode',
      position: { x: 650, y: 750 },
      data: {
        problems: [
          { number: 5, title: 'Longest Palindromic Substring', url: 'https://leetcode.com/problems/longest-palindromic-substring/' },
          { number: 647, title: 'Palindromic Substrings', url: 'https://leetcode.com/problems/palindromic-substrings/' },
          { number: 125, title: 'Valid Palindrome', url: 'https://leetcode.com/problems/valid-palindrome/' },
          { number: 680, title: 'Valid Palindrome II', url: 'https://leetcode.com/problems/valid-palindrome-ii/' },
          { number: 9, title: 'Palindrome Number', url: 'https://leetcode.com/problems/palindrome-number/' }
        ]
      }
    },
    
    {
      id: 'leetcode6',
      type: 'leetcode',
      position: { x: 850, y: 750 },
      data: {
        problems: [
          { number: 3, title: 'Longest Substring Without Repeating', url: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/' },
          { number: 76, title: 'Minimum Window Substring', url: 'https://leetcode.com/problems/minimum-window-substring/' },
          { number: 159, title: 'Longest Substring with At Most Two Distinct Characters', url: 'https://leetcode.com/problems/longest-substring-with-at-most-two-distinct-characters/' },
          { number: 340, title: 'Longest Substring with At Most K Distinct Characters', url: 'https://leetcode.com/problems/longest-substring-with-at-most-k-distinct-characters/' },
          { number: 424, title: 'Longest Repeating Character Replacement', url: 'https://leetcode.com/problems/longest-repeating-character-replacement/' }
        ]
      }
    },
    
    {
      id: 'leetcode7',
      type: 'leetcode',
      position: { x: 950, y: 750 },
      data: {
        problems: [
          { number: 11, title: 'Container With Most Water', url: 'https://leetcode.com/problems/container-with-most-water/' },
          { number: 42, title: 'Trapping Rain Water', url: 'https://leetcode.com/problems/trapping-rain-water/' },
          { number: 344, title: 'Reverse String', url: 'https://leetcode.com/problems/reverse-string/' },
          { number: 345, title: 'Reverse Vowels of a String', url: 'https://leetcode.com/problems/reverse-vowels-of-a-string/' },
          { number: 977, title: 'Squares of a Sorted Array', url: 'https://leetcode.com/problems/squares-of-a-sorted-array/' },
          { number: 228, title: 'Summary Ranges', url: 'https://leetcode.com/problems/summary-ranges/' }
        ]
      }
    },
    
    {
      id: 'leetcode8',
      type: 'leetcode',
      position: { x: 1150, y: 750 },
      data: {
        problems: [
          { number: 31, title: 'Next Permutation', url: 'https://leetcode.com/problems/next-permutation/' },
          { number: 986, title: 'Interval List Intersections', url: 'https://leetcode.com/problems/interval-list-intersections/' },
          { number: 845, title: 'Longest Mountain in Array', url: 'https://leetcode.com/problems/longest-mountain-in-array/' },
          { number: 581, title: 'Shortest Unsorted Continuous Subarray', url: 'https://leetcode.com/problems/shortest-unsorted-continuous-subarray/' },
          { number: 1750, title: 'Minimum Length of String After Deleting Similar Ends', url: 'https://leetcode.com/problems/minimum-length-of-string-after-deleting-similar-ends/' },
          { number: 2537, title: 'Count the Number of Good Subarrays', url: 'https://leetcode.com/problems/count-the-number-of-good-subarrays/' }
        ]
      }
    }
  ]

  const initialEdges = [
    // Root to Level 1
    { id: 'e1', source: 'root', target: 'sorted', animated: true },
    
    // Level 1 to Level 2
    { id: 'e2', source: 'sorted', sourceHandle: 'yes', target: 'sorted-target', label: 'Yes', style: { stroke: '#10b981' } },
    { id: 'e3', source: 'sorted', sourceHandle: 'no', target: 'unsorted-target', label: 'No', style: { stroke: '#ef4444' } },
    
    // Level 2 to Level 3
    { id: 'e4', source: 'sorted-target', sourceHandle: 'yes', target: 'sorted-target-movement', label: 'Yes', style: { stroke: '#10b981' } },
    { id: 'e5', source: 'sorted-target', sourceHandle: 'no', target: 'sorted-notarget-inplace', label: 'No', style: { stroke: '#ef4444' } },
    { id: 'e6', source: 'unsorted-target', sourceHandle: 'yes', target: 'unsorted-target-datatype', label: 'Yes', style: { stroke: '#10b981' } },
    { id: 'e7', source: 'unsorted-target', sourceHandle: 'no', target: 'unsorted-notarget-datatype', label: 'No', style: { stroke: '#ef4444' } },
    
    // Level 3 to Leaves
    { id: 'e8', source: 'sorted-target-movement', sourceHandle: 'yes', target: 'leaf1', label: 'Yes', style: { stroke: '#10b981' } },
    { id: 'e9', source: 'sorted-target-movement', sourceHandle: 'no', target: 'leaf2', label: 'No', style: { stroke: '#ef4444' } },
    { id: 'e10', source: 'sorted-notarget-inplace', sourceHandle: 'yes', target: 'leaf3', label: 'Yes', style: { stroke: '#10b981' } },
    { id: 'e11', source: 'sorted-notarget-inplace', sourceHandle: 'no', target: 'leaf4', label: 'No', style: { stroke: '#ef4444' } },
    { id: 'e12', source: 'unsorted-target-datatype', sourceHandle: 'yes', target: 'leaf5', label: 'Yes', style: { stroke: '#10b981' } },
    { id: 'e13', source: 'unsorted-target-datatype', sourceHandle: 'no', target: 'leaf6', label: 'No', style: { stroke: '#ef4444' } },
    { id: 'e14', source: 'unsorted-notarget-datatype', sourceHandle: 'yes', target: 'leaf7', label: 'Yes', style: { stroke: '#10b981' } },
    { id: 'e15', source: 'unsorted-notarget-datatype', sourceHandle: 'no', target: 'leaf8', label: 'No', style: { stroke: '#ef4444' } },
    
    // Leaf nodes to LeetCode problem nodes
    { id: 'e16', source: 'leaf1', target: 'leetcode1', style: { stroke: '#f97316', strokeDasharray: '5,5' } },
    { id: 'e17', source: 'leaf2', target: 'leetcode2', style: { stroke: '#f97316', strokeDasharray: '5,5' } },
    { id: 'e18', source: 'leaf3', target: 'leetcode3', style: { stroke: '#f97316', strokeDasharray: '5,5' } },
    { id: 'e19', source: 'leaf4', target: 'leetcode4', style: { stroke: '#f97316', strokeDasharray: '5,5' } },
    { id: 'e20', source: 'leaf5', target: 'leetcode5', style: { stroke: '#f97316', strokeDasharray: '5,5' } },
    { id: 'e21', source: 'leaf6', target: 'leetcode6', style: { stroke: '#f97316', strokeDasharray: '5,5' } },
    { id: 'e22', source: 'leaf7', target: 'leetcode7', style: { stroke: '#f97316', strokeDasharray: '5,5' } },
    { id: 'e23', source: 'leaf8', target: 'leetcode8', style: { stroke: '#f97316', strokeDasharray: '5,5' } },
  ]

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <div className="p-4 bg-gray-100 border-b">
        <h1 className="text-2xl font-bold text-gray-800">Two-Pointer Problems Decision Tree</h1>
        <p className="text-gray-600 mt-1">Navigate through decision points to find the right technique for your problem</p>
        <div className="text-sm text-gray-500 mt-2">
          <strong>How to use:</strong> Start from the purple root node and follow the green "Yes" or red "No" paths based on your problem characteristics. 
          Each green leaf node contains the recommended technique and connects to orange LeetCode problem blocks below.
          <br />
          <strong>Controls:</strong> Zoom with mouse wheel, pan by dragging, and use the control panel in the bottom-left corner.
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
