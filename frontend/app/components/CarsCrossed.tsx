"use client"

import { supabase } from "@/lib/supabase"
import { getDateRange } from "@/lib/dateRanges"
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import Graph from "./Graph"
import { format, eachMinuteOfInterval, eachHourOfInterval, eachDayOfInterval } from "date-fns"
import RangeSelector from "./RangeSelector"

async function fetchCarsCrossed(range: string) {
  const { startDate, endDate } = getDateRange(range);
  console.log(startDate, endDate)

  // Get total count
  const { count, error: countError } = await supabase
    .from("camera_zones")
    .select("*", { count: "exact", head: true })
    .gte("timestamp", startDate.toISOString())
    .lte("timestamp", endDate.toISOString());

  if (countError) {
    console.error("Error fetching cars crossed count:", countError);
    return { total: 0, timeData: [] };
  }

  // Determine the time interval for aggregation
  let timeInterval = "day";
  let timeFormat = "MMM d";
  let getTimePoints: (interval: { start: Date; end: Date }) => Date[];

  if (range === "Past Hour") {
    timeInterval = "minute";
    timeFormat = "HH:mm";
    getTimePoints = (interval) => eachMinuteOfInterval(interval);
  } else if (range === "Today") {
    timeInterval = "hour";
    timeFormat = "HH:mm";
    getTimePoints = (interval) => eachHourOfInterval(interval);
  } else if (range === "This Week") {
    timeInterval = "hour";
    timeFormat = "MM/dd/yyyy HH:mm";
    getTimePoints = (interval) => eachHourOfInterval(interval);
  } else {
    getTimePoints = (interval) => eachDayOfInterval(interval);
  }

  console.log("fetching data", startDate, endDate, timeInterval)
  const { data: timeData, error: timeError } = await supabase
  .rpc("get_cars_crossed", {
    start_time: startDate.toISOString(),
    end_time: endDate.toISOString(),
    time_interval: timeInterval
  });

  console.log("timeData", timeData)

  if (timeError) {
    console.error("Error fetching time data:", timeError);
    return { total: count ?? 0, timeData: [] };
  }

  // Create a map of existing data points
  const dataMap = new Map(
    timeData.map((row: { time_bucket: string; count: number }) => [
      format(new Date(row.time_bucket), timeFormat),
      row.count
    ])
  );

  // Get min and max dates from the returned data
  const dates = timeData.map(row => new Date(row.time_bucket));
  const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
  const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));

  // Generate all time points between min and max dates
  const allTimePoints = getTimePoints({ start: minDate, end: maxDate });

  // Create complete dataset with 0s for missing points
  const formattedData = allTimePoints.map(date => ({
    time: format(date, timeFormat),
    count: dataMap.get(format(date, timeFormat)) || 0
  }));

  return { total: count ?? 0, timeData: formattedData };
}

import { useState, useEffect } from "react";

export default function CarsCrossed({ searchParams }: { searchParams: string }) {
  const [data, setData] = useState<{ total: number; timeData: Array<{ time: string; count: number }> }>({ 
    total: 0, 
    timeData: [] 
  });
  const [range, setRange] = useState("All Time")

  // const range = typeof searchParams.range === "string" ? searchParams.range : "All Time"
  

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      const result = await fetchCarsCrossed(range);
      console.log(result.timeData);
      if (mounted) {
        setData(result);
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
  }, [range]);

  return (
    <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Cars Crossed</h2>
            <p className="text-3xl font-bold">{data.total}</p>
            <p className="text-sm text-gray-500">{range}</p>
        </div>

        <div className="mb-4">
          <RangeSelector range={range} setRange={setRange} />
        </div>
      </div>



      
      {data.total > 0 && 
        <div className="h-[300px]">
          <Graph data={data.timeData || []} xKey="time" yKeys={["count"]} timeKey="time" />
        </div>
      }
    </div>
  )
}