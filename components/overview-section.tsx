"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Area, AreaChart, CartesianGrid, XAxis, Bar, BarChart, YAxis, LabelList, Cell } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { storageService, type StoredSubmission } from "@/lib/storage"
import { syncService } from "@/lib/sync-service"
import { SyncCard } from "@/components/sync-card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { 
  Activity, 
  CalendarIcon, 
  CheckCircle, 
  Clock, 
  ChevronRight,
  AlertCircle,
  XCircle,
  X,
  Code,
  Timer,
  HardDrive,
  Info,
  Loader2,
  ExternalLink
} from "lucide-react"

// Type definitions
interface Submission {
  id: number;
  lang: string;
  lang_name: string;
  time: string;
  timestamp: number;
  status: number;
  status_display: string;
  runtime: string;
  memory: string;
  code: string;
  url: string;
}

interface Problem {
  // Core identifiers
  questionId: string;
  questionFrontendId: string;
  title: string;
  titleSlug: string;
  
  // Content and metadata
  content: string;
  difficulty: "Easy" | "Medium" | "Hard";
  isPaidOnly: boolean;
  
  // Statistics
  likes: number;
  dislikes: number;
  stats: string;
  
  // Related content
  similarQuestions: string;
  hints: string[];
  categoryTitle: string;
  
  // Tags and topics
  topicTags: Array<{ name: string }>;
  companyTags: any;
  
  // Solutions
  solution: any;
  hasSolution: boolean;
  hasVideoSolution: boolean;
  
  // URLs
  url: string;
  
  // Calculated fields
  submissions: Submission[];
  totalSubmissions: number;
  acceptedSubmissions: number;
  wrongAnswerSubmissions: number;
  firstAcceptedSubmission?: Submission;
  bestAcceptedSubmission?: Submission;
  isSolved: boolean;
}



interface ChartDataPoint {
  date: string;
  Total: number;
  Accepted: number;
  "Wrong Answer": number;
  "Time Limit Exceeded": number;
  "Runtime Error": number;
  "Compile Error": number;
  "Memory Limit Exceeded": number;
  [key: string]: string | number;
}

interface LeetCodeQuestion {
  data: {
    question: {
      questionId: string;
      questionFrontendId: string;
      title: string;
      content: string;
      likes: number;
      dislikes: number;
      stats: string;
      similarQuestions: string;
      categoryTitle: string;
      hints: string[];
      topicTags: Array<{ name: string }>;
      companyTags: any;
      difficulty: string;
      isPaidOnly: boolean;
      solution: any;
      hasSolution: boolean;
      hasVideoSolution: boolean;
      url: string;
    }
  }
}

interface TagData {
  tag: string;
  count: number;
}

// Constants
const CACHE_NAME = 'leetcode-questions-cache'
const CACHE_DURATION = 4 * 60 * 60 * 1000 // 4 hours
const GITHUB_JSON_URL = 'https://raw.githubusercontent.com/noworneverev/leetcode-api/refs/heads/main/data/leetcode_questions.json'
const MAX_TAGS_DISPLAY = 30

