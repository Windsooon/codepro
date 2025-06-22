"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookOpen, Plus, Search, Target, ExternalLink, Clock, CheckCircle, XCircle } from "lucide-react"

const recommendedProblems = [
  {
    id: 1,
    title: "Combination Sum II",
    difficulty: "Medium",
    topic: "Backtracking",
    reason: "Low acceptance rate in Backtracking (55%)",
    estimatedTime: "25-30 min",
    companies: ["Google", "Facebook"],
  },
  {
    id: 2,
    title: "Word Search II",
    difficulty: "Hard",
    topic: "Backtracking",
    reason: "Next logical step after recent Backtracking problems",
    estimatedTime: "35-45 min",
    companies: ["Microsoft", "Amazon"],
  },
  {
    id: 3,
    title: "Union Find Basics",
    difficulty: "Medium",
    topic: "Union Find",
    reason: "Fundamental gap - only 45% acceptance rate",
    estimatedTime: "20-25 min",
    companies: ["Google", "Apple"],
  },
]

const problemLists = [
  {
    name: "Blind 75",
    total: 75,
    completed: 45,
    description: "Essential problems for coding interviews",
  },
  {
    name: "LeetCode 150",
    total: 150,
    completed: 89,
    description: "Top interview questions",
  },
  {
    name: "Dynamic Programming",
    total: 50,
    completed: 18,
    description: "Master DP patterns",
  },
  {
    name: "System Design Prep",
    total: 30,
    completed: 12,
    description: "Problems for system design interviews",
  },
]

const allProblems = [
  {
    id: 1,
    title: "Two Sum",
    difficulty: "Easy",
    topic: "Arrays",
    status: "Solved",
    attempts: 1,
    lastAttempt: "2024-01-15",
    companies: ["Google", "Amazon", "Facebook"],
  },
  {
    id: 2,
    title: "Add Two Numbers",
    difficulty: "Medium",
    topic: "Linked List",
    status: "Solved",
    attempts: 2,
    lastAttempt: "2024-01-15",
    companies: ["Microsoft", "Apple"],
  },
  {
    id: 3,
    title: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    topic: "Strings",
    status: "Solved",
    attempts: 3,
    lastAttempt: "2024-01-14",
    companies: ["Amazon", "Google"],
  },
  {
    id: 4,
    title: "Median of Two Sorted Arrays",
    difficulty: "Hard",
    topic: "Binary Search",
    status: "Attempted",
    attempts: 5,
    lastAttempt: "2024-01-13",
    companies: ["Google", "Facebook"],
  },
]

export function PracticeSection() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="recommendations" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="lists">Problem Lists</TabsTrigger>
          <TabsTrigger value="problems">All Problems</TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Personalized Recommendations
              </CardTitle>
              <CardDescription>
                Problems tailored to improve your weak areas and continue your learning path
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendedProblems.map((problem) => (
                  <div key={problem.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h4 className="font-medium">{problem.title}</h4>
                        <div className="flex items-center gap-2">
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
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {problem.estimatedTime}
                          </div>
                        </div>
                      </div>
                      <Button size="sm">
                        Solve Now
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </Button>
                    </div>

                    <div className="bg-blue-50 p-3 rounded-md">
                      <p className="text-sm text-blue-800">
                        <strong>Why recommended:</strong> {problem.reason}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Asked by:</span>
                      {problem.companies.map((company) => (
                        <Badge key={company} variant="outline" className="text-xs">
                          {company}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lists" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Problem Lists</h3>
              <p className="text-sm text-muted-foreground">Track your progress on curated problem sets</p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Custom List
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {problemLists.map((list) => (
              <Card key={list.name}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{list.name}</CardTitle>
                      <CardDescription>{list.description}</CardDescription>
                    </div>
                    <Badge variant="outline">
                      {list.completed}/{list.total}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress</span>
                      <span>{Math.round((list.completed / list.total) * 100)}%</span>
                    </div>
                    <Progress value={(list.completed / list.total) * 100} />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      View List
                    </Button>
                    <Button size="sm" className="flex-1">
                      Continue
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="problems" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                All Problems
              </CardTitle>
              <CardDescription>Search and filter through all your attempted problems</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filters */}
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search problems..." className="pl-8" />
                  </div>
                </div>
                <Select>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Topic" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Topics</SelectItem>
                    <SelectItem value="arrays">Arrays</SelectItem>
                    <SelectItem value="strings">Strings</SelectItem>
                    <SelectItem value="trees">Trees</SelectItem>
                    <SelectItem value="graphs">Graphs</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="solved">Solved</SelectItem>
                    <SelectItem value="attempted">Attempted</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Problems Table */}
              <div className="space-y-2">
                {allProblems.map((problem) => (
                  <div
                    key={problem.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-4">
                      {problem.status === "Solved" ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                      <div>
                        <h4 className="font-medium">{problem.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
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
                          <span className="text-sm text-muted-foreground">
                            {problem.attempts} attempt{problem.attempts !== 1 ? "s" : ""}
                          </span>
                          <span className="text-sm text-muted-foreground">Last: {problem.lastAttempt}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {problem.companies.slice(0, 2).map((company) => (
                          <Badge key={company} variant="outline" className="text-xs">
                            {company}
                          </Badge>
                        ))}
                        {problem.companies.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{problem.companies.length - 2}
                          </Badge>
                        )}
                      </div>
                      <Button variant="outline" size="sm">
                        View Solution
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
