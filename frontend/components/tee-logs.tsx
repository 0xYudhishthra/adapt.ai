import type { TEELog } from "@/types"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

interface TEELogsProps {
  logs: TEELog[]
}

// API configuration
const API_CONFIG = {
  url: 'https://wizard-bff-rpc.alt.technology/v1/bff/aaa/app/logs/5de8b94d-4110-4465-9c00-c069c5bf00f7',
  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMTE5MTAxMjE2Mjk0NzM4MjI3MzQiLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jS1l4ZXBaeHY2Zm5TVnZYT1ZVMV94eG5DdzAyQ0hrbVE0TWJ4YnJLajNzNDBpQWlPcWw9czk2LWMiLCJlbWFpbCI6Inl1ZGhpc2h0aHJhLm1AZ21haWwuY29tIiwibmFtZSI6Ill1ZGhpc2h0aHJhIFN1Z3VtYXJhbiIsIm9yZ19uYW1lIjoiTHVjYTMiLCJvcmdfaWQiOjMzMywicGVybWlzc2lvbnMiOlsid3JpdGU6b3JnX2RlcGxveW1lbnRzIiwid3JpdGU6b3JnX3N1YnNjcmlwdGlvbnMiLCJ3cml0ZTpvcmdfdXNlcnMiXSwiaWF0IjoxNzM5MDgzODI0LCJleHAiOjE3NDE2NzU4MjR9.vahaWfmhcGgLMeshNzsFQO5DX_-F9YJ7oAOefDEjzQM'
}

// Fetch logs function with proper headers
async function fetchLogsFromAPI() {
  try {
    const response = await fetch(API_CONFIG.url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${API_CONFIG.token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'same-origin',  // Changed this
      mode: 'cors',            // Changed this
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.error('Authentication failed. Token might be expired or invalid.');
        throw new Error('Authentication failed');
      }
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    if (!data || !Array.isArray(data.logs)) {
      console.warn('Unexpected data format:', data);
      return [];
    }
    return data.logs;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
  
}

export function TEELogs({ logs: initialLogs }: TEELogsProps) {
  const [logs, setLogs] = useState<TEELog[]>(initialLogs)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const fetchLogs = async () => {
      if (!isMounted) return
      setIsLoading(true)
      setError(null)

      try {
        const fetchedLogs = await fetchLogsFromAPI()
        if (isMounted) {
          setLogs(fetchedLogs)
        }
      } catch (err) {
        if (isMounted) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to fetch logs'
          setError(errorMessage)
          console.error('Error fetching logs:', err)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchLogs()

    // Reduced polling interval to avoid too many requests
    const interval = setInterval(fetchLogs, 10000) // Changed to 10 seconds

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [])

  // Format timestamp
  const formatTimestamp = (timestamp: string | Date) => {
    try {
      const date = new Date(timestamp)
      return date.toISOString()
    } catch (e) {
      return 'Invalid date'
    }
  }

  return (
    <ScrollArea className="h-[200px] rounded-md border bg-muted p-4">
      <div className="space-y-2 font-mono text-sm">
        {isLoading && <div className="text-muted-foreground">Loading logs...</div>}
        {error && (
          <div className="text-red-500">
            Error: {error}
            <div className="text-sm text-gray-500">
              Please check your authentication token or network connection.
            </div>
          </div>
        )}
        {logs.map((log, index) => (
          <div
            key={index}
            className={cn(
              "flex items-start gap-2",
              log.level === "error" && "text-red-400",
              log.level === "warning" && "text-yellow-400",
              log.level === "info" && "text-blue-400",
            )}
          >
            <span className="text-muted-foreground">
              {formatTimestamp(log.timestamp)}
            </span>
            <span>[{log.level.toUpperCase()}]</span>
            <span>{log.message}</span>
            {log.data && (
              <pre className="mt-1 text-xs text-muted-foreground">
                {JSON.stringify(log.data, null, 2)}
              </pre>
            )}
          </div>
        ))}
        {!isLoading && !error && logs.length === 0 && (
          <div className="text-muted-foreground">
            No logs available. This could be because:
            <ul className="list-disc pl-5 mt-2 text-sm">
              <li>The service hasn't generated any logs yet</li>
              <li>There might be an authentication issue</li>
              <li>The connection to the server might be restricted</li>
            </ul>
          </div>
        )}
      </div>
    </ScrollArea>
  )
}