// Chart configuration
const chartConfig = {
  Total: {
    label: "Total Submissions",
    color: "var(--chart-1)",
  },
  Accepted: {
    label: "Accepted",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

// Utility functions
const getLanguageName = (lang: string): string => {
  const languageMap: Record<string, string> = {
    python3: "Python3",
    java: "Java",
    cpp: "C++",
    javascript: "JavaScript",
    typescript: "TypeScript",
  }
  return languageMap[lang] || lang
}

const getStatusCode = (statusDisplay: string): number => {
  const statusMap: Record<string, number> = {
    "Accepted": 10,
    "Wrong Answer": 11,
    "Time Limit Exceeded": 14,
    "Runtime Error": 15,
    "Compile Error": 20,
  }
  return statusMap[statusDisplay] || 13
}

const formatTimestamp = (timestamp: number): string => {
  return new Date(timestamp * 1000).toLocaleString()
}

const formatDate = (timestamp: number): string => {
  return new Date(timestamp * 1000).toISOString().split('T')[0]
}

// Data loading functions
const loadStorageData = (): StoredSubmission[] => {
  try {
    return storageService.getSubmissions()
  } catch (error) {
    // Error loading storage data
    return []
  }
}

const loadLeetCodeQuestionsData = async (): Promise<Map<string, LeetCodeQuestion['data']['question']>> => {
  try {
    // Check cache first
    if (typeof window !== 'undefined' && 'caches' in window) {
      const cache = await caches.open(CACHE_NAME)
      const cachedResponse = await cache.match(GITHUB_JSON_URL)
      
      if (cachedResponse) {
        const cacheDate = cachedResponse.headers.get('cache-date')
        if (cacheDate) {
          const cacheTime = new Date(cacheDate).getTime()
          const now = Date.now()
          
          if (now - cacheTime < CACHE_DURATION) {
            const questionsData: LeetCodeQuestion[] = await cachedResponse.json()
            const questionMap = new Map<string, LeetCodeQuestion['data']['question']>()
            
            questionsData.forEach((item: LeetCodeQuestion) => {
              const question = item.data.question
              questionMap.set(question.title, question)
            })
            
            return questionMap
          } else {
            await cache.delete(GITHUB_JSON_URL)
          }
        }
      }
    }
    
    // Fetch fresh data
    const response = await fetch(GITHUB_JSON_URL)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const questionsData: LeetCodeQuestion[] = await response.json()
    
    // Cache the response
    if (typeof window !== 'undefined' && 'caches' in window) {
      try {
        const cache = await caches.open(CACHE_NAME)
        const responseToCache = new Response(JSON.stringify(questionsData), {
          headers: {
            'Content-Type': 'application/json',
            'cache-date': new Date().toISOString()
          }
        })
        await cache.put(GITHUB_JSON_URL, responseToCache)
      } catch (cacheError) {
        // Failed to cache data
      }
    }
    
    const questionMap = new Map<string, LeetCodeQuestion['data']['question']>()
    questionsData.forEach((item: LeetCodeQuestion) => {
      const question = item.data.question
      questionMap.set(question.title, question)
    })
    
    return questionMap
  } catch (error) {
    // Error loading LeetCode questions data
    return new Map()
  }
}

// Data processing functions
const buildProblemMap = (
  submissions: StoredSubmission[], 
  questionsData: Map<string, LeetCodeQuestion['data']['question']>
): { problems: Problem[], skippedCount: number } => {
  const problemMap = new Map<string, Problem>()
  let skippedProblems = 0
  
  submissions.forEach((storedSub: StoredSubmission) => {
    const title = storedSub.title
    const titleSlug = storedSub.title_slug
    
    const questionData = questionsData.get(title)
    if (!questionData) {
      skippedProblems++
      return
    }
    
    const submission: Submission = {
      id: storedSub.id,
      lang: storedSub.lang,
      lang_name: storedSub.lang_name,
      time: storedSub.time,
      timestamp: storedSub.timestamp,
      status: storedSub.status,
      status_display: storedSub.status_display,
      runtime: storedSub.runtime || "N/A",
      memory: storedSub.memory || "N/A",
      code: storedSub.code,
      url: storedSub.url
    }
    
    if (!problemMap.has(titleSlug)) {
      const problem: Problem = {
        questionId: questionData.questionId,
        questionFrontendId: questionData.questionFrontendId,
        title: questionData.title,
        titleSlug: titleSlug,
        content: questionData.content,
        difficulty: questionData.difficulty as "Easy" | "Medium" | "Hard",
        isPaidOnly: questionData.isPaidOnly,
        likes: questionData.likes,
        dislikes: questionData.dislikes,
        stats: questionData.stats,
        similarQuestions: questionData.similarQuestions,
        hints: questionData.hints || [],
        categoryTitle: questionData.categoryTitle || "",
        topicTags: questionData.topicTags || [],
        companyTags: questionData.companyTags,
        solution: questionData.solution,
        hasSolution: questionData.hasSolution,
        hasVideoSolution: questionData.hasVideoSolution,
        url: questionData.url,
        submissions: [],
        totalSubmissions: 0,
        acceptedSubmissions: 0,
        wrongAnswerSubmissions: 0,
        isSolved: false
      }
      problemMap.set(titleSlug, problem)
    }
    
    const problem = problemMap.get(titleSlug)!
    problem.submissions.push(submission)
  })
  
  // Calculate statistics for each problem
  const problems = Array.from(problemMap.values())
  problems.forEach(problem => {
    problem.totalSubmissions = problem.submissions.length
    
    const acceptedSubs = problem.submissions.filter(sub => sub.status_display === "Accepted")
    const wrongAnswerSubs = problem.submissions.filter(sub => sub.status_display === "Wrong Answer")
    
    problem.acceptedSubmissions = acceptedSubs.length
    problem.wrongAnswerSubmissions = wrongAnswerSubs.length
    problem.isSolved = acceptedSubs.length > 0
    
    if (acceptedSubs.length > 0) {
      problem.firstAcceptedSubmission = acceptedSubs.reduce((earliest, current) => 
        current.timestamp < earliest.timestamp ? current : earliest
      )
      
      const subsWithRuntime = acceptedSubs.filter(sub => 
        sub.runtime !== "N/A" && sub.runtime.includes("ms")
      )
      if (subsWithRuntime.length > 0) {
        problem.bestAcceptedSubmission = subsWithRuntime.reduce((fastest, current) => {
          const currentMs = parseInt(current.runtime.replace(/[^\d]/g, ''))
          const fastestMs = parseInt(fastest.runtime.replace(/[^\d]/g, ''))
          return currentMs < fastestMs ? current : fastest
        })
      }
    }
    
    problem.submissions.sort((a, b) => b.timestamp - a.timestamp)
  })
  
  return { problems, skippedCount: skippedProblems }
}

const parseCSVDataForChart = (problems: Problem[]): ChartDataPoint[] => {
  const dateMap = new Map<string, { total: number; accepted: number }>()
  
  problems.forEach(problem => {
    problem.submissions.forEach(submission => {
      const date = formatDate(submission.timestamp)
      
      if (!dateMap.has(date)) {
        dateMap.set(date, { total: 0, accepted: 0 })
      }
      
      const dayData = dateMap.get(date)!
      dayData.total += 1
      
      if (submission.status_display === "Accepted") {
        dayData.accepted += 1
      }
    })
  })

  const chartData: ChartDataPoint[] = []
  const sortedDates = Array.from(dateMap.keys()).sort()
  
  sortedDates.forEach(date => {
    const dayData = dateMap.get(date)!
    const dataPoint: ChartDataPoint = {
      date: date,
      Total: dayData.total,
      Accepted: dayData.accepted,
      "Wrong Answer": 0,
      "Time Limit Exceeded": 0,
      "Runtime Error": 0,
      "Compile Error": 0,
      "Memory Limit Exceeded": 0,
    }
    chartData.push(dataPoint)
  })

  return chartData
}

const convertToRecentActivity = (problems: Problem[], targetDate: string): Problem[] => {
  const dayProblems = problems.filter(problem => {
    return problem.submissions.some(submission => {
      const submissionDate = formatDate(submission.timestamp)
      return submissionDate === targetDate
    })
  })
  
  return dayProblems.map(problem => ({
    ...problem,
    submissions: problem.submissions.filter(submission => {
      const submissionDate = formatDate(submission.timestamp)
      return submissionDate === targetDate
    })
  }))
}

const analyzeTagsData = (problems: Problem[], type: 'accepted' | 'wrong'): TagData[] => {
  const tagCounts = new Map<string, Set<string>>()
  
  const filteredProblems = type === 'accepted' 
    ? problems.filter(problem => problem.isSolved)
    : problems.filter(problem => problem.wrongAnswerSubmissions > 0)
  
  filteredProblems.forEach(problem => {
    const tags = problem.topicTags.map(tag => tag.name)
    tags.forEach(tag => {
      if (tag) {
        if (!tagCounts.has(tag)) {
          tagCounts.set(tag, new Set())
        }
        tagCounts.get(tag)!.add(problem.title)
      }
    })
  })
  
  return Array.from(tagCounts.entries())
    .map(([tag, items]) => ({ tag, count: items.size }))
    .sort((a, b) => b.count - a.count)
    .slice(0, MAX_TAGS_DISPLAY)
}

const calculateStats = (problems: Problem[]) => {
  const solvedProblems = problems.filter(problem => problem.isSolved)
  
  const difficultyCount = { easy: 0, medium: 0, hard: 0 }
  solvedProblems.forEach(problem => {
    const difficulty = problem.difficulty.toLowerCase() as keyof typeof difficultyCount
    if (difficulty in difficultyCount) {
      difficultyCount[difficulty]++
    }
  })
  
  const totalSubmissions = problems.reduce((sum, problem) => sum + problem.totalSubmissions, 0)
  const totalAcceptedSubmissions = problems.reduce((sum, problem) => sum + problem.acceptedSubmissions, 0)
  const acceptanceRate = totalSubmissions > 0 ? (totalAcceptedSubmissions / totalSubmissions) * 100 : 0
  
  const acceptedSubmissionDates = new Set<string>()
  problems.forEach(problem => {
    if (problem.firstAcceptedSubmission) {
      const date = formatDate(problem.firstAcceptedSubmission.timestamp)
      acceptedSubmissionDates.add(date)
    }
  })
  const streak = Math.min(acceptedSubmissionDates.size, 30)
  
  const estimatedHours = solvedProblems.reduce((total, problem) => {
    const baseTime = problem.difficulty === "Easy" ? 0.5 : 
                     problem.difficulty === "Medium" ? 1.5 : 3
    const attempts = problem.totalSubmissions
    return total + (baseTime * Math.min(attempts, 5))
  }, 0)
  
  const timeSpent = `${Math.floor(estimatedHours)}h ${Math.floor((estimatedHours % 1) * 60)}m`
  
  return {
    totalSolved: difficultyCount,
    totalProblems: difficultyCount.easy + difficultyCount.medium + difficultyCount.hard,
    acceptanceRate: Math.round(acceptanceRate * 10) / 10,
    streak,
    timeSpent,
    totalSubmissions,
    totalAcceptedSubmissions
  }
}

// Helper components
const getStatusIcon = (status: number) => {
  switch (status) {
    case 10:
      return <CheckCircle className="h-4 w-4 text-green-600" />
    case 11:
      return <XCircle className="h-4 w-4 text-red-600" />
    case 14:
      return <Clock className="h-4 w-4 text-yellow-600" />
    default:
      return <AlertCircle className="h-4 w-4 text-gray-600" />
  }
}

const getStatusBadge = (statusDisplay: string) => {
  const statusColor = statusDisplay === "Accepted" 
    ? "bg-green-100 text-green-800" 
    : statusDisplay === "Wrong Answer"
    ? "bg-red-100 text-red-800"
    : statusDisplay === "Time Limit Exceeded"
    ? "bg-yellow-100 text-yellow-800"
    : "bg-gray-100 text-gray-800"

  return (
    <Badge variant="outline" className={statusColor}>
      {statusDisplay}
    </Badge>
  )
}

// Chart components
function TagsAnalysisChart({ 
  problems, 
  selectedTag, 
  onTagClick 
}: { 
  problems: Problem[]
  selectedTag: string | null
  onTagClick: (tag: string, tagType: 'accepted' | 'wrong') => void
}) {
  const [activeTab, setActiveTab] = React.useState("tags")
  
  const tagsData = React.useMemo(() => 
    analyzeTagsData(problems, 'accepted'), 
    [problems]
  )
  
  const wrongAnswersData = React.useMemo(() => 
    analyzeTagsData(problems, 'wrong'), 
    [problems]
  )
  
  const chartConfig = {
    count: {
      label: "Count",
      color: "var(--chart-2)",
    },
    label: {
      color: "var(--background)",
    },
  } satisfies ChartConfig
  
  return (
        <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-semibold leading-none tracking-tight">Tags Analysis</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Problem tags breakdown and patterns
        </CardDescription>
          </CardHeader>
          <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="tags">Solved Tags</TabsTrigger>
            <TabsTrigger value="wrong">Wrong Answers</TabsTrigger>
          </TabsList>
          
          <TabsContent value="tags" className="mt-4">
            <div className="h-[260px] overflow-y-auto">
              <ChartContainer config={chartConfig} className="h-auto w-full" style={{ height: `${tagsData.length * 35}px` }}>
                <BarChart
                  accessibilityLayer
                  data={tagsData}
                  layout="vertical"
                  margin={{ left: 0, right: 40 }}
                  onClick={(data: any) => {
                    if (data && data.activePayload && data.activePayload[0]) {
                      onTagClick(data.activePayload[0].payload.tag, 'accepted')
                    }
                  }}
                >
                <XAxis type="number" dataKey="count" hide />
                <YAxis
                  dataKey="tag"
                  type="category"
                  tickLine={false}
                  tickMargin={5}
                  axisLine={false}
                  width={150}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Bar
                  dataKey="count"
                  radius={5}
                  className="cursor-pointer"
                >
                  {tagsData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={selectedTag === entry.tag ? "hsl(var(--chart-1))" : "hsl(var(--chart-2))"} 
                    />
                  ))}
                  <LabelList
                    dataKey="count"
                    position="right"
                    offset={8}
                    className="fill-foreground"
                    fontSize={12}
                  />
                </Bar>
              </BarChart>
            </ChartContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="wrong" className="mt-4">
            <div className="h-[260px] overflow-y-auto">
              <ChartContainer config={chartConfig} className="h-auto w-full" style={{ height: `${wrongAnswersData.length * 35}px` }}>
                <BarChart
                  accessibilityLayer
                  data={wrongAnswersData}
                  layout="vertical"
                  margin={{ left: 20, right: 40 }}
                  onClick={(data: any) => {
                    if (data && data.activePayload && data.activePayload[0]) {
                      onTagClick(data.activePayload[0].payload.tag, 'wrong')
                    }
                  }}
                >
                <XAxis type="number" dataKey="count" hide />
                <YAxis
                  dataKey="tag"
                  type="category"
                  tickLine={false}
                  tickMargin={5}
                  axisLine={false}
                  width={150}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Bar
                  dataKey="count"
                  radius={5}
                  className="cursor-pointer"
                >
                  {wrongAnswersData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={selectedTag === entry.tag ? "hsl(var(--chart-1))" : "hsl(var(--chart-2))"} 
                    />
                  ))}
                  <LabelList
                    dataKey="count"
                    position="right"
                    offset={8}
                    className="fill-foreground"
                    fontSize={12}
                  />
                </Bar>
              </BarChart>
            </ChartContainer>
            </div>
          </TabsContent>
        </Tabs>
          </CardContent>
        </Card>
  )
}

