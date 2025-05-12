"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CustomersApi } from "@/lib/customers-api";
import { Customer } from "@/types/customer";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface AddCustomerDialogProps {
  onCustomerAdded: (customer: Customer) => void;
}

export function AddCustomerDialog({ onCustomerAdded }: AddCustomerDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [errors, setErrors] = useState({
    name: "",
    phone: "",
    email: "",
  });
  const [touched, setTouched] = useState({
    name: false,
    phone: false,
    email: false,
  });

  const validatePhone = (phone: string) => {
    if (!touched.phone) return "";

    // Check if it's a valid Indonesian phone number
    // Format: 0 followed by 8-13 digits
    const isValid = /^0[0-9]{8,13}$/.test(phone);

    if (!isValid) {
      return "Please enter a valid phone number (e.g., 08123456789)";
    }
    return "";
  };

  const validateEmail = (email: string) => {
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "Please enter a valid email address";
    }
    return "";
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers
    const value = e.target.value.replace(/\D/g, "");
    setNewCustomer({ ...newCustomer, phone: value });
    setTouched({ ...touched, phone: true });
    setErrors({ ...errors, phone: validatePhone(value) });
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewCustomer({ ...newCustomer, email: value });
    setErrors({ ...errors, email: validateEmail(value) });
  };

  const handleAddCustomer = async () => {
    // Mark all fields as touched when submitting
    setTouched({
      name: true,
      phone: true,
      email: true,
    });

    // Validate all fields
    const nameError = !newCustomer.name ? "Name is required" : "";
    const phoneError = validatePhone(newCustomer.phone);
    const emailError = validateEmail(newCustomer.email);

    setErrors({
      name: nameError,
      phone: phoneError,
      email: emailError,
    });

    if (nameError || phoneError || emailError) {
      return;
    }

    setIsLoading(true);
    try {
      const record = await CustomersApi.createCustomer(newCustomer);
      onCustomerAdded(record);
      setNewCustomer({
        name: "",
        email: "",
        phone: "",
        address: "",
      });
      setOpen(false);
      toast({
        title: "Success",
        description: "Customer added successfully",
      });
    } catch (error: Error | unknown) {
      if (
        error instanceof Error &&
        error.message === "Phone number already exists"
      ) {
        setErrors({
          ...errors,
          phone: "This phone number is already registered",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to add customer",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Customer
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Customer</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Enter customer name"
                value={newCustomer.name}
                onChange={(e) => {
                  setNewCustomer({ ...newCustomer, name: e.target.value });
                  setErrors({ ...errors, name: "" });
                }}
                className={cn(errors.name && "border-red-500")}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="08123456789"
                value={newCustomer.phone}
                onChange={handlePhoneChange}
                className={cn(
                  touched.phone && errors.phone && "border-red-500"
                )}
              />
              {touched.phone && errors.phone && (
                <p className="text-sm text-red-500">{errors.phone}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email (Optional)</Label>
              <Input
                id="email"
                type="email"
                placeholder="customer@example.com"
                value={newCustomer.email}
                onChange={handleEmailChange}
                className={cn(errors.email && "border-red-500")}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="address">Address (Optional)</Label>
              <Input
                id="address"
                placeholder="Enter customer address"
                value={newCustomer.address}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, address: e.target.value })
                }
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddCustomer} disabled={isLoading}>
            {isLoading ? "Adding..." : "Add Customer"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
