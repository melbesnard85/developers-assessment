export type WorklogStatus = "pending" | "approved" | "paid" | "excluded"

export interface Freelancer {
  id: string
  name: string
  email: string
  hourlyRate: number
}

export interface TimeEntry {
  id: string
  worklogId: string
  description: string
  hours: number
  startTime: string
  endTime: string
  createdAt: string
}

export interface Worklog {
  id: string
  taskName: string
  freelancerId: string
  status: WorklogStatus
  totalHours: number
  totalEarnings: number
  createdAt: string
  updatedAt: string
}

export interface PaymentBatch {
  id: string
  worklogIds: string[]
  totalAmount: number
  status: "draft" | "confirmed"
  createdAt: string
}
