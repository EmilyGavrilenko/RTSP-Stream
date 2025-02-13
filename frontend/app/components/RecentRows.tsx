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

async function fetchRecentRows({ page, pageSize }: { page: number, pageSize: number }) {
  // Calculate start and end ranges
  const start = (page - 1) * pageSize
  const end = start + pageSize - 1

  const { data, error, count } = await supabase
    .from("camera_zones")
    .select("*", { count: "exact" })
    .order("time_in", { ascending: false })
    .range(start, end)

  if (error) {
    console.error("Error fetching recent rows:", error)
    return { data: [], count: 0 }
  }

  return { data: data || [], count: count || 0 }
}

export default function RecentRows() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [rows, setRows] = useState([])
  const [count, setCount] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      const { data: rows_, count: count_ } = await fetchRecentRows({ page, pageSize })
      setRows(rows_)
      setCount(count_)
    }
    fetchData()
    const /* The code snippet `const intervalId = setInterval(fetchData, 5000);` sets up an interval
    that calls the `fetchData` function every 5000 milliseconds (5 seconds). This means that
    the `fetchData` function will be executed repeatedly at the specified interval. */
    intervalId = setInterval(fetchData, 5000);
    return () => clearInterval(intervalId);
  }, [page, pageSize])

  const totalPages = Math.ceil(count / pageSize)

  return (
    <div className="bg-card shadow rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Recent Traffic Data</h2>
        <select
          value={pageSize}
          onChange={(e) => setPageSize(Number(e.target.value))}
          className="border rounded px-2 py-1"
        >
          {[25, 50, 100].map((size) => (
            <option key={size} value={size}>
              {size} rows
            </option>
          ))}
        </select>
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
          Showing {rows.length} of {count} results
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-3 py-1">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
