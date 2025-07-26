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

// Custom Decision Node Component
const DecisionNode = ({ data }) => {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-blue-200">
      <div className="flex">
        <div className="ml-2">
          <div className="text-lg font-bold text-gray-900">{data.label}</div>
          <div className="text-gray-500 text-sm">{data.question}</div>
        </div>
      </div>
      <Handle type="target" position={Position.Top} className="w-16 !bg-blue-500" />
      <Handle type="source" id="yes" position={Position.Bottom} style={{left: '25%'}} className="w-16 !bg-green-500" />
      <Handle type="source" id="no" position={Position.Bottom} style={{left: '75%'}} className="w-16 !bg-red-500" />
    </div>
  )
}

// Custom Leaf Node Component (Sorting Techniques)
const LeafNode = ({ data }) => {
  return (
    <div className="px-6 py-4 shadow-lg rounded-lg bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-300 min-w-[300px]">
      <div className="text-lg font-bold text-blue-900 mb-2">{data.label}</div>
      <div className="text-sm text-gray-700 mb-3">{data.description}</div>
      <div className="space-y-2">
        <div className="text-xs">
          <span className="font-semibold text-gray-600">Time:</span> 
          <span className="ml-1 text-blue-700">{data.timeComplexity}</span>
        </div>
        <div className="text-xs">
          <span className="font-semibold text-gray-600">Space:</span> 
          <span className="ml-1 text-blue-700">{data.spaceComplexity}</span>
        </div>
        <div className="text-xs">
          <span className="font-semibold text-gray-600">Properties:</span> 
          <span className="ml-1 text-green-700">{data.properties}</span>
        </div>
        <div className="text-xs">
          <span className="font-semibold text-gray-600">Use Cases:</span> 
          <span className="ml-1 text-purple-700">{data.useCases}</span>
        </div>
      </div>
      <Handle type="target" position={Position.Top} className="w-16 !bg-blue-500" />
      <Handle type="source" position={Position.Bottom} className="w-16 !bg-purple-500" />
    </div>
  )
}

// Problem Node Component
const ProblemNode = ({ data }) => {
  return (
    <div className="px-4 py-3 shadow-md rounded-md bg-yellow-50 border-2 border-yellow-300 min-w-[250px]">
      <div className="text-sm font-bold text-yellow-900 mb-2">LeetCode Problems:</div>
      <div className="space-y-1">
        {data.problems.map((problem, index) => (
          <div key={index} className="text-xs text-gray-700">
            <span className="font-medium text-yellow-800">{problem.number}.</span> {problem.title}
            <span className="ml-2 text-green-600">({problem.difficulty})</span>
          </div>
        ))}
      </div>
      <Handle type="target" position={Position.Top} className="w-16 !bg-yellow-500" />
    </div>
  )
}

// Root Node Component
const RootNode = ({ data }) => {
  return (
    <div className="px-8 py-6 shadow-xl rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 border-3 border-purple-400">
      <div className="text-xl font-bold text-purple-900 text-center">{data.label}</div>
      <div className="text-sm text-purple-700 text-center mt-2">{data.description}</div>
      <Handle type="source" position={Position.Bottom} className="w-20 !bg-purple-600" />
    </div>
  )
}

const nodeTypes = {
  decision: DecisionNode,
  leaf: LeafNode,
  problem: ProblemNode,
  root: RootNode,
}

// Export functions
const downloadSvg = (reactFlowInstance, viewType) => {
  const nodes = reactFlowInstance.getNodes()
  const edges = reactFlowInstance.getEdges()
  const nodesBounds = getNodesBounds(nodes)
  const viewport = getViewportForBounds(nodesBounds, 1200, 800, 0.5, 2)
  
  const svgElement = document.querySelector('.react-flow__renderer svg')
  if (svgElement) {
    const serializer = new XMLSerializer()
    const svgString = serializer.serializeToString(svgElement)
    const blob = new Blob([svgString], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `sorting-decision-tree-${viewType}.svg`
    link.click()
    URL.revokeObjectURL(url)
  }
}

const downloadPng = (reactFlowInstance, viewType) => {
  const nodes = reactFlowInstance.getNodes()
  const edges = reactFlowInstance.getEdges()
  const nodesBounds = getNodesBounds(nodes)
  const viewport = getViewportForBounds(nodesBounds, 1200, 800, 0.5, 2)
  
  const svgElement = document.querySelector('.react-flow__renderer svg')
  if (svgElement) {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    const serializer = new XMLSerializer()
    const svgString = serializer.serializeToString(svgElement)
    const blob = new Blob([svgString], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)
      
      canvas.toBlob((blob) => {
        const pngUrl = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = pngUrl
        link.download = `sorting-decision-tree-${viewType}.png`
        link.click()
        URL.revokeObjectURL(pngUrl)
      })
      
      URL.revokeObjectURL(url)
    }
    
    img.src = url
  }
}

