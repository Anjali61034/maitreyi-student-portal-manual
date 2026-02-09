import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default async function AdminAchievementsPage() {
  const supabase = await createClient()

  const { data: achievements } = await supabase.from("achievements").select("*").order("category", { ascending: true })

  // Group achievements by category
  const groupedAchievements = achievements?.reduce(
    (acc, achievement) => {
      if (!acc[achievement.category]) {
        acc[achievement.category] = []
      }
      acc[achievement.category].push(achievement)
      return acc
    },
    {} as Record<string, typeof achievements>,
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Achievement Types</h1>
        <p className="text-muted-foreground">Manage available achievement categories and point values</p>
      </div>

      {groupedAchievements &&
        Object.entries(groupedAchievements).map(([category, items]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="capitalize">{category.replace("_", " ")}</CardTitle>
              <CardDescription>{items.length} achievement types</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {items.map((achievement: any) => (
                  <div key={achievement.id} className="flex items-start justify-between border-b pb-3 last:border-0">
                    <div className="space-y-1">
                      <p className="font-medium">{achievement.name}</p>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    </div>
                    <Badge variant="secondary">{achievement.max_points} points</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
    </div>
  )
}
