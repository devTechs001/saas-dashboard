import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { LoadingSpinner } from '../common';
import { can, hasRole } from '../../utils/rbac';
import NotFound from '../../pages/NotFound';

/**
 * Route guard with authentication + role/permission checks.
 *
 * <ProtectedRoute> — any authenticated user
 * <ProtectedRoute roles={['admin']}> — restricted to given roles
 * <ProtectedRoute permission="admin:users"> — restricted by permission
 */
const ProtectedRoute = ({ children, roles, permission }) => {
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <LoadingSpinner size={60} message="Loading..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && roles.length > 0 && !hasRole(user, roles)) {
    return (
      <NotFound
        code={403}
        title="Access denied"
        message={`This area is restricted to the ${roles.join(' or ')} role(s). Your account has the "${user?.role || 'unknown'}" role.`}
      />
    );
  }

  if (permission && !can(user, permission)) {
    return (
      <NotFound
        code={403}
        title="Access denied"
        message={`Your role does not include the "${permission}" permission. Contact a workspace admin to request access.`}
      />
    );
  }

  return children;
};

export default ProtectedRoute;