// Algorithm Type view data
const algorithmTypeData = {
  nodes: [
    {
      id: 'root',
      type: 'root',
      position: { x: 600, y: 50 },
      data: { 
        label: 'Sorting Algorithms',
        description: 'Choose the right sorting approach based on algorithm characteristics'
      },
    },
    {
      id: 'decision-1',
      type: 'decision',
      position: { x: 600, y: 200 },
      data: { 
        label: 'Algorithm Strategy',
        question: 'Does the problem require divide-and-conquer approach?'
      },
    },
    {
      id: 'decision-2',
      type: 'decision',
      position: { x: 300, y: 350 },
      data: { 
        label: 'Memory Constraints',
        question: 'Do you need in-place sorting (O(1) extra space)?'
      },
    },
    {
      id: 'decision-3',
      type: 'decision',
      position: { x: 900, y: 350 },
      data: { 
        label: 'Data Range',
        question: 'Is the input range small and known (e.g., integers 0-1000)?'
      },
    },
    {
      id: 'decision-4',
      type: 'decision',
      position: { x: 150, y: 500 },
      data: { 
        label: 'Stability Requirement',
        question: 'Do you need stable sorting (preserve relative order)?'
      },
    },
    {
      id: 'decision-5',
      type: 'decision',
      position: { x: 450, y: 500 },
      data: { 
        label: 'Performance Priority',
        question: 'Is worst-case O(n log n) guarantee required?'
      },
    },
    {
      id: 'decision-6',
      type: 'decision',
      position: { x: 750, y: 500 },
      data: { 
        label: 'Data Distribution',
        question: 'Are elements uniformly distributed?'
      },
    },
    {
      id: 'decision-7',
      type: 'decision',
      position: { x: 1050, y: 500 },
      data: { 
        label: 'Custom Comparison',
        question: 'Do you need custom sorting criteria?'
      },
    },
    // Leaf nodes (sorting techniques)
    {
      id: 'insertion-sort',
      type: 'leaf',
      position: { x: 50, y: 700 },
      data: {
        label: 'Insertion Sort',
        description: 'Simple, stable, in-place sorting for small arrays',
        timeComplexity: 'O(n²) worst, O(n) best',
        spaceComplexity: 'O(1)',
        properties: 'Stable, In-place, Adaptive',
        useCases: 'Small arrays, nearly sorted data, online sorting'
      },
    },
    {
      id: 'selection-sort',
      type: 'leaf',
      position: { x: 250, y: 700 },
      data: {
        label: 'Selection Sort',
        description: 'Simple in-place sorting with minimal swaps',
        timeComplexity: 'O(n²)',
        spaceComplexity: 'O(1)',
        properties: 'Unstable, In-place, Non-adaptive',
        useCases: 'Memory-constrained environments, minimal swaps needed'
      },
    },
    {
      id: 'heap-sort',
      type: 'leaf',
      position: { x: 450, y: 700 },
      data: {
        label: 'Heap Sort',
        description: 'Guaranteed O(n log n) in-place sorting using heap data structure',
        timeComplexity: 'O(n log n)',
        spaceComplexity: 'O(1)',
        properties: 'Unstable, In-place, Non-adaptive',
        useCases: 'Guaranteed performance, memory constraints, priority queues'
      },
    },
    {
      id: 'quick-sort',
      type: 'leaf',
      position: { x: 650, y: 700 },
      data: {
        label: 'Quick Sort',
        description: 'Fast average-case divide-and-conquer sorting',
        timeComplexity: 'O(n log n) avg, O(n²) worst',
        spaceComplexity: 'O(log n)',
        properties: 'Unstable, In-place, Cache-friendly',
        useCases: 'General purpose, large datasets, when average case is acceptable'
      },
    },
    {
      id: 'bucket-sort',
      type: 'leaf',
      position: { x: 750, y: 700 },
      data: {
        label: 'Bucket Sort',
        description: 'Distributes elements into buckets for uniform data',
        timeComplexity: 'O(n + k) avg, O(n²) worst',
        spaceComplexity: 'O(n + k)',
        properties: 'Stable, Not in-place, Distribution-dependent',
        useCases: 'Uniformly distributed data, floating-point numbers'
      },
    },
    {
      id: 'counting-sort',
      type: 'leaf',
      position: { x: 950, y: 700 },
      data: {
        label: 'Counting Sort',
        description: 'Linear time sorting for small integer ranges',
        timeComplexity: 'O(n + k)',
        spaceComplexity: 'O(k)',
        properties: 'Stable, Not in-place, Range-dependent',
        useCases: 'Small integer ranges, counting problems, as subroutine'
      },
    },
    {
      id: 'radix-sort',
      type: 'leaf',
      position: { x: 1150, y: 700 },
      data: {
        label: 'Radix Sort',
        description: 'Sorts integers digit by digit using stable sorting',
        timeComplexity: 'O(d × (n + k))',
        spaceComplexity: 'O(n + k)',
        properties: 'Stable, Not in-place, Digit-based',
        useCases: 'Integer arrays, fixed-length strings, large datasets'
      },
    },
    {
      id: 'merge-sort',
      type: 'leaf',
      position: { x: 1350, y: 700 },
      data: {
        label: 'Merge Sort',
        description: 'Stable divide-and-conquer with guaranteed O(n log n)',
        timeComplexity: 'O(n log n)',
        spaceComplexity: 'O(n)',
        properties: 'Stable, Not in-place, Predictable',
        useCases: 'Stable sorting required, linked lists, external sorting'
      },
    },
    {
      id: 'custom-comparator',
      type: 'leaf',
      position: { x: 1550, y: 700 },
      data: {
        label: 'Custom Comparator',
        description: 'Use standard library sort with custom comparison function',
        timeComplexity: 'O(n log n)',
        spaceComplexity: 'O(log n)',
        properties: 'Configurable stability, Flexible',
        useCases: 'Complex objects, multiple sort criteria, custom ordering'
      },
    },
    {
      id: 'quickselect',
      type: 'leaf',
      position: { x: 1750, y: 700 },
      data: {
        label: 'QuickSelect',
        description: 'Find kth smallest element without full sorting',
        timeComplexity: 'O(n) avg, O(n²) worst',
        spaceComplexity: 'O(log n)',
        properties: 'Partial sorting, In-place',
        useCases: 'Finding median, top-k problems, nth element'
      },
    },
    // Problem nodes
    {
      id: 'problems-insertion',
      type: 'problem',
      position: { x: 50, y: 900 },
      data: {
        problems: [
          { number: 147, title: 'Insertion Sort List', difficulty: 'Medium' },
          { number: 148, title: 'Sort List', difficulty: 'Medium' },
          { number: 21, title: 'Merge Two Sorted Lists', difficulty: 'Easy' },
          { number: 88, title: 'Merge Sorted Array', difficulty: 'Easy' }
        ]
      },
    },
    {
      id: 'problems-selection',
      type: 'problem',
      position: { x: 250, y: 900 },
      data: {
        problems: [
          { number: 215, title: 'Kth Largest Element', difficulty: 'Medium' },
          { number: 324, title: 'Wiggle Sort II', difficulty: 'Medium' },
          { number: 75, title: 'Sort Colors', difficulty: 'Medium' },
          { number: 164, title: 'Maximum Gap', difficulty: 'Hard' }
        ]
      },
    },
    {
      id: 'problems-heap',
      type: 'problem',
      position: { x: 450, y: 900 },
      data: {
        problems: [
          { number: 215, title: 'Kth Largest Element', difficulty: 'Medium' },
          { number: 347, title: 'Top K Frequent Elements', difficulty: 'Medium' },
          { number: 692, title: 'Top K Frequent Words', difficulty: 'Medium' },
          { number: 973, title: 'K Closest Points to Origin', difficulty: 'Medium' }
        ]
      },
    },
    {
      id: 'problems-quick',
      type: 'problem',
      position: { x: 650, y: 900 },
      data: {
        problems: [
          { number: 912, title: 'Sort an Array', difficulty: 'Medium' },
          { number: 75, title: 'Sort Colors', difficulty: 'Medium' },
          { number: 324, title: 'Wiggle Sort II', difficulty: 'Medium' },
          { number: 280, title: 'Wiggle Sort', difficulty: 'Medium' }
        ]
      },
    },
    {
      id: 'problems-bucket',
      type: 'problem',
      position: { x: 750, y: 900 },
      data: {
        problems: [
          { number: 164, title: 'Maximum Gap', difficulty: 'Hard' },
          { number: 347, title: 'Top K Frequent Elements', difficulty: 'Medium' },
          { number: 451, title: 'Sort Characters By Frequency', difficulty: 'Medium' },
          { number: 692, title: 'Top K Frequent Words', difficulty: 'Medium' }
        ]
      },
    },
    {
      id: 'problems-counting',
      type: 'problem',
      position: { x: 950, y: 900 },
      data: {
        problems: [
          { number: 75, title: 'Sort Colors', difficulty: 'Medium' },
          { number: 274, title: 'H-Index', difficulty: 'Medium' },
          { number: 1122, title: 'Relative Sort Array', difficulty: 'Easy' },
          { number: 1365, title: 'How Many Numbers Are Smaller', difficulty: 'Easy' }
        ]
      },
    },
    {
      id: 'problems-radix',
      type: 'problem',
      position: { x: 1150, y: 900 },
      data: {
        problems: [
          { number: 164, title: 'Maximum Gap', difficulty: 'Hard' },
          { number: 274, title: 'H-Index', difficulty: 'Medium' },
          { number: 912, title: 'Sort an Array', difficulty: 'Medium' },
          { number: 179, title: 'Largest Number', difficulty: 'Medium' }
        ]
      },
    },
    {
      id: 'problems-merge',
      type: 'problem',
      position: { x: 1350, y: 900 },
      data: {
        problems: [
          { number: 148, title: 'Sort List', difficulty: 'Medium' },
          { number: 88, title: 'Merge Sorted Array', difficulty: 'Easy' },
          { number: 21, title: 'Merge Two Sorted Lists', difficulty: 'Easy' },
          { number: 23, title: 'Merge k Sorted Lists', difficulty: 'Hard' }
        ]
      },
    },
    {
      id: 'problems-custom',
      type: 'problem',
      position: { x: 1550, y: 900 },
      data: {
        problems: [
          { number: 56, title: 'Merge Intervals', difficulty: 'Medium' },
          { number: 179, title: 'Largest Number', difficulty: 'Medium' },
          { number: 937, title: 'Reorder Data in Log Files', difficulty: 'Easy' },
          { number: 1451, title: 'Rearrange Words in a Sentence', difficulty: 'Medium' }
        ]
      },
    },
    {
      id: 'problems-quickselect',
      type: 'problem',
      position: { x: 1750, y: 900 },
      data: {
        problems: [
          { number: 215, title: 'Kth Largest Element', difficulty: 'Medium' },
          { number: 973, title: 'K Closest Points to Origin', difficulty: 'Medium' },
          { number: 324, title: 'Wiggle Sort II', difficulty: 'Medium' },
          { number: 347, title: 'Top K Frequent Elements', difficulty: 'Medium' }
        ]
      },
    },
  ],
  edges: [
    // Root to first decision
    { id: 'e-root-1', source: 'root', target: 'decision-1' },
    
    // First level decisions
    { id: 'e-1-2', source: 'decision-1', sourceHandle: 'no', target: 'decision-2', label: 'No' },
    { id: 'e-1-3', source: 'decision-1', sourceHandle: 'yes', target: 'decision-3', label: 'Yes' },
    
    // Second level decisions
    { id: 'e-2-4', source: 'decision-2', sourceHandle: 'yes', target: 'decision-4', label: 'Yes' },
    { id: 'e-2-5', source: 'decision-2', sourceHandle: 'no', target: 'decision-5', label: 'No' },
    { id: 'e-3-6', source: 'decision-3', sourceHandle: 'no', target: 'decision-6', label: 'No' },
    { id: 'e-3-7', source: 'decision-3', sourceHandle: 'yes', target: 'decision-7', label: 'Yes' },
    
    // Decisions to techniques
    { id: 'e-4-insertion', source: 'decision-4', sourceHandle: 'yes', target: 'insertion-sort', label: 'Yes' },
    { id: 'e-4-selection', source: 'decision-4', sourceHandle: 'no', target: 'selection-sort', label: 'No' },
    { id: 'e-5-heap', source: 'decision-5', sourceHandle: 'yes', target: 'heap-sort', label: 'Yes' },
    { id: 'e-5-quick', source: 'decision-5', sourceHandle: 'no', target: 'quick-sort', label: 'No' },
    { id: 'e-6-bucket', source: 'decision-6', sourceHandle: 'yes', target: 'bucket-sort', label: 'Yes' },
    { id: 'e-6-merge', source: 'decision-6', sourceHandle: 'no', target: 'merge-sort', label: 'No' },
    { id: 'e-7-counting', source: 'decision-7', sourceHandle: 'no', target: 'counting-sort', label: 'No' },
    { id: 'e-7-radix', source: 'decision-7', sourceHandle: 'yes', target: 'radix-sort', label: 'Yes (digits)' },
    { id: 'e-7-custom', source: 'decision-7', sourceHandle: 'yes', target: 'custom-comparator', label: 'Yes (objects)' },
    { id: 'e-7-quickselect', source: 'decision-7', sourceHandle: 'yes', target: 'quickselect', label: 'Yes (partial)' },
    
    // Techniques to problems
    { id: 'e-insertion-problems', source: 'insertion-sort', target: 'problems-insertion' },
    { id: 'e-selection-problems', source: 'selection-sort', target: 'problems-selection' },
    { id: 'e-heap-problems', source: 'heap-sort', target: 'problems-heap' },
    { id: 'e-quick-problems', source: 'quick-sort', target: 'problems-quick' },
    { id: 'e-bucket-problems', source: 'bucket-sort', target: 'problems-bucket' },
    { id: 'e-counting-problems', source: 'counting-sort', target: 'problems-counting' },
    { id: 'e-radix-problems', source: 'radix-sort', target: 'problems-radix' },
    { id: 'e-merge-problems', source: 'merge-sort', target: 'problems-merge' },
    { id: 'e-custom-problems', source: 'custom-comparator', target: 'problems-custom' },
    { id: 'e-quickselect-problems', source: 'quickselect', target: 'problems-quickselect' },
  ],
}