function SubmissionStatusChart({ 
  problems, 
  selectedChartDate, 
  onDateClick 
}: { 
  problems: Problem[]
  selectedChartDate: string | null
  onDateClick: (date: string) => void
}) {
  const chartData = parseCSVDataForChart(problems)



  return (
        <Card>
      <CardHeader>
        <CardTitle>Submission Activity Trends</CardTitle>
        <CardDescription>
          Daily total submissions vs accepted submissions over time (click on chart to filter by date)
        </CardDescription>
          </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[400px] w-full"
        >
          <AreaChart 
            data={chartData}
            onClick={(data: any) => {
              if (data && data.activePayload && data.activePayload[0]) {
                const clickedDate = data.activePayload[0].payload.date;
                if (clickedDate) {
                  onDateClick(clickedDate);
                }
              }
            }}
          >
              <defs>
                <linearGradient id="fillTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(var(--chart-1))"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(var(--chart-1))"
                    stopOpacity={0.1}
                  />
                </linearGradient>
                <linearGradient id="fillAccepted" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(var(--chart-2))"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(var(--chart-2))"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                }}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    }}
                    indicator="dot"
                  />
                }
              />
              <Area
                dataKey="Total"
                type="natural"
                fill="url(#fillTotal)"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
              />
              <Area
                dataKey="Accepted"
                type="natural"
                fill="url(#fillAccepted)"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
              />
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ChartContainer>
          </CardContent>
        </Card>
  )
}

