let countryCodes = {
    'usd': 'en-US'
}


export const CurrencyFormatter = (currencyType: string, value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: "currency",
    currency: currencyType.toUpperCase(),
  }).format(value);
};
