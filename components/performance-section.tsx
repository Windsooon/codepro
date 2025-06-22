"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { TrendingUp, AlertTriangle, CheckCircle } from "lucide-react"

const topicData = [
  { topic: "Arrays", solved: 45, total: 60, acceptanceRate: 85, avgAttempts: 1.8 },
  { topic: "Strings", solved: 32, total: 45, acceptanceRate: 78, avgAttempts: 2.1 },
  { topic: "Dynamic Programming", solved: 18, total: 35, acceptanceRate: 62, avgAttempts: 3.2 },
  { topic: "Trees", solved: 28, total: 40, acceptanceRate: 75, avgAttempts: 2.3 },
  { topic: "Graphs", solved: 15, total: 30, acceptanceRate: 58, avgAttempts: 3.8 },
  { topic: "Backtracking", solved: 12, total: 25, acceptanceRate: 55, avgAttempts: 4.1 },
  { topic: "Binary Search", solved: 22, total: 28, acceptanceRate: 82, avgAttempts: 1.9 },
  { topic: "Two Pointers", solved: 25, total: 30, acceptanceRate: 88, avgAttempts: 1.6 },
]

const techniqueData = [
  { technique: "Sliding Window", solved: 18, acceptanceRate: 85, avgAttempts: 1.8 },
  { technique: "DFS", solved: 25, acceptanceRate: 72, avgAttempts: 2.4 },
  { technique: "BFS", solved: 20, acceptanceRate: 78, avgAttempts: 2.1 },
  { technique: "Union Find", solved: 8, acceptanceRate: 45, avgAttempts: 4.2 },
  { technique: "Trie", solved: 12, acceptanceRate: 68, avgAttempts: 2.8 },
  { technique: "Heap", solved: 15, acceptanceRate: 74, avgAttempts: 2.5 },
]

const radarData = [
  { subject: "Arrays", A: 85, fullMark: 100 },
  { subject: "Strings", A: 78, fullMark: 100 },
  { subject: "DP", A: 62, fullMark: 100 },
  { subject: "Trees", A: 75, fullMark: 100 },
  { subject: "Graphs", A: 58, fullMark: 100 },
  { subject: "Backtrack", A: 55, fullMark: 100 },
]

const attemptDistribution = [
  { name: "1 Attempt", value: 45, color: "#22c55e" },
  { name: "2-3 Attempts", value: 35, color: "#eab308" },
  { name: "4-5 Attempts", value: 15, color: "#f97316" },
  { name: "gt5 Attempts", value: 5, color: "#ef4444" },
]

export function PerformanceSection() {
  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Strongest Topic</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-green-600">Two Pointers</div>
            <div className="text-sm text-muted-foreground">88% acceptance rate</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Needs Improvement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-red-600">Backtracking</div>
            <div className="text-sm text-muted-foreground">55% acceptance rate</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Attempts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">2.4</div>
            <div className="text-sm text-muted-foreground">Per problem</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Efficiency Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <div className="text-lg font-bold text-green-600">Improving</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="topics" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="topics">Topic Analysis</TabsTrigger>
          <TabsTrigger value="techniques">Techniques</TabsTrigger>
          <TabsTrigger value="proficiency">Proficiency Map</TabsTrigger>
          <TabsTrigger value="patterns">Submission Patterns</TabsTrigger>
        </TabsList>

        <TabsContent value="topics" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Problems Solved by Topic</CardTitle>
                <CardDescription>Your progress across different algorithm topics</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topicData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="topic" type="category" width={100} />
                    <Tooltip />
                    <Bar dataKey="solved" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Acceptance Rate by Topic</CardTitle>
                <CardDescription>Identify your strengths and weaknesses</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topicData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis dataKey="topic" type="category" width={100} />
                    <Tooltip formatter={(value) => [`${value}%`, "Acceptance Rate"]} />
                    <Bar dataKey="acceptanceRate" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Detailed Topic Performance</CardTitle>
              <CardDescription>Comprehensive breakdown of your performance by topic</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topicData.map((topic) => (
                  <div key={topic.topic} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium">{topic.topic}</h4>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-sm text-muted-foreground">
                            {topic.solved}/{topic.total} solved
                          </span>
                          <Progress value={(topic.solved / topic.total) * 100} className="w-24" />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-medium">{topic.acceptanceRate}%</div>
                        <div className="text-sm text-muted-foreground">acceptance</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{topic.avgAttempts}</div>
                        <div className="text-sm text-muted-foreground">avg attempts</div>
                      </div>
                      <Badge
                        variant={
                          topic.acceptanceRate >= 80
                            ? "default"
                            : topic.acceptanceRate >= 60
                              ? "secondary"
                              : "destructive"
                        }
                        className={
                          topic.acceptanceRate >= 80
                            ? "bg-green-100 text-green-800"
                            : topic.acceptanceRate >= 60
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }
                      >
                        {topic.acceptanceRate >= 80 ? "Strong" : topic.acceptanceRate >= 60 ? "Good" : "Needs Work"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="techniques" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Technique Performance Analysis</CardTitle>
              <CardDescription>Your proficiency with common problem-solving techniques</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {techniqueData.map((technique) => (
                  <div key={technique.technique} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div>
                        <h4 className="font-medium">{technique.technique}</h4>
                        <p className="text-sm text-muted-foreground">{technique.solved} problems solved</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-medium">{technique.acceptanceRate}%</div>
                        <div className="text-sm text-muted-foreground">acceptance</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{technique.avgAttempts}</div>
                        <div className="text-sm text-muted-foreground">avg attempts</div>
                      </div>
                      {technique.acceptanceRate < 60 && <AlertTriangle className="h-4 w-4 text-red-500" />}
                      {technique.acceptanceRate >= 80 && <CheckCircle className="h-4 w-4 text-green-500" />}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="proficiency" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Proficiency Radar Chart</CardTitle>
              <CardDescription>Visual representation of your strengths across topics</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar name="Proficiency" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Attempts to Acceptance Distribution</CardTitle>
                <CardDescription>How often you solve problems in different attempt ranges</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={attemptDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {attemptDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Insights</CardTitle>
                <CardDescription>Key observations from your submission patterns</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-800">Strong First Attempt Rate</p>
                    <p className="text-sm text-green-700">45% of problems solved on first try</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-800">Room for Improvement</p>
                    <p className="text-sm text-yellow-700">5% of problems require gt5 attempts</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-800">Debugging Skills</p>
                    <p className="text-sm text-blue-700">Most problems solved within 2-3 attempts</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
