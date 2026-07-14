import { useHistory } from 'react-router-dom';
import { OBX_DASHBOARD } from 'src/app/router/constant/ROUTE';

const useBackNavigation = () => {
  const history = useHistory();

  const navigateBack = ({ fallbackUrl }) => {
    if (history.length > 2) {
      history.goBack();
      return;
    }

    history.push({
      pathname: fallbackUrl || OBX_DASHBOARD,
    });
  };

  return { navigateBack };
};

export default useBackNavigation;
