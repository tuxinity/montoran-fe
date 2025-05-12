"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import CarApi from "@/lib/car-api";
import type { Car, BodyType, Brand } from "@/types/car";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { CarFilters } from "@/components/car-filters";
import debounce from "lodash/debounce";
import { idrFormat } from "@/utils/idr-format";
import { CarForm } from "@/components/car-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FilterValues } from "@/types/car";
import { QrCode } from "lucide-react";
import { CarQRCode } from "@/components/car/car-qr-code";
import { pb } from "@/lib/pocketbase";

type ModalType = "create" | "edit" | "delete" | null;

const DashboardPage = () => {
  const { toast } = useToast();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [filters, setFilters] = useState<FilterValues>({});
  const [search, setSearch] = useState<string>("");
  const [bodyTypes, setBodyTypes] = useState<BodyType[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [pageLoaded, setPageLoaded] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [carForQr, setCarForQr] = useState<Car | null>(null);

  const loadCars = useCallback(async () => {
    setLoading(true);
    try {
      const filterRules: string[] = [];

      if (search) {
        filterRules.push(`model.name ~ "${search}"`);
      }

      if (filters?.brand) {
        filterRules.push(`model.brand = "${filters.brand}"`);
      }

      if (filters?.bodyType) {
        filterRules.push(`model.body_type = "${filters.bodyType}"`);
      }

      if (filters?.transmission) {
        filterRules.push(`transmission = "${filters.transmission}"`);
      }

      if (filters?.minPrice) {
        filterRules.push(`sell_price >= ${filters.minPrice}`);
      }

      if (filters?.maxPrice) {
        filterRules.push(`sell_price <= ${filters.maxPrice}`);
      }

      if (filters?.soldStatus === "sold") {
        filterRules.push(`is_sold = true`);
      } else if (filters?.soldStatus === "available") {
        filterRules.push(`is_sold = false`);
      }
      // If soldStatus is "all" or undefined, we don't add a filter, showing all cars

      const carData = await pb.collection("cars").getFullList<Car>({
        sort: "-created",
        expand: "model.brand,model.body_type",
        filter: filterRules.length > 0 ? filterRules.join(" && ") : undefined,
        $autoCancel: false,
      });
      setCars(carData);
    } catch (error) {
      console.error("Error loading cars:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load cars. Please try again.",
      });
    } finally {
      setLoading(false);
      setPageLoaded(true);
    }
  }, [search, filters, toast]);

  const debouncedLoadCars = useMemo(
    () => debounce(() => loadCars(), 500),
    [loadCars]
  );

  const handleSearch = useCallback(
    (value: string) => {
      setSearch(value);
      debouncedLoadCars();
    },
    [debouncedLoadCars]
  );

  const handleFilterChange = useCallback(
    (newFilters: FilterValues) => {
      setFilters(newFilters);
      debouncedLoadCars();
    },
    [debouncedLoadCars]
  );

  const loadMasterData = useCallback(async () => {
    try {
      const [bodyTypesData, brandsData] = await Promise.all([
        CarApi.getBodyTypes(),
        CarApi.getBrands(),
      ]);
      setBodyTypes(bodyTypesData);
      setBrands(brandsData);
    } catch (error) {
      console.error("Error fetching master data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load master data.",
      });
    }
  }, [toast]);

  // Gunakan useEffect dengan dependensi kosong untuk inisialisasi
  useEffect(() => {
    loadMasterData();
    loadCars();

    return () => {
      debouncedLoadCars.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Hapus dependensi untuk menghindari loop

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    try {
      if (modalType === "edit" && selectedCar) {
        await CarApi.updateCar(selectedCar.id, formData);
        toast({
          title: "Success",
          description: "Car has been updated successfully.",
        });
      } else {
        await CarApi.createCar(formData);
        toast({
          title: "Success",
          description: "New car has been added successfully.",
        });
      }

      // Tutup modal sebelum memuat ulang data
      closeModal();

      // Muat ulang data setelah modal ditutup
      setTimeout(() => {
        loadCars();
      }, 100);
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save car data.",
      });
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCar) return;

    setLoading(true);
    try {
      await CarApi.deleteCar(selectedCar.id);

      // Tutup modal sebelum memuat ulang data
      closeModal();

      // Muat ulang data setelah modal ditutup
      setTimeout(() => {
        loadCars();
      }, 100);

      toast({
        title: "Success",
        description: "Car has been deleted successfully.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete car",
      });
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (type: ModalType, car?: Car) => {
    setModalType(type);
    setSelectedCar(car || null);
  };

  const closeModal = useCallback(() => {
    setModalType(null);
    setSelectedCar(null);
  }, []);

  const openQrModal = (car: Car) => {
    setCarForQr(car);
    setQrModalOpen(true);
  };

  const renderCarForm = () => {
    if (modalType === "create") {
      return (
        <CarForm
          open={true}
          onClose={closeModal}
          onSubmit={handleSubmit}
          loading={loading}
          modalType="create"
          bodyTypes={bodyTypes}
          brands={brands}
        />
      );
    }

    if (modalType === "edit" && selectedCar) {
      return (
        <CarForm
          open={true}
          onClose={closeModal}
          onSubmit={handleSubmit}
          loading={loading}
          modalType="edit"
          bodyTypes={bodyTypes}
          selectedCar={selectedCar}
          brands={brands}
        />
      );
    }

    return null;
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Actions */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start justify-between gap-4">
            <div className="w-full">
              <CarFilters
                onSearch={handleSearch}
                onFilterChange={handleFilterChange}
              />
            </div>
            <Button
              onClick={() => openModal("create")}
              className="bg-blue-600 hover:bg-blue-700 text-white w-full md:w-auto"
              size="lg"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Add New Car
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table Container */}
      <Card>
        <CardContent className="p-0">
          {loading && !pageLoaded ? (
            <div className="p-8">
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-1/5" />
                    <Skeleton className="h-12 w-1/5" />
                    <Skeleton className="h-12 w-1/5" />
                    <Skeleton className="h-12 w-1/5" />
                    <Skeleton className="h-12 w-1/5" />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Brand
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Model
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Price
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Transmission
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {cars.length === 0 && !loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <svg
                            className="w-16 h-16 text-gray-300 mb-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1}
                              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                          </svg>
                          <h3 className="text-lg font-medium text-gray-900 mb-1">
                            No cars found
                          </h3>
                          <p className="text-gray-500 mb-4">
                            Try adjusting your search or filters
                          </p>
                          <Button
                            onClick={() => openModal("create")}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            Add Your First Car
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    cars.map((car) => (
                      <tr
                        key={car.id}
                        className={`hover:bg-gray-50 transition-colors ${
                          car.is_sold ? "bg-gray-50" : ""
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {car.expand?.model?.expand?.brand?.name || "—"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {car.expand?.model?.name || "—"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                          {idrFormat(car.sell_price)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge
                            variant="outline"
                            className="capitalize bg-blue-50 text-blue-700 border-blue-200"
                          >
                            {car.transmission}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {car.is_sold ? (
                            <Badge
                              variant="outline"
                              className="capitalize bg-red-50 text-red-700 border-red-200"
                            >
                              Sold
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="capitalize bg-green-50 text-green-700 border-green-200"
                            >
                              Available
                            </Badge>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openModal("edit", car)}
                              className="text-blue-600 border-blue-200 hover:bg-blue-50"
                            >
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => openModal("delete", car)}
                              className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                            >
                              Delete
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openQrModal(car)}
                              className="text-blue-600 border-blue-200 hover:bg-blue-50"
                            >
                              <QrCode className="h-4 w-4 mr-1" />
                              QR Code
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              {loading && pageLoaded && (
                <div className="flex justify-center py-4 bg-gray-50 bg-opacity-50">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm text-gray-500">Loading...</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {renderCarForm()}

      {/* Delete Confirmation Dialog */}
      <Dialog open={modalType === "delete"} onOpenChange={() => closeModal()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Car</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this car? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 p-4 bg-red-50 rounded-md border border-red-100">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  {selectedCar?.expand?.model?.expand?.brand?.name}{" "}
                  {selectedCar?.expand?.model?.name}
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>
                    This will permanently remove this car from your inventory.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="flex space-x-2 justify-end">
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Deleting...
                </>
              ) : (
                "Delete Car"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {carForQr && (
        <CarQRCode
          car={carForQr}
          isOpen={qrModalOpen}
          onClose={() => setQrModalOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardPage;
