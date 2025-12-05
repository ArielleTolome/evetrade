import { useLocation } from 'react-router-dom';

const friendlyNameMap = {
  'station-trading': 'Station Trading',
  'station-hauling': 'Station Hauling',
  'region-hauling': 'Region Hauling',
  'price-compare': 'Price Comparison',
  'saved-routes': 'Saved Routes',
  'auth/callback': 'Auth Callback',
  'trade-profits': 'Trade Profits',
  'market-orders': 'Market Orders',
  'smart-trading': 'Smart Trading',
  'pi-optimizer': 'PI Optimizer',
  'industry-profits': 'Industry Profits',
  'lp-optimizer': 'LP Optimizer',
  'corp-orders': 'Corp Orders',
  'smart-route': 'Smart Route',
  'item-detail': 'Item Detail',
};

const formatBreadcrumb = (crumb) => {
  return friendlyNameMap[crumb] || crumb
    .replace(/-/g, ' ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const useBreadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  return pathnames.map((value, index) => {
    const to = `/${pathnames.slice(0, index + 1).join('/')}`;
    const label = formatBreadcrumb(value);
    return {
      label,
      href: to,
    };
  });
};