// Complexity Class view data
const complexityClassData = {
  nodes: [
    {
      id: 'root',
      type: 'root',
      position: { x: 600, y: 50 },
      data: { 
        label: 'Sorting by Complexity',
        description: 'Choose sorting algorithms based on time/space complexity requirements'
      },
    },
    {
      id: 'decision-1',
      type: 'decision',
      position: { x: 600, y: 200 },
      data: { 
        label: 'Time Complexity Priority',
        question: 'Do you need guaranteed O(n log n) or better?'
      },
    },
    {
      id: 'decision-2',
      type: 'decision',
      position: { x: 300, y: 350 },
      data: { 
        label: 'Space Constraints',
        question: 'Is O(1) space complexity required?'
      },
    },
    {
      id: 'decision-3',
      type: 'decision',
      position: { x: 900, y: 350 },
      data: { 
        label: 'Linear Time Possible',
        question: 'Can you achieve O(n) time with your data constraints?'
      },
    },
    {
      id: 'decision-4',
      type: 'decision',
      position: { x: 150, y: 500 },
      data: { 
        label: 'Worst Case Guarantee',
        question: 'Is worst-case performance critical?'
      },
    },
    {
      id: 'decision-5',
      type: 'decision',
      position: { x: 450, y: 500 },
      data: { 
        label: 'Average vs Worst',
        question: 'Is average-case performance acceptable?'
      },
    },
    {
      id: 'decision-6',
      type: 'decision',
      position: { x: 750, y: 500 },
      data: { 
        label: 'Data Range Known',
        question: 'Is the input range limited and known?'
      },
    },
    {
      id: 'decision-7',
      type: 'decision',
      position: { x: 1050, y: 500 },
      data: { 
        label: 'Simple Implementation',
        question: 'Is implementation simplicity important?'
      },
    },
    // Leaf nodes grouped by complexity
    // O(n log n) guaranteed
    {
      id: 'heap-sort-complex',
      type: 'leaf',
      position: { x: 50, y: 700 },
      data: {
        label: 'Heap Sort',
        description: 'O(n log n) guaranteed, O(1) space, in-place',
        timeComplexity: 'O(n log n)',
        spaceComplexity: 'O(1)',
        properties: 'Guaranteed performance, In-place',
        useCases: 'Memory constraints, worst-case guarantees'
      },
    },
    {
      id: 'merge-sort-complex',
      type: 'leaf',
      position: { x: 250, y: 700 },
      data: {
        label: 'Merge Sort',
        description: 'O(n log n) guaranteed, O(n) space, stable',
        timeComplexity: 'O(n log n)',
        spaceComplexity: 'O(n)',
        properties: 'Guaranteed performance, Stable',
        useCases: 'Stability required, predictable performance'
      },
    },
    // O(n log n) average  
    {
      id: 'quick-sort-complex',
      type: 'leaf',
      position: { x: 450, y: 700 },
      data: {
        label: 'Quick Sort',
        description: 'O(n log n) average, O(n²) worst, O(log n) space',
        timeComplexity: 'O(n log n) avg, O(n²) worst',
        spaceComplexity: 'O(log n)',
        properties: 'Fast average case, Cache-friendly',
        useCases: 'General purpose, large datasets'
      },
    },
    // Linear time algorithms
    {
      id: 'counting-sort-complex',
      type: 'leaf',
      position: { x: 650, y: 700 },
      data: {
        label: 'Counting Sort',
        description: 'O(n + k) time, works for small integer ranges',
        timeComplexity: 'O(n + k)',
        spaceComplexity: 'O(k)',
        properties: 'Linear time, Range-dependent',
        useCases: 'Small integer ranges, stable sorting'
      },
    },
    {
      id: 'radix-sort-complex',
      type: 'leaf',
      position: { x: 850, y: 700 },
      data: {
        label: 'Radix Sort',
        description: 'O(d × (n + k)) time for d-digit numbers',
        timeComplexity: 'O(d × (n + k))',
        spaceComplexity: 'O(n + k)',
        properties: 'Linear for fixed digits, Stable',
        useCases: 'Integer sorting, fixed-length keys'
      },
    },
    {
      id: 'bucket-sort-complex',
      type: 'leaf',
      position: { x: 1050, y: 700 },
      data: {
        label: 'Bucket Sort',
        description: 'O(n + k) average for uniform distribution',
        timeComplexity: 'O(n + k) avg, O(n²) worst',
        spaceComplexity: 'O(n + k)',
        properties: 'Linear for uniform data, Stable',
        useCases: 'Uniform distribution, floating point'
      },
    },
    // Simple O(n²) algorithms
    {
      id: 'insertion-sort-complex',
      type: 'leaf',
      position: { x: 1250, y: 700 },
      data: {
        label: 'Insertion Sort',
        description: 'O(n²) worst, O(n) best, O(1) space',
        timeComplexity: 'O(n²) worst, O(n) best',
        spaceComplexity: 'O(1)',
        properties: 'Simple, Adaptive, Stable',
        useCases: 'Small arrays, nearly sorted data'
      },
    },
    {
      id: 'selection-sort-complex',
      type: 'leaf',
      position: { x: 1450, y: 700 },
      data: {
        label: 'Selection Sort',
        description: 'O(n²) time, O(1) space, minimal swaps',
        timeComplexity: 'O(n²)',
        spaceComplexity: 'O(1)',
        properties: 'Minimal swaps, Simple',
        useCases: 'Memory writes expensive, teaching'
      },
    },
    // Specialized complexity
    {
      id: 'quickselect-complex',
      type: 'leaf',
      position: { x: 1650, y: 700 },
      data: {
        label: 'QuickSelect',
        description: 'O(n) average for partial sorting',
        timeComplexity: 'O(n) avg, O(n²) worst',
        spaceComplexity: 'O(log n)',
        properties: 'Partial sorting, Expected linear',
        useCases: 'Finding kth element, top-k problems'
      },
    },
    // Problem nodes
    {
      id: 'problems-heap-complex',
      type: 'problem',
      position: { x: 50, y: 900 },
      data: {
        problems: [
          { number: 215, title: 'Kth Largest Element', difficulty: 'Medium' },
          { number: 347, title: 'Top K Frequent Elements', difficulty: 'Medium' },
          { number: 692, title: 'Top K Frequent Words', difficulty: 'Medium' },
          { number: 973, title: 'K Closest Points to Origin', difficulty: 'Medium' }
        ]
      },
    },
    {
      id: 'problems-merge-complex',
      type: 'problem',
      position: { x: 250, y: 900 },
      data: {
        problems: [
          { number: 148, title: 'Sort List', difficulty: 'Medium' },
          { number: 88, title: 'Merge Sorted Array', difficulty: 'Easy' },
          { number: 21, title: 'Merge Two Sorted Lists', difficulty: 'Easy' },
          { number: 23, title: 'Merge k Sorted Lists', difficulty: 'Hard' }
        ]
      },
    },
    {
      id: 'problems-quick-complex',
      type: 'problem',
      position: { x: 450, y: 900 },
      data: {
        problems: [
          { number: 912, title: 'Sort an Array', difficulty: 'Medium' },
          { number: 75, title: 'Sort Colors', difficulty: 'Medium' },
          { number: 324, title: 'Wiggle Sort II', difficulty: 'Medium' },
          { number: 280, title: 'Wiggle Sort', difficulty: 'Medium' }
        ]
      },
    },
    {
      id: 'problems-counting-complex',
      type: 'problem',
      position: { x: 650, y: 900 },
      data: {
        problems: [
          { number: 75, title: 'Sort Colors', difficulty: 'Medium' },
          { number: 274, title: 'H-Index', difficulty: 'Medium' },
          { number: 1122, title: 'Relative Sort Array', difficulty: 'Easy' },
          { number: 1365, title: 'How Many Numbers Are Smaller', difficulty: 'Easy' }
        ]
      },
    },
    {
      id: 'problems-radix-complex',
      type: 'problem',
      position: { x: 850, y: 900 },
      data: {
        problems: [
          { number: 164, title: 'Maximum Gap', difficulty: 'Hard' },
          { number: 274, title: 'H-Index', difficulty: 'Medium' },
          { number: 912, title: 'Sort an Array', difficulty: 'Medium' },
          { number: 179, title: 'Largest Number', difficulty: 'Medium' }
        ]
      },
    },
    {
      id: 'problems-bucket-complex',
      type: 'problem',
      position: { x: 1050, y: 900 },
      data: {
        problems: [
          { number: 164, title: 'Maximum Gap', difficulty: 'Hard' },
          { number: 347, title: 'Top K Frequent Elements', difficulty: 'Medium' },
          { number: 451, title: 'Sort Characters By Frequency', difficulty: 'Medium' },
          { number: 692, title: 'Top K Frequent Words', difficulty: 'Medium' }
        ]
      },
    },
    {
      id: 'problems-insertion-complex',
      type: 'problem',
      position: { x: 1250, y: 900 },
      data: {
        problems: [
          { number: 147, title: 'Insertion Sort List', difficulty: 'Medium' },
          { number: 148, title: 'Sort List', difficulty: 'Medium' },
          { number: 21, title: 'Merge Two Sorted Lists', difficulty: 'Easy' },
          { number: 88, title: 'Merge Sorted Array', difficulty: 'Easy' }
        ]
      },
    },
    {
      id: 'problems-selection-complex',
      type: 'problem',
      position: { x: 1450, y: 900 },
      data: {
        problems: [
          { number: 215, title: 'Kth Largest Element', difficulty: 'Medium' },
          { number: 324, title: 'Wiggle Sort II', difficulty: 'Medium' },
          { number: 75, title: 'Sort Colors', difficulty: 'Medium' },
          { number: 164, title: 'Maximum Gap', difficulty: 'Hard' }
        ]
      },
    },
    {
      id: 'problems-quickselect-complex',
      type: 'problem',
      position: { x: 1650, y: 900 },
      data: {
        problems: [
          { number: 215, title: 'Kth Largest Element', difficulty: 'Medium' },
          { number: 973, title: 'K Closest Points to Origin', difficulty: 'Medium' },
          { number: 324, title: 'Wiggle Sort II', difficulty: 'Medium' },
          { number: 347, title: 'Top K Frequent Elements', difficulty: 'Medium' }
        ]
      },
    },
  ],
  edges: [
    // Root to first decision
    { id: 'e-root-1', source: 'root', target: 'decision-1' },
    
    // First level decisions
    { id: 'e-1-2', source: 'decision-1', sourceHandle: 'yes', target: 'decision-2', label: 'Yes' },
    { id: 'e-1-3', source: 'decision-1', sourceHandle: 'no', target: 'decision-3', label: 'No' },
    
    // Second level decisions
    { id: 'e-2-4', source: 'decision-2', sourceHandle: 'yes', target: 'decision-4', label: 'Yes' },
    { id: 'e-2-5', source: 'decision-2', sourceHandle: 'no', target: 'decision-5', label: 'No' },
    { id: 'e-3-6', source: 'decision-3', sourceHandle: 'yes', target: 'decision-6', label: 'Yes' },
    { id: 'e-3-7', source: 'decision-3', sourceHandle: 'no', target: 'decision-7', label: 'No' },
    
    // Decisions to techniques
    { id: 'e-4-heap', source: 'decision-4', sourceHandle: 'yes', target: 'heap-sort-complex', label: 'Yes' },
    { id: 'e-4-quick', source: 'decision-4', sourceHandle: 'no', target: 'quick-sort-complex', label: 'No' },
    { id: 'e-5-merge', source: 'decision-5', sourceHandle: 'no', target: 'merge-sort-complex', label: 'No' },
    { id: 'e-5-quick2', source: 'decision-5', sourceHandle: 'yes', target: 'quick-sort-complex', label: 'Yes' },
    { id: 'e-6-counting', source: 'decision-6', sourceHandle: 'yes', target: 'counting-sort-complex', label: 'Yes (small)' },
    { id: 'e-6-radix', source: 'decision-6', sourceHandle: 'yes', target: 'radix-sort-complex', label: 'Yes (digits)' },
    { id: 'e-6-bucket', source: 'decision-6', sourceHandle: 'yes', target: 'bucket-sort-complex', label: 'Yes (uniform)' },
    { id: 'e-7-insertion', source: 'decision-7', sourceHandle: 'yes', target: 'insertion-sort-complex', label: 'Yes' },
    { id: 'e-7-selection', source: 'decision-7', sourceHandle: 'yes', target: 'selection-sort-complex', label: 'Yes' },
    { id: 'e-7-quickselect', source: 'decision-7', sourceHandle: 'no', target: 'quickselect-complex', label: 'No (partial)' },
    
    // Techniques to problems
    { id: 'e-heap-problems-complex', source: 'heap-sort-complex', target: 'problems-heap-complex' },
    { id: 'e-merge-problems-complex', source: 'merge-sort-complex', target: 'problems-merge-complex' },
    { id: 'e-quick-problems-complex', source: 'quick-sort-complex', target: 'problems-quick-complex' },
    { id: 'e-counting-problems-complex', source: 'counting-sort-complex', target: 'problems-counting-complex' },
    { id: 'e-radix-problems-complex', source: 'radix-sort-complex', target: 'problems-radix-complex' },
    { id: 'e-bucket-problems-complex', source: 'bucket-sort-complex', target: 'problems-bucket-complex' },
    { id: 'e-insertion-problems-complex', source: 'insertion-sort-complex', target: 'problems-insertion-complex' },
    { id: 'e-selection-problems-complex', source: 'selection-sort-complex', target: 'problems-selection-complex' },
    { id: 'e-quickselect-problems-complex', source: 'quickselect-complex', target: 'problems-quickselect-complex' },
  ],
}

