import { useQuery } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import { ChevronLeft } from "lucide-react"
import { fetchTimeEntries, getFreelancer, worklogs } from "@/data/mockData"
import { TimeEntryTable } from "@/components/WorkLog/TimeEntryTable"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

export const Route = createFileRoute("/_layout/worklogs/$worklogId")({
  component: WorklogDetailPage,
  head: () => ({
    meta: [{ title: "Worklog Detail - WorkLog Dashboard" }],
  }),
})

const statusVariant: Record<string, string> = {
  pending: "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border-yellow-500/30",
  approved: "bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/30",
  paid: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
  excluded: "bg-muted text-muted-foreground border-border",
}

function WorklogDetailPage() {
  const { worklogId } = Route.useParams()
  const worklog = worklogs.find((wl) => wl.id === worklogId)

  const { data: entries = [], isLoading, error } = useQuery<any>({
    queryKey: ["timeEntries", worklogId],
    queryFn: () => fetchTimeEntries(worklogId),
  })

  if (!worklog) {
    return (
      <div className="flex flex-col gap-4">
        <Link to="/worklogs">
          <Button variant="ghost" size="sm" className="gap-1">
            <ChevronLeft className="h-4 w-4" />
            Back to Worklogs
          </Button>
        </Link>
        <p className="text-muted-foreground">Worklog not found.</p>
      </div>
    )
  }

  const freelancer = getFreelancer(worklog.freelancerId)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link to="/worklogs">
          <Button variant="ghost" size="sm" className="gap-1" aria-label="Back to worklogs list">
            <ChevronLeft className="h-4 w-4" />
            Worklogs
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{worklog.taskName}</h1>
          <p className="text-muted-foreground">{freelancer.name} · {freelancer.email}</p>
        </div>
        <Badge className={cn("border capitalize self-start", statusVariant[worklog.status] ?? "")}>
          {worklog.status}
        </Badge>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Hours", value: `${worklog.totalHours}h` },
          { label: "Hourly Rate", value: `$${freelancer.hourlyRate}/hr` },
          { label: "Total Earnings", value: `$${worklog.totalEarnings.toFixed(2)}` },
          { label: "Time Entries", value: String(entries.length) },
        ].map(({ label, value }) => (
          <Card key={label} className="py-4">
            <CardContent className="px-4">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-xl font-bold tabular-nums mt-0.5">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Time Entries</CardTitle>
          <CardDescription>Individual time logs recorded by the freelancer</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          {isLoading ? (
            <p className="px-6 py-8 text-center text-muted-foreground animate-pulse">
              Loading entries…
            </p>
          ) : error ? (
            <p className="px-6 py-8 text-center text-destructive">
              Failed to load time entries. Please try again.
            </p>
          ) : (
            <TimeEntryTable data={entries} />
          )}
        </CardContent>
      </Card>

      <div className="flex flex-col gap-1 text-xs text-muted-foreground">
        <span>Created: {worklog.createdAt}</span>
        <span>Updated: {worklog.updatedAt}</span>
      </div>
    </div>
  )
}
