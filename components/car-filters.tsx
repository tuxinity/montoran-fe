"use client";

import { useState, useCallback, useMemo, useEffect, memo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, SlidersHorizontal, X } from "lucide-react";
import debounce from "lodash/debounce";
import CarApi from "@/lib/car-api";
import type { Brand, BodyType } from "@/types/car";
import { FilterValues } from "@/types/car";

interface CarFiltersProps {
  onSearch: (value: string) => void;
  onFilterChange: (filters: FilterValues) => void;
}

const PRICE_RANGES = [
  { label: "< Rp 100 Juta", value: "100000000" },
  { label: "< Rp 200 Juta", value: "200000000" },
  { label: "< Rp 500 Juta", value: "500000000" },
  { label: "< Rp 1 Milyar", value: "1000000000" },
] as const;

const TRANSMISSION_OPTIONS = [
  { label: "Otomatis", value: "AT" },
  { label: "Manual", value: "MT" },
] as const;

const TransmissionSelect = memo(function TransmissionSelect({
  value,
  onChange,
}: {
  value: string | undefined;
  onChange: (value: string) => void;
}) {
  return (
    <Select
      value={value ?? "all"}
      onValueChange={onChange}
      aria-label="Filter transmisi"
    >
      <SelectTrigger>
        <SelectValue placeholder="Transmisi" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Semua Transmisi</SelectItem>
        {TRANSMISSION_OPTIONS.map(({ label, value }) => (
          <SelectItem key={value} value={value}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
});

const PriceSelect = memo(function PriceSelect({
  value,
  onChange,
}: {
  value: string | undefined;
  onChange: (value: string) => void;
}) {
  return (
    <Select
      value={value ?? "all"}
      onValueChange={onChange}
      aria-label="Filter rentang harga"
    >
      <SelectTrigger>
        <SelectValue placeholder="Rentang Harga" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Semua Harga</SelectItem>
        {PRICE_RANGES.map(({ label, value }) => (
          <SelectItem key={value} value={value}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
});

export function CarFilters({ onSearch, onFilterChange }: CarFiltersProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterValues>({});
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);
  const [brands, setBrands] = useState<Map<string, Brand>>(new Map());
  const [bodyTypes, setBodyTypes] = useState<Map<string, BodyType>>(new Map());

  const fetchData = useCallback(async () => {
    try {
      const [brandsData, bodyTypesData] = await Promise.all([
        CarApi.getBrands(),
        CarApi.getBodyTypes(),
      ]);

      setBrands(new Map(brandsData.map((brand) => [brand.id, brand])));
      setBodyTypes(new Map(bodyTypesData.map((type) => [type.id, type])));
    } catch (error) {
      console.error("Failed to fetch filter data:", error);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const debouncedSearch = useMemo(
    () => debounce((value: string) => onSearch(value), 300),
    [onSearch]
  );

  useEffect(() => {
    return () => debouncedSearch.cancel();
  }, [debouncedSearch]);

  const handleSearch = useCallback(
    (value: string) => {
      setSearchQuery(value);
      debouncedSearch(value);
    },
    [debouncedSearch]
  );

  const handleFilterChange = useCallback(
    (key: keyof FilterValues, value: string | null) => {
      const newFilters = {
        ...filters,
        [key]: value === "all" ? undefined : value || undefined,
      };
      setFilters(newFilters);
      onFilterChange(newFilters);
    },
    [filters, onFilterChange]
  );

  const resetFilters = useCallback(() => {
    setSearchQuery("");
    setFilters({});
    onSearch("");
    onFilterChange({});
  }, [onSearch, onFilterChange]);

  const hasActiveFilters = useMemo(
    () => searchQuery || Object.values(filters).some(Boolean),
    [searchQuery, filters]
  );

  const brandsArray = useMemo(() => Array.from(brands.values()), [brands]);
  const bodyTypesArray = useMemo(
    () => Array.from(bodyTypes.values()),
    [bodyTypes]
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            placeholder="Cari mobil..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
            aria-label="Cari mobil"
          />
          {searchQuery && (
            <button
              onClick={() => handleSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Hapus pencarian"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
        <Button
          variant={isFiltersVisible ? "secondary" : "outline"}
          size="icon"
          onClick={() => setIsFiltersVisible(!isFiltersVisible)}
          aria-label={
            isFiltersVisible ? "Sembunyikan filter" : "Tampilkan filter"
          }
          aria-expanded={isFiltersVisible}
        >
          <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
        </Button>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            aria-label="Reset semua filter"
          >
            Reset
          </Button>
        )}
      </div>

      {isFiltersVisible && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Select
            value={filters.brand ?? "all"}
            onValueChange={(value) => handleFilterChange("brand", value)}
            aria-label="Filter merek"
          >
            <SelectTrigger>
              <SelectValue placeholder="Merek" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Merek</SelectItem>
              {brandsArray.map((brand) => (
                <SelectItem key={brand.id} value={brand.id}>
                  {brand.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.bodyType ?? "all"}
            onValueChange={(value) => handleFilterChange("bodyType", value)}
            aria-label="Filter tipe body"
          >
            <SelectTrigger>
              <SelectValue placeholder="Tipe Body" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Tipe</SelectItem>
              {bodyTypesArray.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.soldStatus ?? "all"}
            onValueChange={(value) => handleFilterChange("soldStatus", value)}
            aria-label="Filter status"
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="available">Tersedia</SelectItem>
              <SelectItem value="sold">Terjual</SelectItem>
            </SelectContent>
          </Select>

          <TransmissionSelect
            value={filters.transmission}
            onChange={(value) => handleFilterChange("transmission", value)}
          />

          <PriceSelect
            value={filters.minPrice?.toString()}
            onChange={(value) => handleFilterChange("minPrice", value)}
          />
        </div>
      )}
    </div>
  );
}
