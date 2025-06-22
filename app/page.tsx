"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { OverviewSection } from "@/components/overview-section"
import { PracticeSection } from "@/components/practice-section"
import { PerformanceSection } from "@/components/performance-section"
import { InterviewSection } from "@/components/interview-section"
import { ReviewSection } from "@/components/review-section"

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState("overview")

  const renderSection = () => {
    switch (activeSection) {
      case "overview":
        return <OverviewSection />
      case "practice":
        return <PracticeSection />
      case "performance":
        return <PerformanceSection />
      case "interview":
        return <InterviewSection />
      case "review":
        return <ReviewSection />
      default:
        return <OverviewSection />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar 
        activeSection={activeSection} 
        onSectionChange={setActiveSection} 
      />
      <main className="container mx-auto p-6">
      {renderSection()}
      </main>
    </div>
  )
}
