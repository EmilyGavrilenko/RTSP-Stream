import { useState, useEffect } from "react";

export interface CarData {
  id: number;
  timestamp: string;
  direction: string;
  speed: number;
}

// Centralized data fetching function
async function fetchCarData(
  startDate?: Date,
  endDate?: Date
): Promise<CarData[]> {
  const params = new URLSearchParams();
  if (startDate) params.append("startDate", startDate.toISOString());
  if (endDate) params.append("endDate", endDate.toISOString());

  const response = await fetch(`/api/cars?${params.toString()}`);
  if (!response.ok) {
    throw new Error("Failed to fetch car data");
  }
  return response.json();
}

// Custom hook for data fetching with polling
export function useCarData(startDate?: Date, endDate?: Date) {
  const [data, setData] = useState<CarData[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function pollData() {
      try {
        const newData = await fetchCarData(startDate, endDate);
        if (mounted) {
          setData(newData);
          setError(null);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error("Unknown error"));
          setLoading(false);
        }
      }
    }

    // Initial fetch
    pollData();

    // Set up polling interval
    const intervalId = setInterval(pollData, 10000);

    // Cleanup
    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, [startDate, endDate]);

  return { data, error, loading };
}
