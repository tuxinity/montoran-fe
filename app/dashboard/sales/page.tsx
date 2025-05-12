"use client";

import AuthApi from "@/lib/auth-api";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DownloadIcon, PlusCircleIcon, SearchIcon, Trash2 } from "lucide-react";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { DateRangePicker } from "@/components/dashboard/date-range-picker";
import { idrFormat } from "@/utils/idr-format";
import { Input } from "@/components/ui/input";
import {
  SalesSummaryCard,
  SortableHeader,
  SalesRanking,
} from "@/components/dashboard";
import { Sale } from "@/types/sales";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SalesApi, { SalesFilter, SortConfig } from "@/lib/sales-api";
import { useToast } from "@/hooks/use-toast";
import { NewSaleDialog } from "@/components/dashboard/new-sale-dialog";
import { DeleteSaleDialog } from "@/components/dashboard/delete-sale-dialog";
import { pb } from "@/lib/pocketbase";
import { COLLECTIONS } from "@/lib/constants";
import { QRScanner } from "@/components/dashboard/qr-scanner";
import CarApi from "@/lib/car-api";

export default function SalesDashboard() {
  const { toast } = useToast();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [createdByFilter, setCreatedByFilter] = useState<string>("all");
  const [users, setUsers] = useState<{ id: string; name: string }[]>([]);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: "created",
    direction: "desc",
  });
  const [showNewSaleDialog, setShowNewSaleDialog] = useState(false);
  const [summary, setSummary] = useState({
    totalSales: 0,
    totalRevenue: 0,
  });
  const [userName, setUserName] = useState<string>("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);

  useEffect(() => {
    if (!AuthApi.isLoggedIn()) {
      console.log("Not logged in");
      return;
    }

    const user = AuthApi.getCurrentUser();

    if (user) {
      setUserName(user.name || "User");
    } else {
      console.log("No user data available");
    }

    const loadUsers = async () => {
      try {
        const records = await pb.collection(COLLECTIONS.USERS).getFullList({
          sort: "name",
          $autoCancel: false,
        });
        setUsers(records.map((user) => ({ id: user.id, name: user.name })));
      } catch (error) {
        console.error("Error loading users:", error);
      }
    };

    loadUsers();
  }, []);

  useEffect(() => {
    const pb = AuthApi.getPocketBase();
    pb.authStore.onChange(() => {
      const user = AuthApi.getCurrentUser();
      console.log("Auth state changed, user:", user);
      if (user) {
        setUserName(user.name || "User");
      }
    });
  }, []);

  const loadSales = useCallback(async () => {
    setLoading(true);
    try {
      const filters: SalesFilter = {
        search: search || undefined,
        paymentMethod: paymentFilter !== "all" ? paymentFilter : undefined,
        dateFrom: dateRange?.from
          ? format(dateRange.from, "yyyy-MM-dd")
          : undefined,
        dateTo: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
        createdBy: createdByFilter !== "all" ? createdByFilter : undefined,
      };

      const salesData = await SalesApi.getSales(filters, sortConfig);
      setSales(salesData);

      const summaryData = await SalesApi.getSalesSummary();
      setSummary(summaryData);
    } catch (error) {
      console.error("Error loading sales:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load sales data. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }, [search, paymentFilter, dateRange, createdByFilter, sortConfig, toast]);

  const handleSort = (field: keyof Sale) => {
    setSortConfig((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const resetFilters = () => {
    setSearch("");
    setPaymentFilter("all");
    setDateRange(undefined);
    setCreatedByFilter("all");
  };

  const handleNewSale = async (saleData: Omit<Sale, "id">) => {
    try {
      await SalesApi.createSale(saleData);
      toast({
        title: "Success",
        description: "Sale has been added successfully.",
      });
      loadSales();
      setShowNewSaleDialog(false);
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add sale.",
      });
    }
  };

  const handleDeleteClick = (id: string) => {
    setSelectedSaleId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async (notes: string) => {
    if (!selectedSaleId) return;

    try {
      const userId = AuthApi.getPocketBase().authStore.record?.id;
      if (!userId) {
        throw new Error("User not authenticated");
      }
      console.log("Deleting sale with notes:", notes);
      await SalesApi.softDeleteSale(selectedSaleId, userId, notes);
      toast({
        title: "Success",
        description: "Sale has been deleted successfully.",
      });
      loadSales();
    } catch (error) {
      console.log("Error deleting sale:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete sale.",
      });
    } finally {
      setDeleteDialogOpen(false);
      setSelectedSaleId(null);
    }
  };

  useEffect(() => {
    loadSales();
  }, [loadSales]);

  const exportToCSV = () => {
    if (sales.length === 0) return;

    const headers = [
      "ID",
      "Date",
      "Customer",
      "Car",
      "Price",
      "Payment",
      "Created By",
    ];
    const csvData = sales.map((sale) => [
      sale.id,
      sale.created ? new Date(sale.created).toLocaleDateString() : "-",
      sale.customer_name,
      sale.expand?.car
        ? `${sale.expand.car.expand?.model?.expand?.brand?.name || ""} ${
            sale.expand.car.expand?.model?.name || ""
          } (${sale.expand.car.year})`
        : "Unknown",
      sale.price.toString(),
      sale.payment_method,
      sale.expand?.created_by?.name || "Unknown",
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `sales_export_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleQRCodeScanned = async (carId: string) => {
    try {
      setLoading(true);
      const car = await CarApi.getCarById({ id: carId });

      if (car.is_sold) {
        toast({
          variant: "destructive",
          title: "Car Already Sold",
          description: "This car has already been sold.",
        });
        return;
      }

      setShowNewSaleDialog(true);

      toast({
        title: "Car Found",
        description: `${car.expand?.model?.expand?.brand?.name} ${car.expand?.model?.name} ready for sale.`,
      });
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to find car with the scanned QR code",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex flex-col gap-4 md:gap-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <h1 className="text-xl md:text-2xl font-bold">
            {userName}&apos;s Sales Dashboard
          </h1>
          <div className="flex gap-2">
            <div className="flex items-center space-x-2">
              <Button onClick={() => setShowNewSaleDialog(true)}>
                <PlusCircleIcon className="h-4 w-4 mr-2" />
                New Sale
              </Button>
              <QRScanner onSuccess={handleQRCodeScanned} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SalesSummaryCard
            title="Total Sales"
            loading={loading}
            value={summary.totalSales}
          />
          <SalesSummaryCard
            title="Total Revenue"
            loading={loading}
            value={idrFormat(summary.totalRevenue)}
          />
          <SalesRanking sales={sales} users={users} />
        </div>

        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by customer, car, or ID..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="Cash">Cash</SelectItem>
                <SelectItem value="Credit">Credit</SelectItem>
              </SelectContent>
            </Select>

            <div className="max-w-sm">
              <DateRangePicker
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={resetFilters}
                className="flex-1"
              >
                Clear Filters
              </Button>
              <Button
                variant="outline"
                onClick={exportToCSV}
                disabled={sales.length === 0}
                className="flex-1"
              >
                <DownloadIcon className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <SortableHeader
                        field="id"
                        currentSort={sortConfig}
                        onSort={handleSort}
                      >
                        ID
                      </SortableHeader>
                      <SortableHeader
                        field="created"
                        currentSort={sortConfig}
                        onSort={handleSort}
                      >
                        Date
                      </SortableHeader>
                      <SortableHeader
                        field="customer_name"
                        currentSort={sortConfig}
                        onSort={handleSort}
                      >
                        Customer
                      </SortableHeader>
                      <SortableHeader
                        field="car"
                        currentSort={sortConfig}
                        onSort={handleSort}
                      >
                        Car
                      </SortableHeader>
                      <SortableHeader
                        field="price"
                        currentSort={sortConfig}
                        onSort={handleSort}
                      >
                        Price
                      </SortableHeader>
                      <SortableHeader
                        field="payment_method"
                        currentSort={sortConfig}
                        onSort={handleSort}
                      >
                        Payment
                      </SortableHeader>
                      <th className="px-4 py-3 text-sm font-medium text-muted-foreground">
                        Description
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      Array(5)
                        .fill(0)
                        .map((_, index) => (
                          <tr key={index} className="border-b">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((col) => (
                              <td key={col} className="px-4 py-3">
                                <Skeleton className="h-5 w-24" />
                              </td>
                            ))}
                          </tr>
                        ))
                    ) : sales.length === 0 ? (
                      <tr>
                        <td
                          colSpan={8}
                          className="px-4 py-8 text-center text-muted-foreground"
                        >
                          No sales found. Try adjusting your filters.
                        </td>
                      </tr>
                    ) : (
                      sales.map((sale) => (
                        <tr
                          key={sale.id}
                          className="border-b hover:bg-muted/50"
                        >
                          <td className="px-4 py-3 text-sm">{sale.id}</td>
                          <td className="px-4 py-3 text-sm">
                            {sale.created
                              ? new Date(sale.created).toLocaleDateString()
                              : "-"}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium">
                            {sale.customer_name}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {sale.expand?.car
                              ? `${
                                  sale.expand.car.expand?.model?.expand?.brand
                                    ?.name || ""
                                } ${
                                  sale.expand.car.expand?.model?.name || ""
                                } (${sale.expand.car.year})`
                              : "Unknown"}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {idrFormat(sale.price)}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {sale.payment_method}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {sale.description || "-"}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-700"
                                onClick={() => handleDeleteClick(sale.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <NewSaleDialog
        open={showNewSaleDialog}
        onClose={() => setShowNewSaleDialog(false)}
        onSubmit={handleNewSale}
      />

      <DeleteSaleDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        saleId={selectedSaleId || ""}
      />
    </div>
  );
}
