'use client'

import React, { useCallback, useMemo } from 'react'
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  BackgroundVariant,
  NodeTypes,
  Handle,
  Position,
} from 'reactflow'
import 'reactflow/dist/style.css'

// Custom Decision Node Component
const DecisionNode = ({ data }: { data: any }) => {
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

// Custom Leaf Node Component for final solutions
const LeafNode = ({ data }: { data: any }) => {
  return (
    <div className="px-4 py-3 shadow-lg rounded-xl bg-green-100 border-2 border-green-300 min-w-[280px] max-w-[320px]">
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      <div className="text-center">
        <div className="text-sm font-bold text-green-800 mb-2">{data.technique}</div>
        <div className="text-xs text-green-700 mb-2">
          <div><strong>Data Structures:</strong> {data.dataStructures}</div>
          <div><strong>Complexity:</strong> {data.complexity}</div>
        </div>
        <div className="text-xs text-green-600">
          <div className="font-semibold mb-1">LeetCode Problems:</div>
          {data.problems.map((problem: any, index: number) => (
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
  )
}

// Root Node Component
const RootNode = ({ data }: { data: any }) => {
  return (
    <div className="px-6 py-4 shadow-lg rounded-full bg-purple-100 border-3 border-purple-400 min-w-[200px]">
      <div className="text-center">
        <div className="text-lg font-bold text-purple-800">{data.label}</div>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-4 h-4" />
    </div>
  )
}

const nodeTypes: NodeTypes = {
  decision: DecisionNode,
  leaf: LeafNode,
  root: RootNode,
}

export default function TwoPointerTreePage() {
  // Define the decision tree structure
  const initialNodes: Node[] = [
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
    
    // Level 2: Target/Sum - Sorted branch
    {
      id: 'sorted-target',
      type: 'decision', 
      position: { x: 300, y: 320 },
      data: { 
        label: 'Looking for specific target/sum?',
        tooltip: 'Are we searching for a specific value or sum?'
      }
    },
    
    // Level 2: Target/Sum - Unsorted branch
    {
      id: 'unsorted-target',
      type: 'decision',
      position: { x: 900, y: 320 },
      data: { 
        label: 'Looking for specific target/sum?',
        tooltip: 'Are we searching for a specific value or sum?'
      }
    },
    
    // Level 3: Pointer Movement - Sorted + Target
    {
      id: 'sorted-target-movement',
      type: 'decision',
      position: { x: 150, y: 460 },
      data: { 
        label: 'Opposite direction pointers?',
        tooltip: 'Do pointers move towards each other or same direction?'
      }
    },
    
    // Level 3: In-place modification - Sorted + No Target  
    {
      id: 'sorted-notarget-inplace',
      type: 'decision',
      position: { x: 450, y: 460 },
      data: { 
        label: 'In-place modification?',
        tooltip: 'Are we modifying the array in place?'
      }
    },
    
    // Level 3: Data type - Unsorted + Target
    {
      id: 'unsorted-target-datatype',
      type: 'decision',
      position: { x: 750, y: 460 },
      data: { 
        label: 'Working with subarrays?',
        tooltip: 'Are we dealing with subarrays/substrings vs individual elements?'
      }
    },
    
    // Level 3: Data type - Unsorted + No Target
    {
      id: 'unsorted-notarget-datatype',
      type: 'decision',
      position: { x: 1050, y: 460 },
      data: { 
        label: 'Working with subarrays?',
        tooltip: 'Are we dealing with subarrays/substrings vs individual elements?'
      }
    },
    
    // Leaf Nodes with Solutions
    {
      id: 'leaf1',
      type: 'leaf',
      position: { x: 50, y: 600 },
      data: {
        technique: 'Two Sum Pattern (Opposite Pointers)',
        dataStructures: 'Array, Hash Map (optional)',
        complexity: 'O(n) time, O(1) space',
                 problems: [
           { number: 15, title: '3Sum', url: 'https://leetcode.com/problems/3sum/' },
           { number: 16, title: '3Sum Closest', url: 'https://leetcode.com/problems/3sum-closest/' },
           { number: 18, title: '4Sum', url: 'https://leetcode.com/problems/4sum/' },
           { number: 167, title: 'Two Sum II - Input Array Is Sorted', url: 'https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/' }
         ]
      }
    },
    
    {
      id: 'leaf2',
      type: 'leaf',
      position: { x: 250, y: 600 },
      data: {
        technique: 'Fast-Slow Pointers',
        dataStructures: 'Array',
        complexity: 'O(n) time, O(1) space',
        problems: [
          { number: 19, title: 'Remove Nth Node From End', url: 'https://leetcode.com/problems/remove-nth-node-from-end-of-list/' }
        ]
      }
    },
    
    {
      id: 'leaf3',
      type: 'leaf',
      position: { x: 350, y: 600 },
      data: {
        technique: 'In-Place Array Modification',
        dataStructures: 'Array',
        complexity: 'O(n) time, O(1) space',
        problems: [
          { number: 26, title: 'Remove Duplicates from Sorted Array', url: 'https://leetcode.com/problems/remove-duplicates-from-sorted-array/' },
          { number: 27, title: 'Remove Element', url: 'https://leetcode.com/problems/remove-element/' }
        ]
      }
    },
    
    {
      id: 'leaf4',
      type: 'leaf',
      position: { x: 550, y: 600 },
      data: {
        technique: 'Sliding Window (Same Direction)',
        dataStructures: 'Array, Hash Map',
        complexity: 'O(n) time, O(k) space',
        problems: [
          { number: 28, title: 'Find First Occurrence in String', url: 'https://leetcode.com/problems/find-the-index-of-the-first-occurrence-in-a-string/' }
        ]
      }
    },
    
    {
      id: 'leaf5',
      type: 'leaf',
      position: { x: 650, y: 600 },
      data: {
        technique: 'Expand Around Centers',
        dataStructures: 'String',
        complexity: 'O(n²) time, O(1) space',
        problems: [
          { number: 5, title: 'Longest Palindromic Substring', url: 'https://leetcode.com/problems/longest-palindromic-substring/' }
        ]
      }
    },
    
         {
       id: 'leaf6',
       type: 'leaf',
       position: { x: 850, y: 600 },
       data: {
         technique: 'Sliding Window (Variable Size)',
         dataStructures: 'Array, Hash Map',
         complexity: 'O(n) time, O(k) space',
         problems: [
           { number: 3, title: 'Longest Substring Without Repeating', url: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/' },
           { number: 76, title: 'Minimum Window Substring', url: 'https://leetcode.com/problems/minimum-window-substring/' }
         ]
       }
     },
    
    {
      id: 'leaf7',
      type: 'leaf',
      position: { x: 950, y: 600 },
      data: {
        technique: 'Opposite Direction (Greedy)',
        dataStructures: 'Array',
        complexity: 'O(n) time, O(1) space',
        problems: [
          { number: 11, title: 'Container With Most Water', url: 'https://leetcode.com/problems/container-with-most-water/' }
        ]
      }
    },
    
         {
       id: 'leaf8',
       type: 'leaf',
       position: { x: 1150, y: 600 },
       data: {
         technique: 'Dynamic Window/Partitioning',
         dataStructures: 'Array, Stack',
         complexity: 'O(n) time, O(n) space',
         problems: [
           { number: 42, title: 'Trapping Rain Water', url: 'https://leetcode.com/problems/trapping-rain-water/' },
           { number: 977, title: 'Squares of Sorted Array', url: 'https://leetcode.com/problems/squares-of-a-sorted-array/' }
         ]
       }
     }
  ]

  const initialEdges: Edge[] = [
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
  ]

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  return (
    <div className="w-full h-screen">
      <div className="p-4 bg-gray-100 border-b">
        <h1 className="text-2xl font-bold text-gray-800">Two-Pointer Problems Decision Tree</h1>
        <p className="text-gray-600 mt-1">Navigate through decision points to find the right technique for your problem</p>
        <div className="text-sm text-gray-500 mt-2">
          <strong>How to use:</strong> Start from the purple root node and follow the green "Yes" or red "No" paths based on your problem characteristics. 
          Each green leaf node contains the recommended technique, data structures, complexity, and relevant LeetCode problems.
        </div>
      </div>
      
      <div className="w-full h-full">
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