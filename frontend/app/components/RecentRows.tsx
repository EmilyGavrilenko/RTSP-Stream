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

async function fetchRecentRows() {
  const { data, error } = await supabase
    .from("camera_zones")
    .select("*")
    .order("time_in", { ascending: false })

  if (error) {
    console.error("Error fetching recent rows:", error)
    return { data: [] }
  }

  return { data: data || [] }
}

export default function RecentRows() {
  const [rows, setRows] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      const { data: rows_ } = await fetchRecentRows()
      setRows(rows_)
    }
    fetchData()
    const intervalId = setInterval(fetchData, 5000);
    return () => clearInterval(intervalId);
  }, [])

  return (
    <div className="bg-card shadow rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Recent Traffic Data</h2>
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
          Showing {rows.length} results
        </div>
      </div>
    </div>
  )
}
