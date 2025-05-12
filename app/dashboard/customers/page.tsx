"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Download, Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { CustomersApi } from "@/lib/customers-api";
import { Customer } from "@/types/customer";
import { AddCustomerDialog } from "@/components/add-customer-dialog";
import { DeleteCustomerDialog } from "@/components/delete-customer-dialog";
import { pb } from "@/lib/pocketbase";

export default function CustomersPage() {
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(
    null
  );

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const records = await CustomersApi.getCustomers(
        search ? { search } : undefined
      );
      setCustomers(records);
    } catch {
      toast({
        title: "Error",
        description: "Failed to load customers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [search, toast]);

  useEffect(() => {
    loadCustomers();
  }, [search, loadCustomers]);

  const handleCustomerAdded = (customer: Customer) => {
    setCustomers([customer, ...customers]);
  };

  const handleDeleteCustomer = async (customer: Customer) => {
    try {
      await CustomersApi.deleteCustomer(
        customer.id,
        pb.authStore.record?.id || ""
      );
      setCustomers(customers.filter((c) => c.id !== customer.id));
      toast({
        title: "Success",
        description: "Customer deleted successfully",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete customer",
        variant: "destructive",
      });
    }
  };

  const exportToCSV = () => {
    if (customers.length === 0) return;

    const headers = ["Name", "Phone", "Email", "Address"];
    const csvData = customers.map((customer) => [
      customer.name,
      customer.phone,
      customer.email || "",
      customer.address || "",
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
      `customers_export_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex flex-col gap-4 md:gap-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <h1 className="text-xl md:text-2xl font-bold">Customers</h1>
          <div className="flex gap-2">
            <AddCustomerDialog onCustomerAdded={handleCustomerAdded} />
            <Button onClick={exportToCSV} disabled={customers.length === 0}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Customers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{customers.length}</div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or phone..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[200px] px-6 py-4">Name</TableHead>
                    <TableHead className="w-[200px] px-6 py-4">Email</TableHead>
                    <TableHead className="w-[150px] px-6 py-4">Phone</TableHead>
                    <TableHead className="px-6 py-4">Address</TableHead>
                    <TableHead className="w-[100px] px-6 py-4 text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array(5)
                      .fill(0)
                      .map((_, index) => (
                        <TableRow key={index}>
                          {[1, 2, 3, 4, 5].map((col) => (
                            <TableCell key={col} className="px-6 py-4">
                              <Skeleton className="h-5 w-24" />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                  ) : customers.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="h-24 px-6 py-4 text-center text-muted-foreground"
                      >
                        No customers found. Try adjusting your search.
                      </TableCell>
                    </TableRow>
                  ) : (
                    customers.map((customer) => (
                      <TableRow key={customer.id} className="hover:bg-muted/50">
                        <TableCell className="px-6 py-4 font-medium">
                          {customer.name}
                        </TableCell>
                        <TableCell className="px-6 py-4 text-muted-foreground">
                          {customer.email || "-"}
                        </TableCell>
                        <TableCell className="px-6 py-4 font-medium">
                          {customer.phone ? `+62${customer.phone}` : "-"}
                        </TableCell>
                        <TableCell className="px-6 py-4 text-muted-foreground">
                          {customer.address || "-"}
                        </TableCell>
                        <TableCell className="px-6 py-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => setCustomerToDelete(customer)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
      <DeleteCustomerDialog
        customer={customerToDelete}
        onClose={() => setCustomerToDelete(null)}
        onConfirm={handleDeleteCustomer}
      />
    </div>
  );
}
