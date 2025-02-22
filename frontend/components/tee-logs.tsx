import type { TEELog } from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface TEELogsProps {
  logs: TEELog[];
}

// Updated to use local API route

export function TEELogs({ logs: initialLogs }: TEELogsProps) {
  const [logs, setLogs] = useState<TEELog[]>(initialLogs);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    let retryTimeout: NodeJS.Timeout;

    const fetchLogs = async () => {
      if (!isMounted) return;
      setIsLoading(true);
      setError(null);

      try {
        const fetchedLogs = await fetchLogsFromAPI();
        if (isMounted) {
          // Append new logs to existing ones, avoiding duplicates
          setLogs(prevLogs => {
            const newLogs = fetchedLogs.filter((newLog: TEELog) => 
              !prevLogs.some(existingLog => 
                existingLog.message === newLog.message && 
                existingLog.timestamp.getTime() === newLog.timestamp.getTime()
              )
            );
            return [...prevLogs, ...newLogs];
          });
          setRetryCount(0);
        }
      } catch (err) {
        if (isMounted) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to fetch logs';
          setError(errorMessage);
          console.error('Error fetching logs:', err);

          if (retryCount < 3) {
            const delay = Math.pow(2, retryCount) * 1000;
            retryTimeout = setTimeout(() => {
              setRetryCount(prev => prev + 1);
            }, delay);
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchLogs();

    const interval = setInterval(fetchLogs, 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
      if (retryTimeout) clearTimeout(retryTimeout);
    };
  }, [retryCount]);

  async function fetchLogsFromAPI() {
    try {
      const response = await fetch('/api/logs', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // Handle the string log format
      if (typeof data.log === 'string') {
        const log: TEELog = {
          timestamp: new Date(),
          level: "info",
          message: data.log,
        }
        setLogs(prevLogs => [...prevLogs, log]);
      }
      // Handle array format if available
      return Array.isArray(data.log) ? data.log : [];
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }
  }

  // Sort logs by timestamp, most recent first
  const sortedLogs = [...logs].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <ScrollArea className="h-[200px] rounded-md border bg-muted p-4">
      <div className="space-y-2 font-mono text-sm">
        {isLoading && <div className="text-muted-foreground">Loading logs...</div>}
        {error && (
          <div className="text-red-500">
            Error: {error}
            {retryCount < 3 && <div className="text-sm">Retrying... ({retryCount + 1}/3)</div>}
          </div>
        )}
        {sortedLogs.map((log, index) => (
          <div
            key={`${log.timestamp.getTime()}-${index}`}
            className={cn(
              "flex items-start gap-2",
              log.level === "error" && "text-red-400",
              log.level === "warning" && "text-yellow-400",
              log.level === "info" && "text-blue-400"
            )}
          >
            <span className="text-muted-foreground">
              {new Date(log.timestamp).toISOString()}
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
          <div className="text-muted-foreground">No logs available</div>
        )}
      </div>
    </ScrollArea>
  );
}
