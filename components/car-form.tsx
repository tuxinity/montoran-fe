"use client";

import React, { useEffect, useState } from "react";
import { useForm, type FieldValues } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, X, Trash2, Upload } from "lucide-react";
import type { Car, BodyType, Brand, Model } from "@/types/car";
import Image from "next/image";
import CarApi from "@/lib/car-api";
import { useToast } from "@/hooks/use-toast";
import { useMediaQuery } from "@/hooks/use-media-query";

interface CarFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
  loading: boolean;
  modalType: "create" | "edit";
  bodyTypes: BodyType[];
  brands: Brand[];
  selectedCar?: Car;
  onBrandAdded?: () => Promise<void>;
  onModelAdded?: () => Promise<void>;
}

const TRANSMISSION_OPTIONS = [
  { label: "Automatic", value: "Automatic" },
  { label: "Manual", value: "Manual" },
] as const;

export function CarForm({
  open,
  onClose,
  onSubmit,
  loading,
  modalType,
  bodyTypes,
  brands,
  selectedCar,
  onBrandAdded,
  onModelAdded,
}: CarFormProps) {
  const { toast } = useToast();
  const { register, handleSubmit, reset, watch, setValue } = useForm();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [models, setModels] = useState<Model[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isAddingBrand, setIsAddingBrand] = useState(false);
  const [newBrand, setNewBrand] = useState({ name: "" });
  const [brandsState, setBrandsState] = useState<Brand[]>(brands);
  const [isAddingModel, setIsAddingModel] = useState(false);
  const [newModel, setNewModel] = useState({
    name: "",
    bodyTypeId: "",
    seats: 0,
    cc: 0,
    bags: 0,
  });
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [isFormChanged, setIsFormChanged] = useState(false);

  const filteredModels = selectedBrand
    ? models.filter((model) => model.brand === selectedBrand)
    : models;

  useEffect(() => {
    if (selectedCar && modalType === "edit") {
      const brandId = selectedCar.expand?.model?.brand;
      if (brandId) setSelectedBrand(brandId);

      const initialValues = {
        model: selectedCar.model || "",
        condition: selectedCar.condition || "",
        transmission: selectedCar.transmission || "",
        mileage: selectedCar.mileage || "",
        buy_price: selectedCar.buy_price || "",
        sell_price: selectedCar.sell_price || "",
        year: selectedCar.year || "",
        description: selectedCar.description || "",
      };

      reset(initialValues);
      setIsFormChanged(false);
      setExistingImages(selectedCar.images || []);
      setImageFiles([]);
    } else if (modalType === "create") {
      reset({
        model: "",
        year: "",
        condition: "",
        mileage: "",
        buy_price: "",
        sell_price: "",
        transmission: "",
        description: "",
      });
      setSelectedBrand("");
      setExistingImages([]);
      setImageFiles([]);
    }
  }, [selectedCar, modalType, reset, open]);

  useEffect(() => {
    setBrandsState(brands);
  }, [brands]);

  useEffect(() => {
    const loadModels = async () => {
      if (selectedBrand) {
        setIsLoadingModels(true);
        try {
          const modelData = await CarApi.getModels({
            filter: `brand="${selectedBrand}"`,
          });
          setModels(modelData);
        } catch (error) {
          console.error("Error loading models:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load models",
          });
        } finally {
          setIsLoadingModels(false);
        }
      }
    };

    loadModels();
  }, [selectedBrand, toast]);

  useEffect(() => {
    // Hapus URL lama
    previewUrls.forEach((url) => URL.revokeObjectURL(url));

    // Buat URL baru
    const urls = imageFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);

    // Cleanup saat unmount
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [imageFiles]); // Hapus previewUrls dari dependensi

  useEffect(() => {
    if (modalType === "edit") {
      const subscription = watch((value, { type }) => {
        if (type === "change") {
          const hasChanged = Object.keys(value).some((key) => {
            const formValue = value[key];
            const carValue = selectedCar?.[key as keyof Car];
            return formValue !== carValue;
          });
          setIsFormChanged(hasChanged);
        }
      });
      return () => subscription.unsubscribe();
    }
  }, [watch, modalType, selectedCar]);

  const onSubmitForm = async (data: FieldValues) => {
    try {
      if (!selectedBrand) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please select a brand first",
        });
        return;
      }

      const formData = new FormData();
      const typedData = data as FieldValues;
      const selectedModel = models.find(
        (model) => model.id === typedData.model
      );

      if (!selectedModel) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please select a valid model",
        });
        return;
      }

      const carData = {
        model: selectedModel.name,
        brand: brandsState.find((b) => b.id === selectedBrand)?.name || "",
        body_type: selectedModel.expand?.body_type?.name || "",
        condition: Number.parseInt(typedData.condition),
        transmission: typedData.transmission as "Automatic" | "Manual",
        mileage: Number.parseInt(typedData.mileage),
        buy_price: Number.parseInt(typedData.buy_price),
        sell_price: Number.parseInt(typedData.sell_price),
        year: Number.parseInt(typedData.year),
        description: typedData.description,
      };

      Object.entries(carData).forEach(([key, value]) => {
        formData.append(key, value.toString());
      });

      imageFiles.forEach((file) => {
        formData.append("images", file);
      });

      await onSubmit(formData);

      toast({
        title: "Success",
        description: `Car ${
          modalType === "create" ? "created" : "updated"
        } successfully`,
      });

      onClose();
    } catch (error) {
      console.error("Form submission error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to ${
          modalType === "create" ? "create" : "update"
        } car`,
      });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setImageFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddBrand = async () => {
    try {
      const newBrandData = await CarApi.createBrand({
        name: newBrand.name,
      });

      setBrandsState((prevBrands) => [...prevBrands, newBrandData]);
      setSelectedBrand(newBrandData.id);

      if (onBrandAdded) {
        await onBrandAdded();
      }

      setIsAddingBrand(false);
      setNewBrand({ name: "" });

      toast({
        title: "Success",
        description: `Brand "${newBrandData.name}" added successfully`,
      });
    } catch (error) {
      console.error("Error adding brand:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add brand",
      });
    }
  };

  const handleAddModel = async () => {
    try {
      if (!selectedBrand || !newModel.name || !newModel.bodyTypeId) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please fill all required fields",
        });
        return;
      }

      const newModelData = await CarApi.createModel({
        name: newModel.name,
        brand: selectedBrand,
        body_type: newModel.bodyTypeId,
        seats: newModel.seats,
        cc: newModel.cc,
        bags: newModel.bags,
      });

      setModels((prevModels) => [...prevModels, newModelData]);
      setValue("model", newModelData.id);
      setNewModel({
        name: "",
        bodyTypeId: "",
        seats: 0,
        cc: 0,
        bags: 0,
      });
      setIsAddingModel(false);

      if (onModelAdded) {
        await onModelAdded();
      } else {
        const updatedModels = await CarApi.getModels({
          filter: `brand="${selectedBrand}"`,
        });
        setModels(updatedModels);
      }

      toast({
        title: "Success",
        description: "Model added successfully",
      });
    } catch (error) {
      console.error("Error adding model:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add model",
      });
    }
  };

  const handleEditModel = async () => {
    try {
      if (!selectedBrand || !newModel.name || !newModel.bodyTypeId) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please fill all required fields",
        });
        return;
      }

      const currentModelId = watch("model");

      const updatedModel = await CarApi.updateModel(currentModelId, {
        name: newModel.name,
        brand: selectedBrand,
        body_type: newModel.bodyTypeId,
        seats: newModel.seats,
        cc: newModel.cc,
        bags: newModel.bags,
      });

      setModels((prevModels) =>
        prevModels.map((model) =>
          model.id === updatedModel.id ? updatedModel : model
        )
      );

      setNewModel({
        name: "",
        bodyTypeId: "",
        seats: 0,
        cc: 0,
        bags: 0,
      });
      setIsAddingModel(false);

      if (onModelAdded) {
        await onModelAdded();
      } else {
        const updatedModels = await CarApi.getModels({
          filter: `brand="${selectedBrand}"`,
        });
        setModels(updatedModels);
      }

      toast({
        title: "Success",
        description: "Model updated successfully",
      });
    } catch (error) {
      console.error("Error updating model:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update model",
      });
    }
  };

  const handleEditModelClick = async () => {
    const selectedModelId = watch("model");
    const selectedModel = models.find((model) => model.id === selectedModelId);

    if (selectedModel) {
      setNewModel({
        name: selectedModel.name,
        bodyTypeId: selectedModel.body_type,
        seats: selectedModel.seats,
        cc: selectedModel.cc,
        bags: selectedModel.bags,
      });
      setIsAddingModel(true);
    }
  };

  const FormContent = (
    <form className="space-y-6" id="car-form">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Car Selection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <Label className="text-sm font-medium">Select Brand</Label>
              <Popover open={isAddingBrand} onOpenChange={setIsAddingBrand}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2 text-sm"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    New Brand
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-72 p-4"
                  side={isDesktop ? "top" : "bottom"}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b pb-2">
                      <h5 className="font-medium">Add New Brand</h5>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsAddingBrand(false)}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <Label>Brand Name</Label>
                      <Input
                        value={newBrand.name}
                        onChange={(e) => setNewBrand({ name: e.target.value })}
                        placeholder="Enter brand name"
                      />
                    </div>
                    <Button
                      className="w-full"
                      onClick={handleAddBrand}
                      disabled={!newBrand.name}
                    >
                      Add Brand
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <Select
              value={selectedBrand}
              onValueChange={(value) => {
                setSelectedBrand(value);
                setValue("model", "");
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a brand" />
              </SelectTrigger>
              <SelectContent>
                {brandsState.map((brand) => (
                  <SelectItem key={brand.id} value={brand.id}>
                    {brand.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <Label className="text-sm font-medium">Select Car Model</Label>
              <Popover open={isAddingModel} onOpenChange={setIsAddingModel}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2 text-sm"
                    disabled={
                      !selectedBrand ||
                      (modalType === "edit" && !watch("model"))
                    }
                    onClick={
                      modalType === "edit" ? handleEditModelClick : undefined
                    }
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    {modalType === "edit" ? "Edit Model" : "New Model"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[min(80vw,320px)] p-4"
                  side={isDesktop ? "top" : "bottom"}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b pb-2">
                      <h4 className="font-medium">
                        {modalType === "edit" ? "Edit Model" : "Add New Model"}
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsAddingModel(false)}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Model Name</Label>
                        <Input
                          value={newModel.name}
                          onChange={(e) =>
                            setNewModel((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          placeholder="Enter model name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Body Type</Label>
                        <Select
                          value={newModel.bodyTypeId}
                          onValueChange={(value) =>
                            setNewModel((prev) => ({
                              ...prev,
                              bodyTypeId: value,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Type" />
                          </SelectTrigger>
                          <SelectContent>
                            {bodyTypes.map((type) => (
                              <SelectItem key={type.id} value={type.id}>
                                {type.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-2">
                          <Label>Seats</Label>
                          <Input
                            type="number"
                            value={newModel.seats}
                            onChange={(e) =>
                              setNewModel((prev) => ({
                                ...prev,
                                seats: Number.parseInt(e.target.value) || 0,
                              }))
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Engine (CC)</Label>
                          <Input
                            type="number"
                            value={newModel.cc}
                            onChange={(e) =>
                              setNewModel((prev) => ({
                                ...prev,
                                cc: Number.parseInt(e.target.value) || 0,
                              }))
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Bags</Label>
                          <Input
                            type="number"
                            value={newModel.bags}
                            onChange={(e) =>
                              setNewModel((prev) => ({
                                ...prev,
                                bags: Number.parseInt(e.target.value) || 0,
                              }))
                            }
                          />
                        </div>
                      </div>
                      <Button
                        className="w-full"
                        onClick={
                          modalType === "edit"
                            ? handleEditModel
                            : handleAddModel
                        }
                        disabled={
                          !newModel.name ||
                          !newModel.bodyTypeId ||
                          !selectedBrand
                        }
                      >
                        {modalType === "edit" ? "Update Model" : "Add Model"}
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <Select
              value={watch("model") || ""}
              onValueChange={(value) => setValue("model", value)}
              disabled={!selectedBrand || isLoadingModels}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    isLoadingModels ? "Loading models..." : "Choose a model"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {!isLoadingModels &&
                  filteredModels.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.name} - {model.expand?.body_type?.name} •{" "}
                      {model.seats} seats • {model.cc}cc
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Car Specifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Year</Label>
              <Input
                type="number"
                {...register("year", { required: true })}
                placeholder="e.g., 2023"
                defaultValue={selectedCar?.year || ""}
              />
            </div>
            <div className="space-y-2">
              <Label>Condition (%)</Label>
              <Input
                type="number"
                {...register("condition", {
                  required: true,
                  min: 0,
                  max: 100,
                })}
                placeholder="e.g., 90 (0-100)"
                defaultValue={selectedCar?.condition || ""}
              />
            </div>
            <div className="space-y-2">
              <Label>Transmission</Label>
              <Select
                defaultValue={selectedCar?.transmission || ""}
                onValueChange={(value) => setValue("transmission", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {TRANSMISSION_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Mileage (km)</Label>
              <Input
                type="number"
                {...register("mileage", { required: true })}
                placeholder="e.g., 5000"
                defaultValue={selectedCar?.mileage || ""}
              />
            </div>
            <div className="space-y-2">
              <Label>Buy Price</Label>
              <Input
                type="number"
                {...register("buy_price", { required: true })}
                placeholder="Enter amount"
                defaultValue={selectedCar?.buy_price || ""}
              />
            </div>
            <div className="space-y-2">
              <Label>Sell Price</Label>
              <Input
                type="number"
                {...register("sell_price", { required: true })}
                placeholder="Enter amount"
                defaultValue={selectedCar?.sell_price || ""}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Additional Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              {...register("description", { required: true })}
              placeholder="Enter detailed description of the car..."
              defaultValue={selectedCar?.description || ""}
              className="min-h-24"
            />
          </div>
          <div className="space-y-2">
            <Label>Images</Label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4 text-center">
              <label
                htmlFor="car-images"
                className="cursor-pointer flex flex-col items-center justify-center gap-2"
              >
                <Upload className="h-8 w-8 text-gray-500" />
                <span className="text-sm font-medium">
                  Click to upload or drag images here
                </span>
                <span className="text-xs text-gray-500">
                  JPG, PNG (max 5MB each)
                </span>
                <Input
                  id="car-images"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-3">
              {existingImages.map((image, index) => (
                <div
                  key={index}
                  className="relative group aspect-square bg-gray-100 rounded-md overflow-hidden"
                >
                  <Image
                    src={
                      selectedCar ? CarApi.getImageUrl(selectedCar, image) : ""
                    }
                    alt={`Car image ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                  />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(index)}
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                  >
                    <Trash2 className="h-6 w-6 text-white" />
                  </button>
                </div>
              ))}
              {imageFiles.map((file, index) => (
                <div
                  key={`new-${index}`}
                  className="relative group aspect-square bg-gray-100 rounded-md overflow-hidden"
                >
                  <Image
                    src={URL.createObjectURL(file) || "/placeholder.svg"}
                    alt={`New car image ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                    onLoad={(e) => {
                      URL.revokeObjectURL((e.target as HTMLImageElement).src);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                  >
                    <Trash2 className="h-6 w-6 text-white" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  );

  const FormActions = (
    <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
      <Button
        type="button"
        variant="outline"
        onClick={onClose}
        className="w-full sm:w-auto"
      >
        Cancel
      </Button>
      <Button
        type="submit"
        form="car-form"
        onClick={handleSubmit(onSubmitForm)}
        disabled={loading || (modalType === "edit" && !isFormChanged)}
        className="w-full sm:w-auto"
      >
        {loading
          ? "Saving..."
          : modalType === "create"
          ? "Create Car"
          : "Update Car"}
      </Button>
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] p-0">
          <DialogTitle className="text-xl font-semibold p-4 border-b">
            {modalType === "create" ? "Add New Car" : "Edit Car"}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {modalType === "create" ? "Add a new car" : "Edit car details"}
          </DialogDescription>
          <div className="max-h-[calc(90vh-10rem)] overflow-y-auto p-4">
            {FormContent}
          </div>
          <div className="p-4 border-t flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="car-form"
              onClick={handleSubmit(onSubmitForm)}
              disabled={loading || (modalType === "edit" && !isFormChanged)}
            >
              {loading
                ? "Saving..."
                : modalType === "create"
                ? "Create Car"
                : "Update Car"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onClose}>
      <DrawerContent className="max-h-[90vh] overflow-hidden">
        <DrawerHeader className="border-b">
          <DrawerTitle className="text-xl font-semibold">
            {modalType === "create" ? "Add New Car" : "Edit Car"}
          </DrawerTitle>
          <DrawerDescription className="sr-only">
            {modalType === "create" ? "Add a new car" : "Edit car details"}
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">{FormContent}</div>
        </div>
        <DrawerFooter className="border-t p-4">
          {FormActions}
          <button
            className="sr-only"
            tabIndex={-1}
            autoFocus
            aria-hidden="true"
          />
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

export default CarForm;
