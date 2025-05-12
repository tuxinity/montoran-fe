import { Sale } from "@/types/sales";
import { Badge } from "../ui/badge";
import { CheckCircleIcon, Clock, XCircleIcon } from "lucide-react";

export const StatusBadge: React.FC<{ status: Sale["status"] }> = ({
  status,
}) => {
  const statusConfig = {
    completed: {
      className: "bg-green-100 text-green-800 border-green-300",
      icon: CheckCircleIcon,
    },
    pending: {
      className: "bg-yellow-100 text-yellow-800 border-yellow-300",
      icon: Clock,
    },
    cancelled: {
      className: "bg-red-100 text-red-800 border-red-300",
      icon: XCircleIcon,
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge
      className={`${config.className} flex items-center gap-1 font-medium border`}
    >
      <Icon className="w-3 h-3" />
      <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
    </Badge>
  );
};
