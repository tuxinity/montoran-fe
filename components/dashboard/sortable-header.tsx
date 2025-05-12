import { Sale } from "@/types/sales";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";

export const SortableHeader: React.FC<{
  field: keyof Sale;
  currentSort: { field: keyof Sale; direction: "asc" | "desc" };
  onSort: (field: keyof Sale) => void;
  children: React.ReactNode;
}> = ({ field, currentSort, onSort, children }) => (
  <th
    className="px-4 py-3 text-left text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground"
    onClick={() => onSort(field)}
  >
    <div className="flex items-center">
      {children}
      {currentSort.field === field &&
        (currentSort.direction === "asc" ? (
          <ChevronUpIcon className="ml-1 h-4 w-4" />
        ) : (
          <ChevronDownIcon className="ml-1 h-4 w-4" />
        ))}
    </div>
  </th>
);
