import type { TEELog } from "@/types"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface TEELogsProps {
  logs: TEELog[]
}

export function TEELogs({ logs }: TEELogsProps) {
  return (
    <ScrollArea className="h-[200px] rounded-md border bg-muted p-4">
      <div className="space-y-2 font-mono text-sm">
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
            <span className="text-muted-foreground">{log.timestamp.toISOString()}</span>
            <span>[{log.level.toUpperCase()}]</span>
            <span>{log.message}</span>
            {log.data && <pre className="mt-1 text-xs text-muted-foreground">{JSON.stringify(log.data, null, 2)}</pre>}
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}

