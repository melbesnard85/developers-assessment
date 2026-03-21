import type { Freelancer, TimeEntry, Worklog } from "@/types/worklog"

export const freelancers: Freelancer[] = [
  { id: "f1", name: "Alice Chen", email: "alice@example.com", hourlyRate: 85 },
  { id: "f2", name: "Bob Martinez", email: "bob@example.com", hourlyRate: 75 },
  { id: "f3", name: "Carol Smith", email: "carol@example.com", hourlyRate: 95 },
  { id: "f4", name: "David Kim", email: "david@example.com", hourlyRate: 70 },
  { id: "f5", name: "Eva Rossi", email: "eva@example.com", hourlyRate: 90 },
]

const makeEntries = (worklogId: string, count: number, baseDate: string): TimeEntry[] =>
  Array.from({ length: count }, (_, i) => {
    const hours = Math.round((1 + Math.random() * 3) * 2) / 2
    const start = new Date(`${baseDate}T${8 + i}:00:00.000Z`)
    const end = new Date(start.getTime() + hours * 3600 * 1000)
    return {
      id: `te-${worklogId}-${i + 1}`,
      worklogId,
      description: [
        "Implemented feature module",
        "Code review and refactor",
        "Bug investigation and fix",
        "Unit test coverage",
        "API integration",
        "Design system updates",
        "Performance optimisation",
        "Documentation",
      ][i % 8],
      hours,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      createdAt: start.toISOString(),
    }
  })

const tasks = [
  "Authentication Module",
  "Dashboard Redesign",
  "API Gateway Setup",
  "Payment Integration",
  "Email Notification System",
  "User Profile Management",
  "Data Export Feature",
  "Search Functionality",
  "Analytics Pipeline",
  "Mobile Responsive Fixes",
  "CI/CD Pipeline Setup",
  "Database Migration",
  "Websocket Chat Feature",
  "File Upload Service",
  "Role Management UI",
  "Audit Logging",
  "Report Generation",
  "OAuth Integration",
  "Performance Monitoring",
  "Onboarding Flow",
]

const statuses: Worklog["status"][] = ["pending", "pending", "pending", "approved", "paid"]

export const worklogs: Worklog[] = Array.from({ length: 50 }, (_, i) => {
  const freelancer = freelancers[i % freelancers.length]
  const hours = Math.round((2 + Math.random() * 14) * 2) / 2
  const earnings = Math.round(hours * freelancer.hourlyRate * 100) / 100
  const daysAgo = i * 2
  const date = new Date(Date.now() - daysAgo * 86400 * 1000)
  const dateStr = date.toISOString()
  return {
    id: `wl-${i + 1}`,
    taskName: tasks[i % tasks.length],
    freelancerId: freelancer.id,
    status: statuses[i % statuses.length],
    totalHours: hours,
    totalEarnings: earnings,
    createdAt: dateStr,
    updatedAt: dateStr,
  }
})

export const timeEntriesByWorklog: Record<string, TimeEntry[]> = Object.fromEntries(
  worklogs.map((wl) => [
    wl.id,
    makeEntries(wl.id, 3 + (parseInt(wl.id.split("-")[1]) % 3), wl.createdAt.slice(0, 10)),
  ]),
)

export const getFreelancer = (id: string): Freelancer =>
  freelancers.find((f) => f.id === id) ?? freelancers[0]

// Simulate async API responses
export const fetchWorklogs = async (): Promise<any> => {
  await new Promise((r) => setTimeout(r, 300))
  return worklogs
}

export const fetchTimeEntries = async (worklogId: string): Promise<any> => {
  await new Promise((r) => setTimeout(r, 200))
  return timeEntriesByWorklog[worklogId] ?? []
}

export const fetchFreelancers = async (): Promise<any> => {
  await new Promise((r) => setTimeout(r, 100))
  return freelancers
}
