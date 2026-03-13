import { Stats } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface StatsBarProps {
  stats: Stats
  loading: boolean
}

export function StatsBar({ stats, loading }: StatsBarProps) {
  const items = [
    { label: "Mean Absolute Error", value: `${stats.mae.toLocaleString()} MW`, key: "mae" },
    { label: "Root Mean Sq. Error", value: `${stats.rmse.toLocaleString()} MW`, key: "rmse" },
    { label: "Forecast Coverage", value: `${stats.coverage}%`, key: "coverage" },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {items.map((item) => (
        <Card key={item.key}>
          <CardContent className="pt-5 pb-4">
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-7 w-24" />
              </div>
            ) : (
              <>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  {item.label}
                </p>
                <p className="text-2xl font-bold text-foreground">{item.value}</p>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
