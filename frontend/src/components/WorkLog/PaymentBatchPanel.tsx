import { CreditCard, X, ShieldAlert } from "lucide-react"
import { worklogs, getFreelancer } from "@/data/mockData"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

interface PaymentBatchPanelProps {
  selectedIds: string[]
  isAdmin: boolean
  onRemove: (id: string) => void
  onConfirm: () => void
}

export function PaymentBatchPanel({
  selectedIds,
  isAdmin,
  onRemove,
  onConfirm,
}: PaymentBatchPanelProps) {
  const selected = worklogs.filter((wl) => selectedIds.includes(wl.id))
  const total = selected.reduce((s, wl) => s + wl.totalEarnings, 0)

  // Group by freelancer for summary
  const byFreelancer = selected.reduce(
    (acc, wl) => {
      const fl = getFreelancer(wl.freelancerId)
      if (!acc[fl.id]) acc[fl.id] = { name: fl.name, amount: 0, count: 0 }
      acc[fl.id].amount += wl.totalEarnings
      acc[fl.id].count += 1
      return acc
    },
    {} as Record<string, { name: string; amount: number; count: number }>,
  )

  return (
    <div className="flex flex-col gap-4 rounded-xl border bg-card p-4 shadow-sm h-fit sticky top-24">
      <div className="flex items-center gap-2">
        <CreditCard className="h-4 w-4 text-primary" />
        <h3 className="font-semibold text-sm">Payment Batch</h3>
        {selected.length > 0 && (
          <Badge variant="secondary" className="ml-auto">
            {selected.length}
          </Badge>
        )}
      </div>

      {selected.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-4">
          Select worklogs from the table to build a payment batch.
        </p>
      ) : (
        <>
          <div className="flex flex-col gap-1.5 max-h-60 overflow-y-auto pr-1">
            {selected.map((wl) => (
              <div
                key={wl.id}
                className="flex items-start justify-between gap-2 rounded-lg bg-muted/40 px-2.5 py-2"
              >
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-xs font-medium truncate">{wl.taskName}</span>
                  <span className="text-xs text-muted-foreground">
                    {getFreelancer(wl.freelancerId).name}
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-xs font-medium tabular-nums">
                    ${wl.totalEarnings.toFixed(2)}
                  </span>
                  <button
                    aria-label={`Remove ${wl.taskName} from batch`}
                    onClick={() => onRemove(wl.id)}
                    className="rounded p-0.5 hover:bg-destructive/10 hover:text-destructive transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <Separator />

          {/* Per-freelancer breakdown */}
          <div className="flex flex-col gap-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              By Freelancer
            </p>
            {Object.values(byFreelancer).map((fl) => (
              <div key={fl.name} className="flex justify-between text-xs">
                <span className="text-muted-foreground">
                  {fl.name} ({fl.count})
                </span>
                <span className="tabular-nums font-medium">${fl.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>

          <Separator />

          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold">Total</span>
            <span className="text-sm font-bold tabular-nums text-primary">
              ${total.toFixed(2)}
            </span>
          </div>

          {!isAdmin && (
            <div className="flex items-start gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-3 py-2">
              <ShieldAlert className="h-4 w-4 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
              <p className="text-xs text-yellow-700 dark:text-yellow-300">
                Only admins can confirm payments.
              </p>
            </div>
          )}

          <Button
            onClick={onConfirm}
            disabled={!isAdmin}
            className={cn("w-full", !isAdmin && "opacity-50 cursor-not-allowed")}
            aria-label="Confirm payment batch"
          >
            Confirm Payment
          </Button>
        </>
      )}
    </div>
  )
}
