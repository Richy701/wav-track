import * as React from "react";
import { Clock, Trash2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { TabsPill } from "./tabs-pill";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";

interface FilterBarProps {
  status?: string;
  onStatusChange?: (status: string) => void;
  sortOrder?: "newest" | "oldest" | "name" | "status";
  onSortChange?: (sort: "newest" | "oldest" | "name" | "status") => void;
  onDelete?: () => void;
  className?: string;
}

const projectStatuses = ["All", "Ideas", "In Progress", "Mixing", "Mastering", "Completed"];

const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "name", label: "By Name" },
  { value: "status", label: "By Status" },
] as const;

export function FilterBar({
  status,
  onStatusChange,
  sortOrder = "newest",
  onSortChange,
  onDelete,
  className,
}: FilterBarProps) {
  const currentSort = sortOptions.find((option) => option.value === sortOrder) || sortOptions[0];

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3",
        "p-1 rounded-lg bg-muted/30",
        className
      )}
    >
      {/* Status Filter */}
      <TabsPill
        options={projectStatuses}
        value={status}
        onValueChange={onStatusChange}
        className="flex-1 min-w-[300px]"
      />

      <div className="flex items-center gap-2 ml-auto">
        {/* Sort Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-9 gap-2 pr-3 font-medium",
                "bg-background/50 hover:bg-background/80",
                "border-muted-foreground/20"
              )}
            >
              <Clock className="h-4 w-4" />
              {currentSort.label}
              <ChevronDown className="h-3 w-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {sortOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => onSortChange?.(option.value)}
                className={cn(
                  "flex items-center gap-2",
                  option.value === sortOrder && "bg-primary/5 text-primary"
                )}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Delete Button */}
        <Button
          variant="destructive"
          size="icon"
          onClick={onDelete}
          className={cn(
            "h-9 w-9",
            "bg-destructive/10 hover:bg-destructive/20",
            "text-destructive hover:text-destructive"
          )}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
} 