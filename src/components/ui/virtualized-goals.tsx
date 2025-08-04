// Virtualized goals list for better performance with large lists
import React, { memo, useMemo } from 'react'
import { FixedSizeList as List } from 'react-window'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Check, Edit3, Trash2, Clock, X, Save } from 'lucide-react'
import { Goal, getPriorityColor } from '@/utils/sessionUtils'

interface VirtualizedGoalsProps {
  goals: Goal[]
  editingGoal: any
  onToggleGoal: (id: string) => void
  onEditGoal: (goal: Goal) => void
  onDeleteGoal: (id: string) => void
  onSaveEdit: () => void
  onCancelEdit: () => void
  setEditingGoal: (goal: any) => void
  setGoalToDelete: (id: string) => void
  isLoading: boolean
  height?: number
}

const GoalItem = memo(function GoalItem({ 
  index, 
  style, 
  data 
}: { 
  index: number
  style: React.CSSProperties
  data: any 
}) {
  const { 
    goals, 
    editingGoal, 
    onToggleGoal, 
    onEditGoal, 
    onSaveEdit, 
    onCancelEdit,
    setEditingGoal,
    setGoalToDelete,
    isLoading 
  } = data
  
  const goal = goals[index]
  
  if (!goal) return null
  
  return (
    <div style={style} className="px-2 py-1">
      <Card
        className={`p-4 transition-all duration-200 hover:shadow-md ${
          goal.completed ? 'opacity-75' : ''
        } ${
          goal.priority === 'high' 
            ? 'border-red-200 dark:border-red-800 bg-red-50/30 dark:bg-red-950/20'
            : goal.priority === 'medium'
            ? 'border-yellow-200 dark:border-yellow-800 bg-yellow-50/30 dark:bg-yellow-950/20'
            : 'border-green-200 dark:border-green-800 bg-green-50/30 dark:bg-green-950/20'
        }`}
      >
        <div className="flex items-start space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleGoal(goal.id)}
            className={`p-0 w-6 h-6 rounded-full border-2 transition-all duration-200 ${
              goal.completed
                ? 'bg-emerald-500 border-emerald-500 hover:bg-emerald-600'
                : 'border-muted-foreground hover:border-emerald-500'
            }`}
            disabled={isLoading}
          >
            {goal.completed && <Check className="w-3 h-3 text-white" />}
          </Button>
          
          <div className="flex-1 min-w-0">
            {editingGoal?.id === goal.id ? (
              <div className="space-y-2">
                <Input
                  value={editingGoal.text}
                  onChange={(e) => setEditingGoal({ ...editingGoal, text: e.target.value })}
                  className="text-sm"
                />
                <div className="flex items-center space-x-2">
                  <Select 
                    value={editingGoal.priority} 
                    onValueChange={(value) => setEditingGoal({ ...editingGoal, priority: value as Goal['priority'] })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select 
                    value={editingGoal.estimatedMinutes.toString()} 
                    onValueChange={(value) => setEditingGoal({ ...editingGoal, estimatedMinutes: parseInt(value) })}
                  >
                    <SelectTrigger className="h-8 text-xs w-16">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15m</SelectItem>
                      <SelectItem value="25">25m</SelectItem>
                      <SelectItem value="30">30m</SelectItem>
                      <SelectItem value="45">45m</SelectItem>
                      <SelectItem value="60">60m</SelectItem>
                      <SelectItem value="90">90m</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="sm" onClick={onSaveEdit} className="h-8 px-2">
                    <Save className="w-3 h-3" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={onCancelEdit} className="h-8 px-2">
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <p className={`text-sm font-medium ${
                  goal.completed 
                    ? 'text-muted-foreground line-through' 
                    : 'text-foreground'
                }`}>
                  {goal.text}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={getPriorityColor(goal.priority) as any}
                      className="text-xs capitalize"
                    >
                      {goal.priority}
                    </Badge>
                    <Badge variant="outline" className="text-xs flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {goal.estimatedMinutes}m
                    </Badge>
                    {goal.completedAt && (
                      <Badge variant="outline" className="text-xs text-emerald-600">
                        Completed
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditGoal(goal)}
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-blue-600"
                      disabled={isLoading}
                    >
                      <Edit3 className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setGoalToDelete(goal.id)}
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                      disabled={isLoading}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
})

const VirtualizedGoals = memo(function VirtualizedGoals({
  goals,
  editingGoal,
  onToggleGoal,
  onEditGoal,
  onDeleteGoal,
  onSaveEdit,
  onCancelEdit,
  setEditingGoal,
  setGoalToDelete,
  isLoading,
  height = 320
}: VirtualizedGoalsProps) {
  const itemData = useMemo(() => ({
    goals,
    editingGoal,
    onToggleGoal,
    onEditGoal,
    onSaveEdit,
    onCancelEdit,
    setEditingGoal,
    setGoalToDelete,
    isLoading
  }), [goals, editingGoal, onToggleGoal, onEditGoal, onSaveEdit, onCancelEdit, setEditingGoal, setGoalToDelete, isLoading])
  
  // Only virtualize if we have more than 10 goals
  if (goals.length <= 10) {
    return (
      <div className="space-y-3" style={{ maxHeight: height, overflowY: 'auto' }}>
        {goals.map((goal, index) => (
          <GoalItem
            key={goal.id}
            index={index}
            style={{}}
            data={itemData}
          />
        ))}
      </div>
    )
  }
  
  return (
    <List
      height={height}
      itemCount={goals.length}
      itemSize={120} // Approximate height of each goal item
      itemData={itemData}
      width="100%"
    >
      {GoalItem}
    </List>
  )
})

export default VirtualizedGoals