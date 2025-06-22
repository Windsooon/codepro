"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Building2, Clock, Target, Timer, Trophy, TrendingUp, Calendar, CheckCircle, AlertCircle } from "lucide-react"

const companyData = [
  {
    name: "Google",
    totalProblems: 150,
    solved: 89,
    recentlyAsked: 45,
    difficulty: { easy: 25, medium: 45, hard: 19 },
    focusAreas: ["Dynamic Programming", "Trees", "Graphs"],
  },
  {
    name: "Amazon",
    totalProblems: 120,
    solved: 67,
    recentlyAsked: 38,
    difficulty: { easy: 20, medium: 35, hard: 12 },
    focusAreas: ["Arrays", "Strings", "Trees"],
  },
  {
    name: "Microsoft",
    totalProblems: 100,
    solved: 45,
    recentlyAsked: 28,
    difficulty: { easy: 15, medium: 25, hard: 5 },
    focusAreas: ["Dynamic Programming", "Backtracking", "Graphs"],
  },
  {
    name: "Facebook",
    totalProblems: 110,
    solved: 52,
    recentlyAsked: 32,
    difficulty: { easy: 18, medium: 28, hard: 6 },
    focusAreas: ["Arrays", "Strings", "Binary Search"],
  },
]

const mockInterviews = [
  {
    id: 1,
    date: "2024-01-10",
    company: "Google",
    problems: ["Two Sum", "Valid Parentheses", "Merge Intervals"],
    timeSpent: "45 min",
    performance: "Good",
    feedback: "Strong problem-solving approach, could improve on edge cases",
  },
  {
    id: 2,
    date: "2024-01-08",
    company: "Amazon",
    problems: ["LRU Cache", "Word Ladder"],
    timeSpent: "50 min",
    performance: "Excellent",
    feedback: "Great optimization and clean code",
  },
]

const timedPractice = [
  {
    date: "2024-01-15",
    problems: 3,
    timeLimit: "60 min",
    timeUsed: "52 min",
    solved: 2,
    performance: "Good",
  },
  {
    date: "2024-01-12",
    problems: 2,
    timeLimit: "45 min",
    timeUsed: "38 min",
    solved: 2,
    performance: "Excellent",
  },
  {
    date: "2024-01-10",
    problems: 4,
    timeLimit: "90 min",
    timeUsed: "85 min",
    solved: 3,
    performance: "Good",
  },
]

export function InterviewSection() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="companies" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="companies">Company Prep</TabsTrigger>
          <TabsTrigger value="mock">Mock Interviews</TabsTrigger>
          <TabsTrigger value="timed">Timed Practice</TabsTrigger>
        </TabsList>

        <TabsContent value="companies" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {companyData.map((company) => (
              <Card key={company.name}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      <CardTitle>{company.name}</CardTitle>
                    </div>
                    <Badge variant="outline">
                      {company.solved}/{company.totalProblems}
                    </Badge>
                  </div>
                  <CardDescription>{company.recentlyAsked} problems asked recently</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress</span>
                      <span>{Math.round((company.solved / company.totalProblems) * 100)}%</span>
                    </div>
                    <Progress value={(company.solved / company.totalProblems) * 100} />
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">Difficulty Breakdown</h4>
                    <div className="flex gap-2">
                      <Badge variant="secondary" className="text-green-600">
                        Easy: {company.difficulty.easy}
                      </Badge>
                      <Badge variant="secondary" className="text-yellow-600">
                        Medium: {company.difficulty.medium}
                      </Badge>
                      <Badge variant="secondary" className="text-red-600">
                        Hard: {company.difficulty.hard}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">Focus Areas</h4>
                    <div className="flex flex-wrap gap-1">
                      {company.focusAreas.map((area) => (
                        <Badge key={area} variant="outline" className="text-xs">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      View Problems
                    </Button>
                    <Button size="sm" className="flex-1">
                      Start Practice
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Interview Preparation Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">Ready for Google</p>
                    <p className="text-sm text-green-700">89/150 problems completed</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                  <AlertCircle className="h-8 w-8 text-yellow-600" />
                  <div>
                    <p className="font-medium text-yellow-800">Focus on Microsoft</p>
                    <p className="text-sm text-yellow-700">45/100 problems completed</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-800">Improving Trend</p>
                    <p className="text-sm text-blue-700">+15% this month</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mock" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Mock Interview History</h3>
              <p className="text-sm text-muted-foreground">Track your mock interview performance</p>
            </div>
            <Button>
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Mock Interview
            </Button>
          </div>

          <div className="space-y-4">
            {mockInterviews.map((interview) => (
              <Card key={interview.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{interview.company} Mock Interview</CardTitle>
                      <CardDescription>{interview.date}</CardDescription>
                    </div>
                    <Badge
                      variant={
                        interview.performance === "Excellent"
                          ? "default"
                          : interview.performance === "Good"
                            ? "secondary"
                            : "destructive"
                      }
                      className={
                        interview.performance === "Excellent"
                          ? "bg-green-100 text-green-800"
                          : interview.performance === "Good"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }
                    >
                      {interview.performance}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="font-medium mb-2">Problems Attempted</h4>
                      <div className="space-y-1">
                        {interview.problems.map((problem, index) => (
                          <div key={index} className="text-sm text-muted-foreground">
                            • {problem}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Performance Metrics</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Time: {interview.timeSpent}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Trophy className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Performance: {interview.performance}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-md">
                    <h4 className="font-medium text-blue-800 mb-1">Feedback</h4>
                    <p className="text-sm text-blue-700">{interview.feedback}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="timed" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Timed Practice Sessions</h3>
              <p className="text-sm text-muted-foreground">Practice under time pressure to simulate real interviews</p>
            </div>
            <Button>
              <Timer className="h-4 w-4 mr-2" />
              Start Timed Session
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Average Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">58 min</div>
                <p className="text-xs text-muted-foreground">Per session</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">78%</div>
                <p className="text-xs text-muted-foreground">Problems solved</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Time Efficiency</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">92%</div>
                <p className="text-xs text-muted-foreground">Time utilization</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Timed Sessions</CardTitle>
              <CardDescription>Your performance in recent timed practice sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {timedPractice.map((session, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium">{session.date}</p>
                        <p className="text-sm text-muted-foreground">
                          {session.problems} problems • {session.timeLimit} limit
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium">
                          {session.solved}/{session.problems} solved
                        </p>
                        <p className="text-sm text-muted-foreground">{session.timeUsed} used</p>
                      </div>
                      <Badge
                        variant={
                          session.performance === "Excellent"
                            ? "default"
                            : session.performance === "Good"
                              ? "secondary"
                              : "destructive"
                        }
                        className={
                          session.performance === "Excellent"
                            ? "bg-green-100 text-green-800"
                            : session.performance === "Good"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }
                      >
                        {session.performance}
                      </Badge>
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
