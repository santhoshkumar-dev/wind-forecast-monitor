import { Stats } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface StatsBarProps {
  stats: Stats
  loading: boolean
}

export function StatsBar({ stats, loading }: StatsBarProps) {
  const items = [
    {
      label: "Mean Absolute Error",
      value: `${stats.mae.toLocaleString()} MW`,
      key: "mae",
      hint: "Avg absolute deviation between actual & forecast",
    },
    {
      label: "Root Mean Sq. Error",
      value: `${stats.rmse.toLocaleString()} MW`,
      key: "rmse",
      hint: "Penalises large errors more than MAE",
    },
    {
      label: "Forecast Coverage",
      value: `${stats.coverage}%`,
      key: "coverage",
      hint: "% of actual points that have a matching forecast",
    },
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
                <p className="text-xs text-muted-foreground mt-1">{item.hint}</p>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
