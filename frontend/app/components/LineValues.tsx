"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

interface LineData {
  line_number: number;
  direction: string;
  count: number;
}

const transformData = (data: LineData[]) => {
  return data.reduce((acc, { line_number, direction, count }) => {
    const key = `line_${line_number}_${direction}`;
    acc[key] = count;
    return acc;
  }, {} as Record<string, number>);
};

export default function LineValues() {
  const [lineData, setLineData] = useState<LineData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const formattedData = transformData(lineData);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        const { data, error } = await supabase.rpc("get_line_counts");

        if (error) throw error;
        
        if (mounted && data) {
          setLineData(data);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error fetching line values:', error);
      }
    };

    // Initial fetch
    fetchData();

    // Set up polling interval
    const intervalId = setInterval(fetchData, 5000);

    // Cleanup
    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-white shadow rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-2">Line 1 In</h3>
        <p className="text-2xl font-bold">{formattedData.line_1_in ?? 0}</p>
      </div>
      <div className="bg-white shadow rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-2">Line 1 Out</h3>
        <p className="text-2xl font-bold">{formattedData.line_1_out ?? 0}</p>
      </div>
      <div className="bg-white shadow rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-2">Line 2 In</h3>
        <p className="text-2xl font-bold">{formattedData.line_2_in ?? 0}</p>
      </div>
      <div className="bg-white shadow rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-2">Line 2 Out</h3>
        <p className="text-2xl font-bold">{formattedData.line_2_out ?? 0}</p>
      </div>
    </div>
  )
}
