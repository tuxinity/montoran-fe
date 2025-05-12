"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Loader2 } from "lucide-react";
import { Sale } from "@/types/sales";
import AuthApi from "@/lib/auth-api";
import { useToast } from "@/hooks/use-toast";
import { useAvailableCars } from "@/hooks/use-cars";
import { useCustomers, useCreateCustomer } from "@/hooks/use-customers";

interface NewSaleDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Sale, "id">) => Promise<void>;
  preselectedCarId?: string;
}

export const NewSaleDialog = ({
  open,
  onClose,
  onSubmit,
  preselectedCarId,
}: NewSaleDialogProps) => {
  const { toast } = useToast();
  const [customerId, setCustomerId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [carId, setCarId] = useState("");
  const [price, setPrice] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [description, setDescription] = useState("");
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });
  const [customerErrors, setCustomerErrors] = useState({
    name: "",
    phone: "",
  });

  // Use React Query hooks
  const { data: cars = [], isLoading: carsLoading } = useAvailableCars();

  const { data: customers = [], isLoading: customersLoading } = useCustomers();

  const createCustomerMutation = useCreateCustomer();

  const resetForm = useCallback(() => {
    setCustomerId("");
    setCustomerName("");
    setCarId("");
    setPrice("");
    setPaymentMethod("Cash");
    setDescription("");
    setIsAddingCustomer(false);
    setNewCustomer({
      name: "",
      phone: "",
      email: "",
      address: "",
    });
    setCustomerErrors({
      name: "",
      phone: "",
    });
  }, []);

  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open, resetForm]);

  useEffect(() => {
    if (preselectedCarId) {
      setCarId(preselectedCarId);
    }
  }, [preselectedCarId]);

  const handleCarSelect = (carId: string) => {
    setCarId(carId);
    const selectedCar = cars.find((car) => car.id === carId);
    if (selectedCar) {
      setPrice(selectedCar.sell_price.toString());
    }
  };

  const handleCustomerSelect = (value: string) => {
    if (value === "add-new") {
      setIsAddingCustomer(true);
      setCustomerId("");
      setCustomerName("");
    } else {
      setCustomerId(value);
      const selectedCustomer = customers.find(
        (customer) => customer.id === value
      );
      if (selectedCustomer) {
        setCustomerName(selectedCustomer.name);
      }
    }
  };

  const validatePhone = (phone: string) => {
    // Check if it's a valid Indonesian phone number
    // Format: 0 followed by 8-13 digits
    const isValid = /^0[0-9]{8,13}$/.test(phone);

    if (!isValid) {
      return "Please enter a valid phone number (e.g., 08123456789)";
    }
    return "";
  };

  const handleAddCustomer = async () => {
    // Validate customer data
    const nameError = !newCustomer.name ? "Name is required" : "";
    const phoneError = !newCustomer.phone
      ? "Phone is required"
      : validatePhone(newCustomer.phone);

    setCustomerErrors({
      name: nameError,
      phone: phoneError,
    });

    if (nameError || phoneError) {
      return;
    }

    try {
      // Use the mutation to create a customer
      const customer = await createCustomerMutation.mutateAsync(newCustomer);

      // Update local state
      setCustomerId(customer.id);
      setCustomerName(customer.name);
      setIsAddingCustomer(false);
      setNewCustomer({
        name: "",
        phone: "",
        email: "",
        address: "",
      });

      toast({
        title: "Success",
        description: "Customer added successfully",
      });
    } catch (error: Error | unknown) {
      if (
        error instanceof Error &&
        error.message === "Phone number already exists"
      ) {
        setCustomerErrors({
          ...customerErrors,
          phone: "This phone number is already registered",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to add customer",
        });
      }
    }
  };

  const formatPrice = (value: string) => {
    // Remove all non-digit characters
    const numericValue = value.replace(/\D/g, "");

    // Format with commas
    const formattedValue = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    return formattedValue;
  };

  const parsePrice = (value: string) => {
    return parseFloat(value.replace(/,/g, ""));
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatPrice(e.target.value);
    setPrice(formattedValue);
  };

  const handleSubmit = () => {
    if (!customerId && !customerName) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select or add a customer",
      });
      return;
    }

    if (!carId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a car",
      });
      return;
    }

    if (!price) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter price",
      });
      return;
    }

    if (!AuthApi.isLoggedIn()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "User not authenticated",
      });
      return;
    }

    const currentUser = AuthApi.getCurrentUser()?.id;
    if (!currentUser) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to get user information",
      });
      return;
    }

    const saleData: Omit<Sale, "id"> = {
      customer_name: customerName,
      car: carId,
      price: parsePrice(price),
      payment_method: paymentMethod,
      description: description || undefined,
      created_by: currentUser,
    };

    onSubmit(saleData);
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Sale</DialogTitle>
          <DialogDescription>
            Add a new sale record to the system.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {!isAddingCustomer ? (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="customer" className="text-right">
                Customer
              </Label>
              <Select value={customerId} onValueChange={handleCustomerSelect}>
                <SelectTrigger className="col-span-3" id="customer">
                  <SelectValue placeholder="Select a customer" />
                </SelectTrigger>
                <SelectContent>
                  {customersLoading ? (
                    <SelectItem value="loading" disabled>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading customers...
                    </SelectItem>
                  ) : customers.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No customers available
                    </SelectItem>
                  ) : (
                    <>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name} -{" "}
                          {customer.phone ? `+62${customer.phone}` : "No Phone"}
                        </SelectItem>
                      ))}
                      <SelectItem
                        value="add-new"
                        className="text-primary font-medium"
                      >
                        <div className="flex items-center">
                          <Plus className="mr-2 h-4 w-4" />
                          Add New Customer
                        </div>
                      </SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Add New Customer</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsAddingCustomer(false)}
                >
                  Cancel
                </Button>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="newCustomerName">Name</Label>
                  <Input
                    id="newCustomerName"
                    value={newCustomer.name}
                    onChange={(e) =>
                      setNewCustomer({ ...newCustomer, name: e.target.value })
                    }
                    placeholder="Customer name"
                    className={customerErrors.name ? "border-red-500" : ""}
                  />
                  {customerErrors.name && (
                    <p className="text-sm text-red-500">
                      {customerErrors.name}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="newCustomerPhone">Phone</Label>
                  <Input
                    id="newCustomerPhone"
                    value={newCustomer.phone}
                    onChange={(e) => {
                      // Only allow numbers
                      const value = e.target.value.replace(/\D/g, "");
                      setNewCustomer({ ...newCustomer, phone: value });
                    }}
                    placeholder="08123456789"
                    className={customerErrors.phone ? "border-red-500" : ""}
                  />
                  {customerErrors.phone && (
                    <p className="text-sm text-red-500">
                      {customerErrors.phone}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="newCustomerEmail">Email (Optional)</Label>
                  <Input
                    id="newCustomerEmail"
                    type="email"
                    value={newCustomer.email}
                    onChange={(e) =>
                      setNewCustomer({ ...newCustomer, email: e.target.value })
                    }
                    placeholder="customer@example.com"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="newCustomerAddress">Address (Optional)</Label>
                  <Input
                    id="newCustomerAddress"
                    value={newCustomer.address}
                    onChange={(e) =>
                      setNewCustomer({
                        ...newCustomer,
                        address: e.target.value,
                      })
                    }
                    placeholder="Customer address"
                  />
                </div>

                <Button onClick={handleAddCustomer} className="w-full">
                  Add Customer
                </Button>
              </div>
            </div>
          )}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="car" className="text-right">
              Car
            </Label>
            <Select value={carId} onValueChange={handleCarSelect}>
              <SelectTrigger className="col-span-3" id="car">
                <SelectValue placeholder="Select a car" />
              </SelectTrigger>
              <SelectContent>
                {carsLoading ? (
                  <SelectItem value="loading" disabled>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading cars...
                  </SelectItem>
                ) : cars.length === 0 ? (
                  <SelectItem value="none" disabled>
                    No cars available
                  </SelectItem>
                ) : (
                  cars.map((car) => (
                    <SelectItem key={car.id} value={car.id}>
                      {car.expand?.model.expand?.brand.name}{" "}
                      {car.expand?.model.name} - {car.year} -{" "}
                      {car.expand?.model.expand?.body_type.name} - IDR{" "}
                      {car.sell_price.toLocaleString()}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right">
              Price
            </Label>
            <div className="col-span-3 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                IDR
              </span>
              <Input
                id="price"
                value={price}
                onChange={handlePriceChange}
                className="pl-12"
                placeholder="0"
              />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="payment" className="text-right">
              Payment
            </Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger className="col-span-3" id="payment">
                <SelectValue placeholder="Payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Cash">Cash</SelectItem>
                <SelectItem value="Credit">Credit</SelectItem>
                <SelectItem value="Transfer">Bank Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="description" className="text-right pt-2">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
              placeholder="Add description about this sale"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Save Sale</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
