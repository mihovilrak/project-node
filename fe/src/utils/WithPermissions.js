import React from 'react';

// HOC to check if the user has permission
const WithPermissions = ({ allowedRoles, userRole, children }) => {
  return allowedRoles.includes(userRole) ? children : <p>You do not have permission to view this content.</p>;
};

export default WithPermissions;
