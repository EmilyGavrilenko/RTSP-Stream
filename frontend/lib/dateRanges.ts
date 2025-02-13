export function getDateRange(range: string) {
  const now = new Date()
  let startDate: Date

  switch (range) {
    case "Today":
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      break
    case "This Week":
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay())
      break
    case "Past Hour":
      startDate = new Date(now.getTime() - 60 * 60 * 1000)
      break
    default:
      startDate = new Date(0) // All Time
  }

  return { startDate, endDate: now }
}

