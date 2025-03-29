import React from 'react'
import { motion } from 'framer-motion'
import { Target, Edit, Trash, ChevronLeft, ChevronRight, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Goal } from '@/types/goal'

interface PaginatedGoalsProps {
  goals: Goal[]
  onEditGoal: (goal: Goal) => void
  onDeleteGoal: (goal: Goal) => void
  onCompleteGoal: (goal: Goal) => void
  className?: string
}

const ITEMS_PER_PAGE = 6

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      when: "beforeChildren"
    }
  }
}

const cardVariants = {
  hidden: { 
    opacity: 0,
    y: 20
  },
  visible: { 
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
      mass: 1
    }
  }
}

export const PaginatedGoals: React.FC<PaginatedGoalsProps> = ({
  goals,
  onEditGoal,
  onDeleteGoal,
  onCompleteGoal,
  className
}) => {
  const [currentPage, setCurrentPage] = React.useState(1)
  const totalPages = Math.ceil(goals.length / ITEMS_PER_PAGE)

  const paginatedGoals = goals.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1)
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Target className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
          <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">Recent Goals</h3>
        </div>
      </div>

      {goals.length > 0 ? (
        <>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 w-full"
          >
            {paginatedGoals.map((goal) => (
              <motion.div
                key={goal.id}
                variants={cardVariants}
                className={cn(
                  "rounded-xl bg-white dark:bg-zinc-900/5",
                  "border border-zinc-200 dark:border-zinc-800",
                  "p-5 sm:p-6",
                  "hover:border-zinc-300 dark:hover:border-zinc-700",
                  "transition-all duration-200",
                  "w-full min-h-[200px]",
                  "flex flex-col justify-between"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {goal.title}
                  </span>
                  <div className="flex items-center space-x-2">
                    {goal.status !== 'completed' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "h-7 w-7 rounded-lg",
                          "bg-gradient-to-br from-emerald-100/80 to-emerald-50/50 dark:from-emerald-500/10 dark:to-emerald-900/5",
                          "border border-emerald-200/80 dark:border-emerald-500/20",
                          "text-emerald-600 dark:text-emerald-400",
                          "hover:bg-emerald-100/90 dark:hover:bg-emerald-500/20",
                          "hover:border-emerald-300/80 dark:hover:border-emerald-500/30",
                          "transition-all duration-200",
                          "shadow-sm hover:shadow-md dark:shadow-none"
                        )}
                        onClick={() => onCompleteGoal(goal)}
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-7 w-7 rounded-lg",
                        "bg-gradient-to-br from-orange-100/80 to-orange-50/50 dark:from-orange-500/10 dark:to-orange-900/5",
                        "border border-orange-200/80 dark:border-orange-500/20",
                        "text-orange-600 dark:text-orange-400",
                        "hover:bg-orange-100/90 dark:hover:bg-orange-500/20",
                        "hover:border-orange-300/80 dark:hover:border-orange-500/30",
                        "transition-all duration-200",
                        "shadow-sm hover:shadow-md dark:shadow-none"
                      )}
                      onClick={() => onEditGoal(goal)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-7 w-7 rounded-lg",
                        "bg-gradient-to-br from-rose-100/80 to-rose-50/50 dark:from-rose-500/10 dark:to-rose-900/5",
                        "border border-rose-200/80 dark:border-rose-500/20",
                        "text-rose-600 dark:text-rose-400",
                        "hover:bg-rose-100/90 dark:hover:bg-rose-500/20",
                        "hover:border-rose-300/80 dark:hover:border-rose-500/30",
                        "transition-all duration-200",
                        "shadow-sm hover:shadow-md dark:shadow-none"
                      )}
                      onClick={() => onDeleteGoal(goal)}
                    >
                      <Trash className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                  {goal.description || 'No description'}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-500 dark:text-neutral-500">
                    {new Date(goal.created_at).toLocaleDateString()}
                  </span>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs",
                      goal.status === 'completed'
                        ? "border-emerald-500/20 text-emerald-600 dark:border-emerald-500/30 dark:text-emerald-400"
                        : "border-orange-500/20 text-orange-600 dark:border-orange-500/30 dark:text-orange-400"
                    )}
                  >
                    {goal.status === 'completed' ? 'Completed' : 'In Progress'}
                  </Badge>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-neutral-500 dark:text-neutral-400">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className={cn(
                  "rounded-lg",
                  "bg-gradient-to-br from-zinc-100/80 to-zinc-50/50 dark:from-zinc-800/80 dark:to-zinc-900/50",
                  "border border-zinc-200/80 dark:border-zinc-700/80",
                  "text-zinc-700 dark:text-zinc-300",
                  "hover:bg-zinc-100/90 dark:hover:bg-zinc-800/90",
                  "hover:border-zinc-300/80 dark:hover:border-zinc-600/80",
                  "transition-all duration-200",
                  "shadow-sm hover:shadow-md dark:shadow-none",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "disabled:hover:bg-zinc-100/80 dark:disabled:hover:bg-zinc-800/80",
                  "disabled:hover:border-zinc-200/80 dark:disabled:hover:border-zinc-700/80"
                )}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={cn(
                  "rounded-lg",
                  "bg-gradient-to-br from-zinc-100/80 to-zinc-50/50 dark:from-zinc-800/80 dark:to-zinc-900/50",
                  "border border-zinc-200/80 dark:border-zinc-700/80",
                  "text-zinc-700 dark:text-zinc-300",
                  "hover:bg-zinc-100/90 dark:hover:bg-zinc-800/90",
                  "hover:border-zinc-300/80 dark:hover:border-zinc-600/80",
                  "transition-all duration-200",
                  "shadow-sm hover:shadow-md dark:shadow-none",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "disabled:hover:bg-zinc-100/80 dark:disabled:hover:bg-zinc-800/80",
                  "disabled:hover:border-zinc-200/80 dark:disabled:hover:border-zinc-700/80"
                )}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
          <Target className="w-8 h-8 text-neutral-400/50" />
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">No recent goals yet</p>
          <p className="text-xs text-neutral-500 dark:text-neutral-500">Add a goal to get started</p>
        </div>
      )}
    </div>
  )
} 