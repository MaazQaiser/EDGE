import PropTypes from 'prop-types';
import { useMemo } from 'react';
import userHasPermission from 'src/utils/auth/userHasPermission';

const RenderIfHasPermission = ({ children, name }) => {
  const allowed = useMemo(() => {
    return userHasPermission(name); // Logic to determine permission
  }, []);

  if (!allowed) return null;

  return <>{children}</>;
};
// Define propTypes
RenderIfHasPermission.propTypes = {
  children: PropTypes.node, // The children can be any renderable React node
  name: PropTypes.string, // The children can be any renderable React node
};

// Define defaultProps
RenderIfHasPermission.defaultProps = {
  children: null, // Default to render nothing if no children are provided
  name: '', // Default to render nothing if no children are provided
};

export default RenderIfHasPermission;
