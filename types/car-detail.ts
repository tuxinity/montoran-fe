export interface CarSpecs {
  range: string;
  acceleration: string;
  horsepower: string;
}

export interface CarTrim {
  name: string;
  price: number;
}

export interface CarPackage {
  name: string;
  price: number | "Included";
}

export interface CarColor {
  name: string;
  price: number | "Included";
  hex: string;
}

export interface CarUpgrade {
  name: string;
  price: number | "Included";
}

export interface CarConfig {
  trims: CarTrim[];
  packages: CarPackage[];
  colors: CarColor[];
  upgrades: CarUpgrade[];
}

export interface CarDetailData {
  id: string;
  name: string;
  basePrice: number;
  specs: CarSpecs;
  config: CarConfig;
  images: string[];
}
