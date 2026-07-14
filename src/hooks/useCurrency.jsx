// import currencyFormatter from 'currency-formatter';
// import { useMemo } from 'react';
import { useSelector } from 'react-redux';

const fallbackCurrency = {
  symbol: '$',
  shortCode: 'USD',
};

export const useCurrency = () => {
  // const { franchiseShortCode, homeOfficeShortCode } = useSelector((state) => ({
  //   franchiseShortCode: state?.auth?.countryConfiguration?.currency?.shortCode,
  //   homeOfficeShortCode: state?.auth?.defaultCountryConfiguration?.currency?.shortCode,
  // }));

  // const currency = useMemo(() => {
  //   const shortCode = franchiseShortCode || homeOfficeShortCode;
  //   return currencyFormatter.findCurrency(shortCode)?.symbol || '$';
  // }, [franchiseShortCode, homeOfficeShortCode]);

  const { franchiseCurrencySymbol, homeOfficeCurrencySymbol } = useSelector((state) => ({
    franchiseCurrencySymbol: state?.auth?.countryConfiguration?.currency?.symbol,
    homeOfficeCurrencySymbol: state?.auth?.defaultCountryConfiguration?.currency?.symbol,
  }));

  const currency = franchiseCurrencySymbol || homeOfficeCurrencySymbol || fallbackCurrency.symbol;

  const franchises = useSelector((state) => state?.auth?.franchises);

  const getCurrencyShortCodeOfFranchise = (franchiseId) => {
    if (!franchiseId) return;
    const franchise = franchises?.[franchiseId];
    return franchise?.countryConfiguration?.currency?.shortCode || fallbackCurrency.shortCode;
  };

  const getCurrencyOfFranchise = (franchiseId) => {
    console.log({ franchiseId });
    if (!franchiseId) return;
    const franchise = franchises?.[franchiseId];
    return {
      currencySymbol: franchise?.countryConfiguration?.currency?.symbol || fallbackCurrency.symbol,
      currencyShortCode:
        franchise?.countryConfiguration?.currency?.shortCode || fallbackCurrency.shortCode,
    };
  };

  return { currency, getCurrencyShortCodeOfFranchise, getCurrencyOfFranchise };
};
