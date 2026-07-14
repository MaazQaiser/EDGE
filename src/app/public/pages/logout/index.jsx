import { useEffect, useState } from 'react';
import LoaderComponent from 'src/app/components/common/loader';
import { logoutCall } from 'src/services/auth.services';
import LogoutRedux from 'src/utils/auth/logout';

const Logout = () => {
  const [loading, _setLoading] = useState(true);

  const logoutUser = async () => {
    try {
      await logoutCall();
    } catch (error) {
      // Demo mode: ignore backend logout failures
    } finally {
      LogoutRedux();
      window.location.href = '/';
    }
  };

  useEffect(() => {
    logoutUser();
  }, []);

  return <>{loading && <LoaderComponent size={50} color={'primary'} label={'Loading'} />}</>;
};

export default Logout;
