import { CalendarDays, User, Tag } from "lucide-react"
import { useState } from "react"
import { freelancers } from "@/data/mockData"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"

export interface WorklogFilterState {
  activeTab: "dateRange" | "freelancer" | "status" | null
  dateFrom: string
  dateTo: string
  freelancerId: string
  status: string
}

interface WorklogFiltersProps {
  filters: WorklogFilterState
  onChange: (f: WorklogFilterState) => void
}

const tabs = [
  { key: "dateRange" as const, label: "Date Range", icon: CalendarDays },
  { key: "freelancer" as const, label: "Freelancer", icon: User },
  { key: "status" as const, label: "Status", icon: Tag },
]

export function WorklogFilters({ filters, onChange }: WorklogFiltersProps) {
  const toggle = (tab: WorklogFilterState["activeTab"]) => {
    onChange({ ...filters, activeTab: filters.activeTab === tab ? null : tab })
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            aria-label={`Filter by ${label}`}
            aria-pressed={filters.activeTab === key}
            onClick={() => toggle(key)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
              filters.activeTab === key
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-foreground hover:bg-muted",
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
        {(filters.dateFrom || filters.dateTo || filters.freelancerId || filters.status) && (
          <button
            aria-label="Clear all filters"
            onClick={() =>
              onChange({
                activeTab: null,
                dateFrom: "",
                dateTo: "",
                freelancerId: "",
                status: "",
              })
            }
            className="inline-flex items-center gap-1.5 rounded-full border border-destructive/40 px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>

      {filters.activeTab === "dateRange" && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-muted/30 px-4 py-3">
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground whitespace-nowrap">From</label>
            <Input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => onChange({ ...filters, dateFrom: e.target.value })}
              className="h-8 w-40"
              aria-label="Filter from date"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground whitespace-nowrap">To</label>
            <Input
              type="date"
              value={filters.dateTo}
              onChange={(e) => onChange({ ...filters, dateTo: e.target.value })}
              className="h-8 w-40"
              aria-label="Filter to date"
            />
          </div>
        </div>
      )}

      {filters.activeTab === "freelancer" && (
        <div className="rounded-lg border bg-muted/30 px-4 py-3">
          <Select
            value={filters.freelancerId || "all"}
            onValueChange={(v) => onChange({ ...filters, freelancerId: v === "all" ? "" : v })}
          >
            <SelectTrigger className="h-8 w-56" aria-label="Select freelancer">
              <SelectValue placeholder="All freelancers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All freelancers</SelectItem>
              {freelancers.map((f) => (
                <SelectItem key={f.id} value={f.id}>
                  {f.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {filters.activeTab === "status" && (
        <div className="rounded-lg border bg-muted/30 px-4 py-3">
          <Select
            value={filters.status || "all"}
            onValueChange={(v) => onChange({ ...filters, status: v === "all" ? "" : v })}
          >
            <SelectTrigger className="h-8 w-44" aria-label="Select status">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="excluded">Excluded</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  )
}
