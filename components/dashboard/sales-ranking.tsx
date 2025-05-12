import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Sale } from "@/types/sales";
import { idrFormat } from "@/utils/idr-format";
import { Trophy } from "lucide-react";

interface SalesRankingProps {
  sales: Sale[];
  users: { id: string; name: string }[];
}

export const SalesRanking = ({ sales, users }: SalesRankingProps) => {
  // Calculate sales count and revenue per user
  const userStats = users.map((user) => {
    const userSales = sales.filter((sale) => sale.created_by === user.id);
    const totalSales = userSales.length;
    // Round down the total revenue to the nearest integer
    const totalRevenue = Math.floor(
      userSales.reduce((sum, sale) => sum + sale.price, 0)
    );

    return {
      user,
      totalSales,
      totalRevenue,
    };
  });

  // Sort by total sales (descending)
  const sortedStats = userStats.sort((a, b) => b.totalSales - a.totalSales);

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <CardTitle className="text-lg font-semibold">
            Top Salespersons
          </CardTitle>
          <Trophy className="w-5 h-5 text-yellow-500" />
        </div>
        <div className="space-y-4">
          {sortedStats.map((stat, index) => (
            <div
              key={stat.user.id}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium">{stat.user.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {stat.totalSales} sales
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">{idrFormat(stat.totalRevenue)}</p>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