// Loading skeleton component
function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-32 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Main component
export function OverviewSection() {
  const [submissions, setSubmissions] = useState<StoredSubmission[]>([])
  const [questionsData, setQuestionsData] = useState<Map<string, LeetCodeQuestion['data']['question']>>(new Map())
  const [problems, setProblems] = useState<Problem[]>([])
  const [skippedCount, setSkippedCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date("2024-12-16"))
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [selectedYear, setSelectedYear] = useState("all")
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [selectedTagType, setSelectedTagType] = useState<'accepted' | 'wrong' | null>(null)
  const [selectedChartDate, setSelectedChartDate] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [isAutoSyncing, setIsAutoSyncing] = useState(false)
  const itemsPerPage = 20

  // Load data on component mount
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    
    // Initialize demo data if needed
    const demoDataLoaded = await storageService.initializeDemoDataIfNeeded()
    
    // Check if auto-sync is needed (only for real data, not demo data)
    let autoSyncCompleted = false
    if (!storageService.isDemoData() && storageService.isAuthConfigured()) {
      const syncHistory = storageService.getSyncHistory()
      const now = Date.now()
      const twentyFourHoursAgo = now - (24 * 60 * 60 * 1000) // 24 hours in milliseconds
      
      // Auto-sync if last sync was more than 24 hours ago or never synced
      if (syncHistory.lastSyncTimestamp === 0 || syncHistory.lastSyncTimestamp < twentyFourHoursAgo) {
        setIsAutoSyncing(true)
        
        try {
          const result = await syncService.syncSubmissions((progress) => {
            // Silent progress - we could show a minimal indicator if needed
          })
          autoSyncCompleted = result.success
        } catch (error) {
          // Auto-sync failed
        } finally {
          setIsAutoSyncing(false)
        }
      }
    }
    
    const [submissionsData, leetcodeData] = await Promise.all([
      Promise.resolve(storageService.getSubmissions()),
      loadLeetCodeQuestionsData()
    ])
    setSubmissions(submissionsData)
    setQuestionsData(leetcodeData)
    
    const { problems: problemObjects, skippedCount } = buildProblemMap(submissionsData, leetcodeData)
    setProblems(problemObjects)
    setSkippedCount(skippedCount)
    
    setLoading(false)
    
    // If auto-sync completed, data has been reloaded
    if (autoSyncCompleted) {
      // Auto-sync completed successfully
    }
  }

  // Callback for when sync completes
  const handleSyncComplete = () => {
    loadData() // Reload data after sync
  }

  // Get available years from submissions
  const availableYears = React.useMemo(() => {
    const years = new Set<string>()
    problems.forEach(problem => {
      problem.submissions.forEach(submission => {
        const year = new Date(submission.timestamp * 1000).getFullYear().toString()
        years.add(year)
      })
    })
    return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a))
  }, [problems])

  // Filter problems based on selected year
  const filteredProblems = React.useMemo(() => {
    if (problems.length === 0) return []
    
    return problems.map(problem => {
      let filteredSubmissions = problem.submissions
      
      if (selectedYear !== "all") {
        if (selectedYear === "90d") {
          const now = new Date()
          const startDate = new Date(now)
          startDate.setDate(startDate.getDate() - 90)
          
          filteredSubmissions = filteredSubmissions.filter(submission => {
            const submissionDate = new Date(submission.timestamp * 1000)
            return submissionDate >= startDate
          })
        } else {
          filteredSubmissions = filteredSubmissions.filter(submission => {
            const year = new Date(submission.timestamp * 1000).getFullYear().toString()
            return year === selectedYear
          })
        }
      }
      
      const acceptedSubs = filteredSubmissions.filter(sub => sub.status_display === "Accepted")
      const wrongAnswerSubs = filteredSubmissions.filter(sub => sub.status_display === "Wrong Answer")
      
      return {
        ...problem,
        submissions: filteredSubmissions,
        totalSubmissions: filteredSubmissions.length,
        acceptedSubmissions: acceptedSubs.length,
        wrongAnswerSubmissions: wrongAnswerSubs.length,
        isSolved: acceptedSubs.length > 0,
        firstAcceptedSubmission: acceptedSubs.length > 0 ? 
          acceptedSubs.reduce((earliest, current) => 
            current.timestamp < earliest.timestamp ? current : earliest
          ) : undefined
      }
    }).filter(problem => problem.totalSubmissions > 0)
  }, [problems, selectedYear])

  // Calculate statistics from filtered data
  const stats = React.useMemo(() => {
    if (filteredProblems.length === 0) {
      return {
        totalSolved: { easy: 0, medium: 0, hard: 0 },
        totalProblems: 0,
        acceptanceRate: 0,
        streak: 0,
        timeSpent: "0h 0m",
        totalSubmissions: 0,
        totalAcceptedSubmissions: 0
      }
    }
    return calculateStats(filteredProblems)
  }, [filteredProblems])

  const handleSubmissionClick = (submission: Submission) => {
    setSelectedSubmission(submission)
    setIsSheetOpen(true)
  }

  // Add click handlers and filtering functions
  const handleTagClick = (tag: string, tagType: 'accepted' | 'wrong' = 'accepted') => {
    setSelectedTag(tag)
    setSelectedTagType(tagType)
    setSelectedChartDate(null) // Clear date filter when tag is selected
    setCurrentPage(1) // Reset to first page
  }

  const handleChartDateClick = (date: string) => {
    setSelectedChartDate(date)
    setSelectedTag(null) // Clear tag filter when date is selected
    // Update the selectedDate for the calendar as well
    setSelectedDate(new Date(date))
    setCurrentPage(1) // Reset to first page
  }

  const handleClearAllFilters = () => {
    setSelectedTag(null)
    setSelectedTagType(null)
    setSelectedChartDate(null)
    setCurrentPage(1) // Reset to first page
  }

  // Get current submissions based on active filter
  const getCurrentSubmissions = () => {
    if (selectedTag && selectedTagType) {
      // Filter by tag across all dates based on the tag type
      if (selectedTagType === 'accepted') {
        // Show solved problems with this tag
        return filteredProblems.filter(problem => 
          problem.isSolved && problem.topicTags.some(tag => tag.name === selectedTag)
        )
      } else {
        // Show problems with wrong answer submissions that have this tag
        return filteredProblems.filter(problem => 
          problem.wrongAnswerSubmissions > 0 && problem.topicTags.some(tag => tag.name === selectedTag)
        )
      }
    } else if (selectedChartDate) {
      // Filter by specific date
      return convertToRecentActivity(filteredProblems, selectedChartDate)
    } else {
      // Default: show all problems when no filters are active
      return filteredProblems
    }
  }

  // Get current activity title
  const getActivityTitle = () => {
    if (selectedTag) {
      return `Activity - ${selectedTag}`
    } else if (selectedChartDate) {
      const date = new Date(selectedChartDate)
      return `Activity - ${date.toLocaleDateString()}`
    } else {
      return `All Activity`
    }
  }

  // Get current activity description
  const getActivityDescription = () => {
    if (selectedTag && selectedTagType) {
      if (selectedTagType === 'accepted') {
        // Count solved problems with the tag
        const count = filteredProblems.filter(problem => 
          problem.isSolved && problem.topicTags.some(tag => tag.name === selectedTag)
        ).length
        return `${count} solved problems with ${selectedTag} tag`
      } else {
        // Count problems with wrong answer submissions that have this tag
        const count = filteredProblems.filter(problem => 
          problem.wrongAnswerSubmissions > 0 && problem.topicTags.some(tag => tag.name === selectedTag)
        ).length
        return `${count} problems with wrong answers having ${selectedTag} tag`
      }
    } else if (selectedChartDate) {
      return `Submissions for ${new Date(selectedChartDate).toLocaleDateString()}`
    } else {
      return `All submissions across all problems and dates`
    }
  }

  // Get current submissions based on active filter
  const currentSubmissions = getCurrentSubmissions()

  // Pagination logic
  const totalItems = currentSubmissions.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentPageItems = currentSubmissions.slice(startIndex, endIndex)

  // Reset to first page if current page is beyond total pages
  React.useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1)
    }
  }, [currentPage, totalPages])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  if (loading) {
    return <LoadingSkeleton />
  }

  return (
    <div className="space-y-6">
      {/* Alert for skipped problems */}
      {skippedCount > 0 && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Data Processing Information</AlertTitle>
          <AlertDescription>
            {skippedCount} submissions were skipped because their problems were not found in the LeetCode questions database. 
            This may affect the accuracy of tags analysis and difficulty distribution.
          </AlertDescription>
        </Alert>
      )}

      {/* Auto-sync indicator */}
      {isAutoSyncing && (
        <Alert variant="default">
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertTitle>Auto-sync in Progress</AlertTitle>
          <AlertDescription>
            Automatically syncing submissions since your last sync was more than 24 hours ago. This may take a few moments.
          </AlertDescription>
        </Alert>
      )}

      {/* Sync Card */}
      <SyncCard onSyncComplete={handleSyncComplete} />

      {/* Main dashboard layout */}
      <div className="grid gap-6 lg:grid-cols-[40%_60%]">
        <div className="space-y-6">
          {/* Total Solved Card with Filters */}
        <Card>
            <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
              <div className="grid flex-1 gap-1">
                <CardTitle className="text-2xl font-semibold leading-none tracking-tight">{stats.totalProblems}</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">Total Problems Solved</CardDescription>
              </div>
              <div className="flex gap-2">
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger
                    className="w-[120px] rounded-lg"
                    aria-label="Select year"
                  >
                    <SelectValue placeholder="All Time" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="all" className="rounded-lg">
                      All Time
                    </SelectItem>
                    <SelectItem value="90d" className="rounded-lg">
                      Last 90 days
                    </SelectItem>
                    {availableYears.map((year) => (
                      <SelectItem key={year} value={year} className="rounded-lg">
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
          </CardHeader>
            <CardContent className="pt-6">
              <div className="flex gap-2">
                <Badge variant="secondary" className="text-green-600">
                  Easy: {stats.totalSolved.easy}
                </Badge>
                <Badge variant="secondary" className="text-yellow-600">
                  Medium: {stats.totalSolved.medium}
                </Badge>
                <Badge variant="secondary" className="text-red-600">
                  Hard: {stats.totalSolved.hard}
                </Badge>
              </div>
          </CardContent>
        </Card>

          {/* Tags Analysis Card */}
          <TagsAnalysisChart 
            problems={filteredProblems} 
            selectedTag={selectedTag}
            onTagClick={handleTagClick}
          />
      </div>

        {/* Submission Activity Trends Chart */}
        <SubmissionStatusChart 
          problems={filteredProblems}
          selectedChartDate={selectedChartDate}
          onDateClick={handleChartDateClick}
        />
      </div>

      {/* Recent Activity and Calendar */}
      <div className="grid gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
                {getActivityTitle()}
            </CardTitle>
              {(selectedTag || selectedChartDate) && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleClearAllFilters}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Clear All
                </Button>
              )}
            </div>
            <CardDescription>
              {getActivityDescription()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {currentPageItems.length > 0 ? (
                currentPageItems.map((problem: Problem, problemIndex: number) => (
                <Collapsible key={`${problem.questionId}-${problem.titleSlug}-${problemIndex}`} className="border rounded-lg">
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50">
                  <div className="flex items-center gap-3">
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{problem.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {problem.submissions.length} submission{problem.submissions.length !== 1 ? 's' : ''}
                          </p>
                    </div>
                  </div>
                  <Badge
                        variant="secondary" 
                    className={
                      problem.difficulty === "Easy"
                        ? "text-green-600"
                        : problem.difficulty === "Medium"
                          ? "text-yellow-600"
                          : "text-red-600"
                    }
                  >
                    {problem.difficulty}
                  </Badge>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="px-3 pb-3 space-y-2">
                      {problem.submissions
                        .sort((a: Submission, b: Submission) => b.timestamp - a.timestamp)
                        .map((submission: Submission, index: number) => (
                          <div
                            key={`${problem.questionId}-${submission.id}-${index}`}
                            className="flex items-center justify-between p-2 ml-6 border rounded cursor-pointer hover:bg-muted/30"
                            onClick={() => handleSubmissionClick(submission)}
                          >
                            <div className="flex items-center gap-3">
                              {getStatusIcon(submission.status)}
                              <div>
                                <div className="flex items-center gap-2">
                                  {getStatusBadge(submission.status_display)}
                                  <span className="text-sm text-muted-foreground">
                                    {submission.lang_name}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                  {submission.runtime !== "N/A" && (
                                    <>
                                      <Timer className="h-3 w-3" />
                                      {submission.runtime}
                                    </>
                                  )}
                                  {submission.memory !== "N/A" && (
                                    <>
                                      <HardDrive className="h-3 w-3" />
                                      {submission.memory}
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            <Code className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}
            </div>
                  </CollapsibleContent>
                </Collapsible>
              ))
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                No submissions found for this {selectedTag ? 'tag' : 'date'}
              </div>
            )}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} problems
                </div>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    
                    {/* Page numbers */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNumber;
                      if (totalPages <= 5) {
                        pageNumber = i + 1;
                      } else if (currentPage <= 3) {
                        pageNumber = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNumber = totalPages - 4 + i;
                      } else {
                        pageNumber = currentPage - 2 + i;
                      }
                      
                      return (
                        <PaginationItem key={pageNumber}>
                          <PaginationLink
                            onClick={() => handlePageChange(pageNumber)}
                            isActive={currentPage === pageNumber}
                            className="cursor-pointer"
                          >
                            {pageNumber}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    
                    {/* Ellipsis and last page if needed */}
                    {totalPages > 5 && currentPage < totalPages - 2 && (
                      <>
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationLink
                            onClick={() => handlePageChange(totalPages)}
                            className="cursor-pointer"
                          >
                            {totalPages}
                          </PaginationLink>
                        </PaginationItem>
                      </>
                    )}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </div>
          )}
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Submission Detail Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-4xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Submission Details
            </SheetTitle>
            <SheetDescription>
              View code and submission information
            </SheetDescription>
          </SheetHeader>
          
          {selectedSubmission && (
            <div className="mt-6 space-y-6">
              {/* Basic Submission Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Status</h4>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusIcon(selectedSubmission.status)}
                    {getStatusBadge(selectedSubmission.status_display)}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Language</h4>
                  <p className="mt-1">{selectedSubmission.lang_name}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Runtime</h4>
                  <p className="mt-1">{selectedSubmission.runtime}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Memory</h4>
                  <p className="mt-1">{selectedSubmission.memory}</p>
                </div>
              </div>

              {/* Timestamp */}
              <div>
                <h4 className="font-medium text-sm text-muted-foreground">Submitted</h4>
                <p className="mt-1">{formatTimestamp(selectedSubmission.timestamp)}</p>
              </div>

              {/* Code */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm text-muted-foreground mb-2">Code</h4>
                <div className="bg-muted rounded-lg p-4 overflow-auto max-h-96">
                  <pre className="text-sm">
                    <code>{selectedSubmission.code}</code>
                  </pre>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`https://leetcode.com${selectedSubmission.url}`, '_blank')}
                  className="flex items-center gap-2 w-full"
                >
                  <ExternalLink className="h-4 w-4" />
                  View on LeetCode
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
