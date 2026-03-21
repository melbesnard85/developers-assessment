import { useQuery } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import { useState } from "react"
import { toast } from "sonner"
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ChevronLeft, ShieldAlert, CheckCircle2 } from "lucide-react"
import { fetchWorklogs, getFreelancer } from "@/data/mockData"
import type { Worklog } from "@/types/worklog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import useAuth from "@/hooks/useAuth"
import { cn } from "@/lib/utils"

export const Route = createFileRoute("/_layout/payment")({
  component: PaymentReviewPage,
  head: () => ({
    meta: [{ title: "Payment Review - WorkLog Dashboard" }],
  }),
})

const statusVariant: Record<string, string> = {
  pending: "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border-yellow-500/30",
  approved: "bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/30",
  paid: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
  excluded: "bg-muted text-muted-foreground border-border",
}

function PaymentReviewPage() {
  const { user } = useAuth()
  const isAdmin = !!user?.is_superuser

  const [excludedFreelancers, setExcludedFreelancers] = useState<Set<string>>(new Set())
  const [excludedWorklogs, setExcludedWorklogs] = useState<Set<string>>(new Set())
  const [confirmed, setConfirmed] = useState(false)

  const { data: allWorklogs = [], isLoading, error } = useQuery<any>({
    queryKey: ["worklogs"],
    queryFn: fetchWorklogs,
  })

  const eligible: Worklog[] = allWorklogs.filter(
    (wl: Worklog) =>
      (wl.status === "pending" || wl.status === "approved") &&
      !excludedWorklogs.has(wl.id) &&
      !excludedFreelancers.has(wl.freelancerId),
  )

  const total = eligible.reduce((s: number, wl: Worklog) => s + wl.totalEarnings, 0)

  const byFreelancer = eligible.reduce(
    (acc: Record<string, { name: string; amount: number; count: number }>, wl: Worklog) => {
      const fl = getFreelancer(wl.freelancerId)
      if (!acc[fl.id]) acc[fl.id] = { name: fl.name, amount: 0, count: 0 }
      acc[fl.id].amount += wl.totalEarnings
      acc[fl.id].count += 1
      return acc
    },
    {},
  )

  const allFreelancerIds: string[] = Array.from(
    new Set(allWorklogs
      .filter((wl: Worklog) => wl.status === "pending" || wl.status === "approved")
      .map((wl: Worklog) => wl.freelancerId)),
  )

  const columns: ColumnDef<Worklog>[] = [
    {
      accessorKey: "taskName",
      header: "Task",
    },
    {
      accessorKey: "freelancerId",
      header: "Freelancer",
      cell: ({ getValue }) => getFreelancer(getValue() as string).name,
    },
    {
      accessorKey: "totalHours",
      header: "Hours",
      cell: ({ getValue }) => `${getValue() as number}h`,
    },
    {
      accessorKey: "totalEarnings",
      header: "Amount",
      cell: ({ getValue }) => (
        <span className="font-medium tabular-nums">${(getValue() as number).toFixed(2)}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ getValue }) => {
        const s = getValue() as string
        return (
          <Badge className={cn("border capitalize", statusVariant[s] ?? "")}>{s}</Badge>
        )
      },
    },
    {
      id: "actions",
      header: "Exclude",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive h-7 text-xs"
          onClick={() => {
            setExcludedWorklogs((prev) => new Set([...prev, row.original.id]))
            toast.info(`"${row.original.taskName}" excluded from batch.`)
          }}
          aria-label={`Exclude ${row.original.taskName} from payment`}
        >
          Exclude
        </Button>
      ),
    },
  ]

  const table = useReactTable({
    data: eligible,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <span className="text-muted-foreground animate-pulse">Loading payment data…</span>
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

  if (confirmed) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <CheckCircle2 className="h-12 w-12 text-green-500" />
        <h2 className="text-xl font-bold">Payment Confirmed!</h2>
        <p className="text-muted-foreground max-w-sm">
          A batch of {eligible.length} worklogs totalling{" "}
          <span className="font-semibold text-foreground">${total.toFixed(2)}</span> has been
          queued for processing.
        </p>
        <Link to="/worklogs">
          <Button variant="outline" aria-label="Back to worklogs">
            Back to Worklogs
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link to="/worklogs">
          <Button variant="ghost" size="sm" className="gap-1" aria-label="Back to worklogs">
            <ChevronLeft className="h-4 w-4" />
            Worklogs
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Payment Review</h1>
        <p className="text-muted-foreground">
          Review and confirm the payment batch before processing.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Worklog table */}
        <div className="flex-1 min-w-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Eligible Worklogs</CardTitle>
              <CardDescription>
                {eligible.length} worklogs included · exclude individual entries below
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((hg) => (
                    <TableRow key={hg.id} className="hover:bg-transparent">
                      {hg.headers.map((h) => (
                        <TableHead key={h.id}>
                          {h.isPlaceholder
                            ? null
                            : flexRender(h.column.columnDef.header, h.getContext())}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow className="hover:bg-transparent">
                      <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center text-muted-foreground"
                      >
                        No eligible worklogs.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Summary sidebar */}
        <div className="w-full lg:w-72 shrink-0 flex flex-col gap-4">
          {/* Freelancer exclusions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Exclude Freelancer</CardTitle>
              <CardDescription className="text-xs">
                Remove all worklogs for a freelancer from this batch.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {allFreelancerIds.map((fid) => {
                const fl = getFreelancer(fid)
                const excluded = excludedFreelancers.has(fid)
                return (
                  <div key={fid} className="flex items-center justify-between">
                    <span className="text-sm">{fl.name}</span>
                    <Button
                      variant={excluded ? "secondary" : "outline"}
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => {
                        setExcludedFreelancers((prev) => {
                          const next = new Set(prev)
                          if (excluded) next.delete(fid)
                          else next.add(fid)
                          return next
                        })
                        toast.info(
                          excluded
                            ? `${fl.name} re-included.`
                            : `${fl.name} excluded from batch.`,
                        )
                      }}
                      aria-label={`${excluded ? "Include" : "Exclude"} ${fl.name}`}
                    >
                      {excluded ? "Re-include" : "Exclude"}
                    </Button>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* Totals */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Batch Summary</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {Object.values(byFreelancer).map((fl) => (
                <div key={fl.name} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {fl.name} ({fl.count})
                  </span>
                  <span className="tabular-nums font-medium">${fl.amount.toFixed(2)}</span>
                </div>
              ))}

              <Separator />

              <div className="flex justify-between items-center">
                <span className="font-semibold">Total</span>
                <span className="font-bold tabular-nums text-primary text-lg">
                  ${total.toFixed(2)}
                </span>
              </div>

              {!isAdmin && (
                <div className="flex items-start gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-3 py-2">
                  <ShieldAlert className="h-4 w-4 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-yellow-700 dark:text-yellow-300">
                    Admin access required to confirm.
                  </p>
                </div>
              )}

              <Button
                disabled={!isAdmin || eligible.length === 0}
                onClick={() => {
                  setConfirmed(true)
                  toast.success("Payment batch confirmed!")
                }}
                className="w-full"
                aria-label="Confirm payment"
              >
                Confirm Payment
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
