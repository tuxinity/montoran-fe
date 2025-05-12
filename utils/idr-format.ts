export const idrFormat = (price: number): string => {
  if (price >= 1000000000) {
    const billions = price / 1000000000;
    return `Rp ${billions.toLocaleString("id-ID", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    })} Milyar`;
  }

  if (price >= 1000000) {
    const millions = price / 1000000;
    return `Rp ${millions.toLocaleString("id-ID", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    })} Juta`;
  }

  return `Rp ${price.toLocaleString("id-ID")}`;
};
