import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import getRouteConfigs from '../router/config/app.routes';
import generateRoutesFromConfig from '../router/utils/generateRoutesFromConfig';

export default function RouterConfig() {
  const franchiseId = useSelector((state) => state?.auth?.franchiseId);

  const configs = useMemo(() => {
    return getRouteConfigs(franchiseId);
  }, [franchiseId]);

  // Generate and return routes from configs
  return useMemo(() => generateRoutesFromConfig(configs), [configs]);
}
