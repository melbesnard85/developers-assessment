import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type RowSelectionState,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, ChevronUp, Eye, Ban } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Link } from "@tanstack/react-router"
import { getFreelancer } from "@/data/mockData"
import type { Worklog } from "@/types/worklog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

const PAGE_SIZE = 10

const statusVariant: Record<string, string> = {
  pending: "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border-yellow-500/30",
  approved: "bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/30",
  paid: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
  excluded: "bg-muted text-muted-foreground border-border",
}

interface WorklogTableProps {
  data: Worklog[]
  rowSelection: RowSelectionState
  onRowSelectionChange: (s: RowSelectionState) => void
  onExclude: (id: string) => void
}

export function WorklogTable({
  data,
  rowSelection,
  onRowSelectionChange,
  onExclude,
}: WorklogTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const visibleData = data.slice(0, visibleCount)
  const hasMore = visibleCount < data.length

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [data])

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setVisibleCount((c) => Math.min(c + PAGE_SIZE, data.length))
        }
      },
      { threshold: 0.1 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasMore, data.length])

  const columns: ColumnDef<Worklog>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(v) => row.toggleSelected(!!v)}
          disabled={row.original.status === "excluded" || row.original.status === "paid"}
          aria-label={`Select worklog ${row.original.taskName}`}
        />
      ),
      enableSorting: false,
    },
    {
      accessorKey: "taskName",
      header: ({ column }) => (
        <button
          className="inline-flex items-center gap-1 hover:text-foreground"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          aria-label="Sort by task name"
        >
          Task
          {column.getIsSorted() === "asc" ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : column.getIsSorted() === "desc" ? (
            <ChevronDown className="h-3.5 w-3.5" />
          ) : (
            <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />
          )}
        </button>
      ),
    },
    {
      accessorKey: "freelancerId",
      header: "Freelancer",
      cell: ({ getValue }) => getFreelancer(getValue() as string).name,
    },
    {
      accessorKey: "totalHours",
      header: ({ column }) => (
        <button
          className="inline-flex items-center gap-1 hover:text-foreground"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          aria-label="Sort by hours"
        >
          Hours
          {column.getIsSorted() === "asc" ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : column.getIsSorted() === "desc" ? (
            <ChevronDown className="h-3.5 w-3.5" />
          ) : (
            <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />
          )}
        </button>
      ),
      cell: ({ getValue }) => `${getValue() as number}h`,
    },
    {
      accessorKey: "totalEarnings",
      header: ({ column }) => (
        <button
          className="inline-flex items-center gap-1 hover:text-foreground"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          aria-label="Sort by earnings"
        >
          Earnings
          {column.getIsSorted() === "asc" ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : column.getIsSorted() === "desc" ? (
            <ChevronDown className="h-3.5 w-3.5" />
          ) : (
            <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />
          )}
        </button>
      ),
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
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ getValue }) => <span>{getValue() as string}</span>,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Link to="/worklogs/$worklogId" params={{ worklogId: row.original.id }}>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" aria-label="View time entries">
              <Eye className="h-3.5 w-3.5" />
            </Button>
          </Link>
          {row.original.status !== "excluded" && row.original.status !== "paid" && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-destructive hover:text-destructive"
              onClick={() => onExclude(row.original.id)}
              aria-label="Exclude worklog from payment"
            >
              <Ban className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      ),
      enableSorting: false,
    },
  ]

  const table = useReactTable({
    data: visibleData,
    columns,
    state: { sorting, rowSelection },
    onSortingChange: setSorting,
    onRowSelectionChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: (row) => row.id,
  })

  return (
    <div className="flex flex-col gap-2">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id} className="hover:bg-transparent">
              {hg.headers.map((h) => (
                <TableHead key={h.id}>
                  {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() ? "selected" : undefined}
                className={cn(
                  row.original.status === "excluded" && "opacity-50",
                )}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground">
                No worklogs found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="flex items-center justify-center py-4">
        {hasMore ? (
          <span className="text-xs text-muted-foreground animate-pulse">Loading more…</span>
        ) : data.length > 0 ? (
          <span className="text-xs text-muted-foreground">
            Showing all {data.length} worklogs
          </span>
        ) : null}
      </div>
    </div>
  )
}