// Problem Pattern view data
const problemPatternData = {
  nodes: [
    {
      id: 'root',
      type: 'root',
      position: { x: 600, y: 50 },
      data: { 
        label: 'Sorting by Problem Pattern',
        description: 'Choose sorting approaches based on the specific problem pattern'
      },
    },
    {
      id: 'decision-1',
      type: 'decision',
      position: { x: 600, y: 200 },
      data: { 
        label: 'Problem Context',
        question: 'Are you sorting a complete array/list?'
      },
    },
    {
      id: 'decision-2',
      type: 'decision',
      position: { x: 300, y: 350 },
      data: { 
        label: 'Array Characteristics',
        question: 'Is the array mostly sorted or small?'
      },
    },
    {
      id: 'decision-3',
      type: 'decision',
      position: { x: 900, y: 350 },
      data: { 
        label: 'Partial Sorting Need',
        question: 'Do you only need the top/bottom k elements?'
      },
    },
    {
      id: 'decision-4',
      type: 'decision',
      position: { x: 150, y: 500 },
      data: { 
        label: 'Size Consideration',
        question: 'Is the array size very small (< 50 elements)?'
      },
    },
    {
      id: 'decision-5',
      type: 'decision',
      position: { x: 450, y: 500 },
      data: { 
        label: 'Ordering Requirement',
        question: 'Do you need stable sorting (preserve relative order)?'
      },
    },
    {
      id: 'decision-6',
      type: 'decision',
      position: { x: 750, y: 500 },
      data: { 
        label: 'Top-K Strategy',
        question: 'Is k much smaller than n (k << n)?'
      },
    },
    {
      id: 'decision-7',
      type: 'decision',
      position: { x: 1050, y: 500 },
      data: { 
        label: 'Custom Objects',
        question: 'Are you sorting custom objects with multiple criteria?'
      },
    },
    // Leaf nodes grouped by problem pattern
    // Small/Nearly sorted arrays
    {
      id: 'insertion-pattern',
      type: 'leaf',
      position: { x: 50, y: 700 },
      data: {
        label: 'Insertion Sort',
        description: 'Optimal for small or nearly sorted arrays',
        timeComplexity: 'O(n²) worst, O(n) best',
        spaceComplexity: 'O(1)',
        properties: 'Adaptive, Online, Simple',
        useCases: 'Small datasets, nearly sorted data, real-time insertion'
      },
    },
    // General array sorting
    {
      id: 'merge-pattern',
      type: 'leaf',
      position: { x: 250, y: 700 },
      data: {
        label: 'Merge Sort',
        description: 'Stable sorting for arrays requiring predictable performance',
        timeComplexity: 'O(n log n)',
        spaceComplexity: 'O(n)',
        properties: 'Stable, Predictable, External sorting',
        useCases: 'Stable sorting, linked lists, large datasets'
      },
    },
    {
      id: 'quick-pattern',
      type: 'leaf',
      position: { x: 450, y: 700 },
      data: {
        label: 'Quick Sort',
        description: 'Fast general-purpose array sorting',
        timeComplexity: 'O(n log n) avg, O(n²) worst',
        spaceComplexity: 'O(log n)',
        properties: 'Fast average case, In-place, Cache-efficient',
        useCases: 'General arrays, performance critical, large data'
      },
    },
    // Top-K problems
    {
      id: 'heap-pattern',
      type: 'leaf',
      position: { x: 650, y: 700 },
      data: {
        label: 'Heap-based Selection',
        description: 'Min/Max heap for top-k elements',
        timeComplexity: 'O(n log k)',
        spaceComplexity: 'O(k)',
        properties: 'Space efficient, Streaming data',
        useCases: 'Top-k elements, streaming data, memory constraints'
      },
    },
    {
      id: 'quickselect-pattern',
      type: 'leaf',
      position: { x: 850, y: 700 },
      data: {
        label: 'QuickSelect',
        description: 'Fast selection of kth element or partitioning',
        timeComplexity: 'O(n) avg, O(n²) worst',
        spaceComplexity: 'O(log n)',
        properties: 'Expected linear, In-place partitioning',
        useCases: 'Median finding, kth element, partitioning'
      },
    },
    // Custom object sorting
    {
      id: 'custom-pattern',
      type: 'leaf',
      position: { x: 1050, y: 700 },
      data: {
        label: 'Custom Comparator Sort',
        description: 'Standard library sort with custom comparison',
        timeComplexity: 'O(n log n)',
        spaceComplexity: 'O(log n)',
        properties: 'Flexible comparison, Multiple criteria',
        useCases: 'Complex objects, multiple sort keys, custom ordering'
      },
    },
    // Specialized constraints
    {
      id: 'counting-pattern',
      type: 'leaf',
      position: { x: 1250, y: 700 },
      data: {
        label: 'Counting/Radix Sort',
        description: 'Integer arrays with known range',
        timeComplexity: 'O(n + k) / O(d(n + k))',
        spaceComplexity: 'O(k) / O(n + k)',
        properties: 'Linear time, Range-dependent, Stable',
        useCases: 'Integer arrays, known range, frequency counting'
      },
    },
    // Interval/Pair sorting
    {
      id: 'interval-pattern',
      type: 'leaf',
      position: { x: 1450, y: 700 },
      data: {
        label: 'Interval/Pair Sorting',
        description: 'Sorting intervals, pairs, or events',
        timeComplexity: 'O(n log n)',
        spaceComplexity: 'O(log n)',
        properties: 'Multiple criteria, Event-based',
        useCases: 'Intervals, meetings, events, coordinate sorting'
      },
    },
    // String/Character sorting
    {
      id: 'string-pattern',
      type: 'leaf',
      position: { x: 1650, y: 700 },
      data: {
        label: 'String/Character Sorting',
        description: 'Specialized string sorting techniques',
        timeComplexity: 'O(n log n) to O(n)',
        spaceComplexity: 'O(1) to O(n)',
        properties: 'Character-based, Frequency analysis',
        useCases: 'Anagrams, character frequency, string manipulation'
      },
    },
    // Problem nodes
    {
      id: 'problems-insertion-pattern',
      type: 'problem',
      position: { x: 50, y: 900 },
      data: {
        problems: [
          { number: 147, title: 'Insertion Sort List', difficulty: 'Medium' },
          { number: 148, title: 'Sort List', difficulty: 'Medium' },
          { number: 21, title: 'Merge Two Sorted Lists', difficulty: 'Easy' },
          { number: 88, title: 'Merge Sorted Array', difficulty: 'Easy' }
        ]
      },
    },
    {
      id: 'problems-merge-pattern',
      type: 'problem',
      position: { x: 250, y: 900 },
      data: {
        problems: [
          { number: 148, title: 'Sort List', difficulty: 'Medium' },
          { number: 23, title: 'Merge k Sorted Lists', difficulty: 'Hard' },
          { number: 88, title: 'Merge Sorted Array', difficulty: 'Easy' },
          { number: 21, title: 'Merge Two Sorted Lists', difficulty: 'Easy' }
        ]
      },
    },
    {
      id: 'problems-quick-pattern',
      type: 'problem',
      position: { x: 450, y: 900 },
      data: {
        problems: [
          { number: 912, title: 'Sort an Array', difficulty: 'Medium' },
          { number: 75, title: 'Sort Colors', difficulty: 'Medium' },
          { number: 324, title: 'Wiggle Sort II', difficulty: 'Medium' },
          { number: 280, title: 'Wiggle Sort', difficulty: 'Medium' }
        ]
      },
    },
    {
      id: 'problems-heap-pattern',
      type: 'problem',
      position: { x: 650, y: 900 },
      data: {
        problems: [
          { number: 215, title: 'Kth Largest Element', difficulty: 'Medium' },
          { number: 347, title: 'Top K Frequent Elements', difficulty: 'Medium' },
          { number: 692, title: 'Top K Frequent Words', difficulty: 'Medium' },
          { number: 973, title: 'K Closest Points to Origin', difficulty: 'Medium' }
        ]
      },
    },
    {
      id: 'problems-quickselect-pattern',
      type: 'problem',
      position: { x: 850, y: 900 },
      data: {
        problems: [
          { number: 215, title: 'Kth Largest Element', difficulty: 'Medium' },
          { number: 324, title: 'Wiggle Sort II', difficulty: 'Medium' },
          { number: 973, title: 'K Closest Points to Origin', difficulty: 'Medium' },
          { number: 347, title: 'Top K Frequent Elements', difficulty: 'Medium' }
        ]
      },
    },
    {
      id: 'problems-custom-pattern',
      type: 'problem',
      position: { x: 1050, y: 900 },
      data: {
        problems: [
          { number: 56, title: 'Merge Intervals', difficulty: 'Medium' },
          { number: 179, title: 'Largest Number', difficulty: 'Medium' },
          { number: 937, title: 'Reorder Data in Log Files', difficulty: 'Easy' },
          { number: 1451, title: 'Rearrange Words in a Sentence', difficulty: 'Medium' }
        ]
      },
    },
    {
      id: 'problems-counting-pattern',
      type: 'problem',
      position: { x: 1250, y: 900 },
      data: {
        problems: [
          { number: 75, title: 'Sort Colors', difficulty: 'Medium' },
          { number: 274, title: 'H-Index', difficulty: 'Medium' },
          { number: 1122, title: 'Relative Sort Array', difficulty: 'Easy' },
          { number: 164, title: 'Maximum Gap', difficulty: 'Hard' }
        ]
      },
    },
    {
      id: 'problems-interval-pattern',
      type: 'problem',
      position: { x: 1450, y: 900 },
      data: {
        problems: [
          { number: 56, title: 'Merge Intervals', difficulty: 'Medium' },
          { number: 57, title: 'Insert Interval', difficulty: 'Medium' },
          { number: 435, title: 'Non-overlapping Intervals', difficulty: 'Medium' },
          { number: 452, title: 'Minimum Number of Arrows', difficulty: 'Medium' }
        ]
      },
    },
    {
      id: 'problems-string-pattern',
      type: 'problem',
      position: { x: 1650, y: 900 },
      data: {
        problems: [
          { number: 242, title: 'Valid Anagram', difficulty: 'Easy' },
          { number: 49, title: 'Group Anagrams', difficulty: 'Medium' },
          { number: 451, title: 'Sort Characters By Frequency', difficulty: 'Medium' },
          { number: 937, title: 'Reorder Data in Log Files', difficulty: 'Easy' }
        ]
      },
    },
  ],
  edges: [
    // Root to first decision
    { id: 'e-root-1', source: 'root', target: 'decision-1' },
    
    // First level decisions
    { id: 'e-1-2', source: 'decision-1', sourceHandle: 'yes', target: 'decision-2', label: 'Yes' },
    { id: 'e-1-3', source: 'decision-1', sourceHandle: 'no', target: 'decision-3', label: 'No' },
    
    // Second level decisions
    { id: 'e-2-4', source: 'decision-2', sourceHandle: 'yes', target: 'decision-4', label: 'Yes' },
    { id: 'e-2-5', source: 'decision-2', sourceHandle: 'no', target: 'decision-5', label: 'No' },
    { id: 'e-3-6', source: 'decision-3', sourceHandle: 'yes', target: 'decision-6', label: 'Yes' },
    { id: 'e-3-7', source: 'decision-3', sourceHandle: 'no', target: 'decision-7', label: 'No' },
    
    // Decisions to techniques
    { id: 'e-4-insertion', source: 'decision-4', sourceHandle: 'yes', target: 'insertion-pattern', label: 'Yes' },
    { id: 'e-4-merge', source: 'decision-4', sourceHandle: 'no', target: 'merge-pattern', label: 'No' },
    { id: 'e-5-merge2', source: 'decision-5', sourceHandle: 'yes', target: 'merge-pattern', label: 'Yes' },
    { id: 'e-5-quick', source: 'decision-5', sourceHandle: 'no', target: 'quick-pattern', label: 'No' },
    { id: 'e-6-heap', source: 'decision-6', sourceHandle: 'yes', target: 'heap-pattern', label: 'Yes' },
    { id: 'e-6-quickselect', source: 'decision-6', sourceHandle: 'no', target: 'quickselect-pattern', label: 'No' },
    { id: 'e-7-custom', source: 'decision-7', sourceHandle: 'yes', target: 'custom-pattern', label: 'Yes (objects)' },
    { id: 'e-7-counting', source: 'decision-7', sourceHandle: 'no', target: 'counting-pattern', label: 'No (integers)' },
    { id: 'e-7-interval', source: 'decision-7', sourceHandle: 'no', target: 'interval-pattern', label: 'No (intervals)' },
    { id: 'e-7-string', source: 'decision-7', sourceHandle: 'no', target: 'string-pattern', label: 'No (strings)' },
    
    // Techniques to problems
    { id: 'e-insertion-problems-pattern', source: 'insertion-pattern', target: 'problems-insertion-pattern' },
    { id: 'e-merge-problems-pattern', source: 'merge-pattern', target: 'problems-merge-pattern' },
    { id: 'e-quick-problems-pattern', source: 'quick-pattern', target: 'problems-quick-pattern' },
    { id: 'e-heap-problems-pattern', source: 'heap-pattern', target: 'problems-heap-pattern' },
    { id: 'e-quickselect-problems-pattern', source: 'quickselect-pattern', target: 'problems-quickselect-pattern' },
    { id: 'e-custom-problems-pattern', source: 'custom-pattern', target: 'problems-custom-pattern' },
    { id: 'e-counting-problems-pattern', source: 'counting-pattern', target: 'problems-counting-pattern' },
    { id: 'e-interval-problems-pattern', source: 'interval-pattern', target: 'problems-interval-pattern' },
    { id: 'e-string-problems-pattern', source: 'string-pattern', target: 'problems-string-pattern' },
  ],
}

