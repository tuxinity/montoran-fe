import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { TrendingUp, Wallet, CheckCircle, AlertCircle } from "lucide-react";

interface SalesSummaryCardProps {
  title: string;
  value: string | number;
  loading: boolean;
  icon?: React.ReactNode;
}

export const SalesSummaryCard = ({
  title,
  value,
  loading,
  icon,
}: SalesSummaryCardProps) => {
  const getDefaultIcon = () => {
    if (title.includes("Revenue"))
      return <TrendingUp className="w-5 h-5 text-green-500" />;
    if (title.includes("Total"))
      return <Wallet className="w-5 h-5 text-blue-500" />;
    if (title.includes("Completed"))
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (title.includes("Pending"))
      return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    return null;
  };

  const displayIcon = icon || getDefaultIcon();

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          {displayIcon && (
            <div className="p-2 rounded-full bg-gray-100">{displayIcon}</div>
          )}
        </div>
        <div className="text-2xl font-bold">
          {loading ? <Skeleton className="h-8 w-24" /> : value}
        </div>
      </CardContent>
    </Card>
  );
};
