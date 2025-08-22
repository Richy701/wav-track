"use client"

import { TrendingUp, TrendingDown, Clock, Target, Settings } from "lucide-react"
import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChartConfig, ChartContainer } from "@/components/ui/chart"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { Label as UILabel } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { useWeeklyGoal } from "@/hooks/useWeeklyGoal"

interface WeeklyOverviewChartProps {
  weeklyStats: { date: string; focusTime: number }[]
  currentStreak: number
  todaysFocusTime: number
}

export function WeeklyOverviewChart({ 
  weeklyStats, 
  currentStreak, 
  todaysFocusTime
}: WeeklyOverviewChartProps) {
  const { weeklyGoal, setWeeklyGoal } = useWeeklyGoal()
  
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false)
  const [newGoalValue, setNewGoalValue] = useState(weeklyGoal.toString())

  // Update newGoalValue when weeklyGoal changes
  useEffect(() => {
    setNewGoalValue(weeklyGoal.toString())
  }, [weeklyGoal])
  // Calculate total weekly focus time in hours
  const totalWeeklyHours = weeklyStats.reduce((total, day) => total + day.focusTime, 0) / 3600
  const weeklyProgress = Math.min((totalWeeklyHours / weeklyGoal) * 100, 100)
  
  // Calculate trend vs last week (mock calculation for now)
  const lastWeekTotal = Math.max(0, totalWeeklyHours - (Math.random() * 2 - 1) * totalWeeklyHours * 0.2)
  const weeklyTrend = lastWeekTotal > 0 
    ? ((totalWeeklyHours - lastWeekTotal) / lastWeekTotal) * 100 
    : 0

  const chartData = [
    { 
      category: "focus", 
      hours: totalWeeklyHours, 
      fill: "var(--color-focus)" 
    },
  ]

  const chartConfig = {
    hours: {
      label: "Focus Hours",
    },
    focus: {
      label: "Focus Time",
      color: "hsl(262 83% 58%)", // violet-500
    },
  } satisfies ChartConfig

  const handleGoalSave = () => {
    const goal = parseFloat(newGoalValue)
    if (!isNaN(goal) && goal > 0 && goal <= 100) {
      setWeeklyGoal(goal)
      setIsGoalDialogOpen(false)
    }
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle className="flex items-center gap-2 justify-between w-full">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-violet-600" />
            Weekly Focus Overview
          </div>
          <Dialog open={isGoalDialogOpen} onOpenChange={setIsGoalDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Settings className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Set Weekly Goal</DialogTitle>
                <DialogDescription>
                  Set your weekly focus time goal in hours.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <UILabel htmlFor="goal" className="text-right">
                    Goal (hours)
                  </UILabel>
                  <Input
                    id="goal"
                    type="number"
                    min="1"
                    max="100"
                    step="0.5"
                    value={newGoalValue}
                    onChange={(e) => setNewGoalValue(e.target.value)}
                    className="col-span-3"
                    placeholder="Enter weekly goal"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsGoalDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleGoalSave}>Save Goal</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardTitle>
        <CardDescription>
          Your focus journey this week
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <RadialBarChart
            data={chartData}
            startAngle={90}
            endAngle={90 + (weeklyProgress / 100) * 270}
            innerRadius={80}
            outerRadius={110}
          >
            <PolarGrid
              gridType="circle"
              radialLines={false}
              stroke="none"
              className="first:fill-muted last:fill-background"
              polarRadius={[86, 74]}
            />
            <RadialBar 
              dataKey="hours" 
              background 
              cornerRadius={10}
              fill="var(--color-focus)"
            />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-4xl font-bold"
                        >
                          {totalWeeklyHours.toFixed(1)}h
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground text-sm"
                        >
                          This Week
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 40}
                          className="fill-muted-foreground text-xs"
                        >
                          {weeklyProgress.toFixed(0)}% of goal
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </PolarRadiusAxis>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2 leading-none font-medium">
            {weeklyTrend >= 0 ? (
              <>
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-green-600">
                  +{Math.abs(weeklyTrend).toFixed(1)}% vs last week
                </span>
              </>
            ) : (
              <>
                <TrendingDown className="h-4 w-4 text-red-500" />
                <span className="text-red-500">
                  {weeklyTrend.toFixed(1)}% vs last week
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Target className="h-4 w-4" />
            <span>{weeklyGoal}h goal</span>
          </div>
        </div>
        
        {/* Additional stats row */}
        <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
          <span>
            🔥 {currentStreak} day streak
          </span>
          <span>
            Today: {(todaysFocusTime / 3600).toFixed(1)}h
          </span>
        </div>
        
        <div className="text-muted-foreground leading-none text-center">
          {weeklyProgress >= 100 
            ? "🎉 Weekly goal achieved!" 
            : `${(weeklyGoal - totalWeeklyHours).toFixed(1)}h remaining to reach weekly goal`
          }
        </div>
      </CardFooter>
    </Card>
  )
}