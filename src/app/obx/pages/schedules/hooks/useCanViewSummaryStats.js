import { useSelector } from 'react-redux';
import { rolesEnumWithName } from 'src/utils/constants';

const STATS_RESTRICTED_ROLES = [
  rolesEnumWithName.officer.slug,
  rolesEnumWithName.advanced_officer.slug,
];

/** Overview coverage + KPI metrics are not exposed to Officer / Advanced Officer. */
export const useCanViewSummaryStats = () => {
  const userRoleSlug = useSelector((state) => state.auth?.userRole?.slug);

  return !STATS_RESTRICTED_ROLES.includes(userRoleSlug);
};
