"use client"

import React, { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"

interface Row {
  id: string
  timestamp: string
  detection_id: string
}

async function fetchRecentRows(limit: number, offset: number) {
  const { data, error, count } = await supabase
    .from("camera_zones")
    .select("*", { count: "exact" })
    .order("time_in", { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error("Error fetching recent rows:", error)
    return { data: [], count: 0 }
  }

  return { data: data || [], count }
}

export default function RecentRows() {
  const [rows, setRows] = useState<Row[]>([])
  const [pageSize, setPageSize] = useState(25)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalCount, setTotalCount] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      const offset = currentPage * pageSize
      const { data: rows_, count } = await fetchRecentRows(pageSize, offset)
      setRows(rows_)
      setTotalCount(count || 0)
    }
    fetchData()
    const intervalId = setInterval(fetchData, 5000);
    return () => clearInterval(intervalId);
  }, [pageSize, currentPage])

  const totalPages = Math.ceil(totalCount / pageSize)
  const canGoNext = currentPage < totalPages - 1
  const canGoPrevious = currentPage > 0

  return (
    <div className="bg-card shadow rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Recent Traffic Data</h2>
        <Select value={pageSize.toString()} onValueChange={(value) => {
          setPageSize(Number(value))
          setCurrentPage(0) // Reset to first page when changing page size
        }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select page size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="25">Show 25 rows</SelectItem>
            <SelectItem value="50">Show 50 rows</SelectItem>
            <SelectItem value="100">Show 100 rows</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Timestamp</TableHead>
            <TableHead>Detection ID</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{new Date(row.timestamp).toLocaleString()}</TableCell>
              <TableCell>{row.detection_id}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {rows.length} of {totalCount} results
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(p => p - 1)}
            disabled={!canGoPrevious}
          >
            Previous
          </Button>
          <span className="flex items-center px-2">
            Page {currentPage + 1} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(p => p + 1)}
            disabled={!canGoNext}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
