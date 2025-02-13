"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function RangeSelector({range, setRange}: {range: string, setRange: (range: string) => void}) {
  const router = useRouter()

  const handleChange = (newRange: string) => {
    setRange(newRange)
    router.push(`/?range=${encodeURIComponent(newRange)}`)
  }
  return (
    <Select value={range} onValueChange={handleChange} >
      <SelectTrigger className="focus:ring-0 focus:ring-offset-0" style={{width: "150px"}}>
        <SelectValue placeholder="Select range" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="All Time">All Time</SelectItem>
        <SelectItem value="This Week">This Week</SelectItem>
        <SelectItem value="Today">Today</SelectItem>
        <SelectItem value="Past Hour">Past Hour</SelectItem>
      </SelectContent>
    </Select>
  )
}
