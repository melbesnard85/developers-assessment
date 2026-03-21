import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import type { TimeEntry } from "@/types/worklog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface TimeEntryTableProps {
  data: TimeEntry[]
}

const columns: ColumnDef<TimeEntry>[] = [
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "hours",
    header: "Hours",
    cell: ({ getValue }) => `${getValue() as number}h`,
  },
  {
    accessorKey: "startTime",
    header: "Start",
    cell: ({ getValue }) => <span className="font-mono text-xs">{getValue() as string}</span>,
  },
  {
    accessorKey: "endTime",
    header: "End",
    cell: ({ getValue }) => <span className="font-mono text-xs">{getValue() as string}</span>,
  },
  {
    accessorKey: "createdAt",
    header: "Logged At",
    cell: ({ getValue }) => <span className="font-mono text-xs">{getValue() as string}</span>,
  },
]

export function TimeEntryTable({ data }: TimeEntryTableProps) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
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
            <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
              No time entries.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
