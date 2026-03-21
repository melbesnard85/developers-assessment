import { useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { type RowSelectionState } from "@tanstack/react-table"
import { useState } from "react"
import { toast } from "sonner"
import { fetchWorklogs } from "@/data/mockData"
import type { Worklog, WorklogStatus } from "@/types/worklog"
import { PaymentBatchPanel } from "@/components/WorkLog/PaymentBatchPanel"
import { WorklogFilters, type WorklogFilterState } from "@/components/WorkLog/WorklogFilters"
import { WorklogTable } from "@/components/WorkLog/WorklogTable"
import useAuth from "@/hooks/useAuth"

export const Route = createFileRoute("/_layout/worklogs")({
  component: WorklogsPage,
  head: () => ({
    meta: [{ title: "Worklogs - WorkLog Dashboard" }],
  }),
})

function WorklogsPage() {
  const { user } = useAuth()
  const isAdmin = !!user?.is_superuser

  const [filters, setFilters] = useState<WorklogFilterState>({
    activeTab: null,
    dateFrom: "",
    dateTo: "",
    freelancerId: "",
    status: "",
  })
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [localStatuses, setLocalStatuses] = useState<Record<string, WorklogStatus>>({})

  const { data: allWorklogs = [], isLoading, error } = useQuery<any>({
    queryKey: ["worklogs"],
    queryFn: fetchWorklogs,
  })

  const worklogsWithOverrides: Worklog[] = allWorklogs.map((wl: Worklog) => ({
    ...wl,
    status: localStatuses[wl.id] ?? wl.status,
  }))

  const filtered = worklogsWithOverrides.filter((wl: Worklog) => {
    if (filters.dateFrom && wl.createdAt < filters.dateFrom) return false
    if (filters.dateTo && wl.createdAt > `${filters.dateTo}T23:59:59`) return false
    if (filters.freelancerId && wl.freelancerId !== filters.freelancerId) return false
    if (filters.status && wl.status !== filters.status) return false
    return true
  })

  const selectedIds = Object.keys(rowSelection).filter((k) => rowSelection[k])

  const handleExclude = (id: string) => {
    setLocalStatuses((prev) => ({ ...prev, [id]: "excluded" }))
    setRowSelection((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
    toast.info("Worklog excluded from payment batch.")
  }

  const handleRemoveFromBatch = (id: string) => {
    setRowSelection((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  const handleConfirmPayment = () => {
    setLocalStatuses((prev) => {
      const next = { ...prev }
      selectedIds.forEach((id) => {
        next[id] = "paid"
      })
      return next
    })
    setRowSelection({})
    toast.success(`Payment confirmed for ${selectedIds.length} worklogs.`)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <span className="text-muted-foreground animate-pulse">Loading worklogs…</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-24">
        <span className="text-destructive">Failed to load worklogs. Please try again.</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Worklogs</h1>
        <p className="text-muted-foreground">
          Review freelancer work logs and process payments.
        </p>
      </div>

      <WorklogFilters filters={filters} onChange={setFilters} />

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <div className="flex-1 min-w-0 rounded-xl border bg-card shadow-sm overflow-x-auto">
          <WorklogTable
            data={filtered}
            rowSelection={rowSelection}
            onRowSelectionChange={setRowSelection}
            onExclude={handleExclude}
          />
        </div>

        <div className="w-full lg:w-72 shrink-0">
          <PaymentBatchPanel
            selectedIds={selectedIds}
            isAdmin={isAdmin}
            onRemove={handleRemoveFromBatch}
            onConfirm={handleConfirmPayment}
          />
        </div>
      </div>
    </div>
  )
}