function SortingFlow() {
  const reactFlowInstance = useReactFlow()
  const [viewType, setViewType] = useState('algorithm-type') // 'algorithm-type', 'complexity-class', 'problem-pattern'

  const currentData = useMemo(() => {
    switch(viewType) {
      case 'algorithm-type': return algorithmTypeData
      case 'complexity-class': return complexityClassData
      case 'problem-pattern': return problemPatternData
      default: return algorithmTypeData
    }
  }, [viewType])

  const [nodes, setNodes, onNodesChange] = useNodesState(currentData.nodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(currentData.edges)

  React.useEffect(() => {
    setNodes(currentData.nodes)
    setEdges(currentData.edges)
  }, [currentData.nodes, currentData.edges, setNodes, setEdges])

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  const getViewDescription = () => {
    switch(viewType) {
      case 'algorithm-type':
        return 'Follow the decision tree to find the right sorting algorithm based on strategy (divide-and-conquer vs others), memory constraints, stability requirements, and data characteristics.'
      case 'complexity-class':
        return 'Choose sorting algorithms based on time/space complexity requirements and performance guarantees.'
      case 'problem-pattern':
        return 'Select sorting approaches based on the specific problem pattern: array sorting, custom objects, partial sorting, or specialized constraints.'
      default:
        return ''
    }
  }

  const getCurrentViewTitle = () => {
    switch(viewType) {
      case 'algorithm-type': return 'Algorithm Type View - Categorizes by strategy, memory usage, and stability'
      case 'complexity-class': return 'Complexity Class View - Categorizes by time/space complexity'
      case 'problem-pattern': return 'Problem Pattern View - Categorizes by sorting problem type'
      default: return ''
    }
  }

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <div className="p-4 bg-gray-100 border-b">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-800">Sorting Decision Tree</h1>
            <div className="flex items-center gap-2 bg-white rounded-lg p-1 shadow-sm">
              <button
                onClick={() => setViewType('algorithm-type')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewType === 'algorithm-type'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Algorithm Type
              </button>
              <button
                onClick={() => setViewType('complexity-class')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewType === 'complexity-class'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Complexity Class
              </button>
              <button
                onClick={() => setViewType('problem-pattern')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewType === 'problem-pattern'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Problem Pattern
              </button>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => downloadSvg(reactFlowInstance, viewType)}
              className="flex items-center gap-2 px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export SVG
            </button>
            <button
              onClick={() => downloadPng(reactFlowInstance, viewType)}
              className="flex items-center gap-2 px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Export PNG
            </button>
          </div>
        </div>
        <div className="text-sm text-gray-500">
          <strong>How to use:</strong> {getViewDescription()}
          <br />
          <strong>Current View:</strong> {getCurrentViewTitle()}
          <br />
          <strong>Coverage:</strong> 10+ major sorting algorithms including comparison-based, non-comparison, and specialized techniques.
          <br />
          <strong>Controls:</strong> Use toggle buttons to switch views. Zoom with mouse wheel, pan by dragging. Use export buttons to save as SVG or PNG.
          <br />
          <strong>Cross-references:</strong> Heap Sort (see <a href="/tree" className="text-blue-600 hover:underline">Binary Tree page</a>), Iterative implementations (see <a href="/stack" className="text-blue-600 hover:underline">Stack page</a>).
        </div>
      </div>
      <div style={{ width: '100%', height: 'calc(100vh - 140px)' }}>
        <ReactFlow
          key={viewType} // Forces clean remount
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
            <div className="flex flex-col gap-2">
              <button
                onClick={() => downloadSvg(reactFlowInstance, viewType)}
                className="flex items-center gap-2 px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                SVG
              </button>
              <button
                onClick={() => downloadPng(reactFlowInstance, viewType)}
                className="flex items-center gap-2 px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
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

export default function SortingDecisionTree() {
  return (
    <ReactFlowProvider>
      <SortingFlow />
    </ReactFlowProvider>
  )
}