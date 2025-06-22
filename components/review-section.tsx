"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BookOpen,
  Clock,
  AlertTriangle,
  RefreshCw,
  TrendingDown,
  Calendar,
  ExternalLink,
  CheckCircle,
} from "lucide-react"

const reviewProblems = [
  {
    id: 1,
    title: "Combination Sum",
    difficulty: "Medium",
    topic: "Backtracking",
    lastSolved: "2023-11-15",
    daysSince: 62,
    attempts: 4,
    reason: "High attempt count - review approach",
  },
  {
    id: 2,
    title: "Word Break II",
    difficulty: "Hard",
    topic: "Dynamic Programming",
    lastSolved: "2023-10-20",
    daysSince: 88,
    attempts: 6,
    reason: "Solved long ago - refresh memory",
  },
  {
    id: 3,
    title: "Serialize Binary Tree",
    difficulty: "Hard",
    topic: "Trees",
    lastSolved: "2023-12-01",
    daysSince: 46,
    attempts: 5,
    reason: "Related to current weak area",
  },
]

const mistakePatterns = [
  {
    category: "Edge Cases",
    count: 23,
    examples: ["Empty array handling", "Single element arrays", "Null pointer checks"],
    improvement: "Add systematic edge case checklist",
  },
  {
    category: "Off-by-One Errors",
    count: 18,
    examples: ["Array bounds", "Loop conditions", "String indexing"],
    improvement: "Double-check boundary conditions",
  },
  {
    category: "Time Complexity",
    count: 12,
    examples: ["Nested loops", "Recursive calls", "Hash map operations"],
    improvement: "Analyze complexity before coding",
  },
  {
    category: "Memory Management",
    count: 8,
    examples: ["Stack overflow", "Memory leaks", "Excessive space usage"],
    improvement: "Consider space-time tradeoffs",
  },
]

const studyPlan = [
  {
    week: "Week 1",
    focus: "Backtracking Review",
    problems: ["Combination Sum", "Permutations", "N-Queens"],
    status: "current",
  },
  {
    week: "Week 2",
    focus: "Dynamic Programming",
    problems: ["Word Break", "Coin Change", "Longest Subsequence"],
    status: "upcoming",
  },
  {
    week: "Week 3",
    focus: "Graph Algorithms",
    problems: ["Course Schedule", "Word Ladder", "Clone Graph"],
    status: "upcoming",
  },
]

export function ReviewSection() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="review" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="review">Problem Review</TabsTrigger>
          <TabsTrigger value="mistakes">Mistake Analysis</TabsTrigger>
          <TabsTrigger value="study">Study Plan</TabsTrigger>
        </TabsList>

        <TabsContent value="review" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Problems Due for Review
              </CardTitle>
              <CardDescription>Problems that need revisiting based on time elapsed and difficulty</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reviewProblems.map((problem) => (
                  <div key={problem.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{problem.title}</h4>
                          <Badge
                            variant={
                              problem.difficulty === "Easy"
                                ? "secondary"
                                : problem.difficulty === "Medium"
                                  ? "default"
                                  : "destructive"
                            }
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
                          <Badge variant="outline">{problem.topic}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Last solved: {problem.lastSolved}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {problem.daysSince} days ago
                          </div>
                          <div>{problem.attempts} attempts originally</div>
                        </div>
                      </div>
                      <Button size="sm">
                        Review Now
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </Button>
                    </div>

                    <div className="bg-orange-50 p-3 rounded-md">
                      <p className="text-sm text-orange-800">
                        <strong>Review reason:</strong> {problem.reason}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Problems to Review</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">Due this week</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avg Review Interval</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">45 days</div>
                <p className="text-xs text-muted-foreground">Between reviews</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Review Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">82%</div>
                <p className="text-xs text-muted-foreground">Solved on re-attempt</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="mistakes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Common Mistake Patterns
              </CardTitle>
              <CardDescription>Analysis of your most frequent coding mistakes to help improve</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mistakePatterns.map((pattern) => (
                  <div key={pattern.category} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{pattern.category}</h4>
                      <Badge variant="destructive">{pattern.count} occurrences</Badge>
                    </div>

                    <div>
                      <h5 className="text-sm font-medium mb-2">Common Examples:</h5>
                      <div className="flex flex-wrap gap-2">
                        {pattern.examples.map((example, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {example}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="bg-blue-50 p-3 rounded-md">
                      <p className="text-sm text-blue-800">
                        <strong>Improvement tip:</strong> {pattern.improvement}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mistake Trend Analysis</CardTitle>
              <CardDescription>Track how your mistake patterns are changing over time</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">Improving Areas</p>
                    <p className="text-sm text-green-700">Edge cases: -40% this month</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                  <TrendingDown className="h-8 w-8 text-red-600" />
                  <div>
                    <p className="font-medium text-red-800">Needs Attention</p>
                    <p className="text-sm text-red-700">Time complexity: +15% this month</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="study" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Personalized Study Plan
              </CardTitle>
              <CardDescription>A structured plan to address your weak areas and reinforce learning</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {studyPlan.map((week) => (
                  <div
                    key={week.week}
                    className={`border rounded-lg p-4 ${week.status === "current" ? "border-blue-500 bg-blue-50" : ""}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{week.week}</h4>
                        {week.status === "current" && <Badge className="bg-blue-100 text-blue-800">Current</Badge>}
                      </div>
                      <Badge variant="outline">{week.focus}</Badge>
                    </div>

                    <div className="space-y-2">
                      <h5 className="text-sm font-medium">Recommended Problems:</h5>
                      <div className="flex flex-wrap gap-2">
                        {week.problems.map((problem, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {problem}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {week.status === "current" && (
                      <div className="mt-3 pt-3 border-t">
                        <Button size="sm">Start This Week's Practice</Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Study Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm">Current Week Progress</span>
                  <span className="text-sm font-medium">2/3 problems</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Study Streak</span>
                  <span className="text-sm font-medium">8 days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Topics Mastered</span>
                  <span className="text-sm font-medium">3/8</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Next Milestones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Complete Backtracking review</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  <span className="text-sm">Master Dynamic Programming</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  <span className="text-sm">Improve Graph algorithms</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
