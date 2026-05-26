// backend/middleware/requirePermission.js
// Granular permission check beyond role: checks if a role can perform an action on a resource
// Usage: router.delete('/test/:id', auth, requirePermission('delete', 'content'), handler)

const PERMISSION_MATRIX = {
  owner: {
    user:    ['create', 'read', 'edit', 'delete', 'deactivate'],
    content: ['read', 'edit', 'delete', 'approve', 'archive'],
    task:    ['create', 'read', 'edit', 'delete'],
    audit:   ['read'],
    revenue: ['read'],
    settings: ['read', 'edit'],
  },
  'super-admin': {
    user:    ['create', 'read', 'edit', 'deactivate'],           // cannot delete, cannot touch owner
    content: ['read', 'edit', 'delete', 'approve', 'archive'],
    task:    ['create', 'read', 'edit', 'delete'],
    audit:   ['read'],
    revenue: [],                                                  // BLOCKED
    settings: ['read'],
  },
  employee: {
    user:    [],                                                  // BLOCKED
    content: ['create', 'read', 'edit'],                         // cannot publish/delete after approval
    task:    ['read', 'update_status'],                          // can only update own tasks
    audit:   [],
    revenue: [],
    settings: [],
  },
  mentor: {
    user:    ['read'],                                            // read own assigned students only
    content: ['read'],
    task:    ['create', 'read', 'update_status'],                // assign tasks to students + update own
    audit:   [],
    revenue: [],
    settings: [],
  },
  student: {
    user:    ['read'],                                            // own profile only
    content: ['read'],
    task:    ['read', 'update_status'],                          // own study tasks
    audit:   [],
    revenue: [],
    settings: [],
  },
};

module.exports = function requirePermission(action, resource) {
  return function (req, res, next) {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const rolePerms = PERMISSION_MATRIX[req.user.role];
    if (!rolePerms) {
      return res.status(403).json({ error: 'Unknown role' });
    }

    const resourcePerms = rolePerms[resource] || [];
    if (!resourcePerms.includes(action)) {
      return res.status(403).json({
        error: `Permission denied. Role '${req.user.role}' cannot perform '${action}' on '${resource}'.`,
        role: req.user.role,
        action,
        resource,
      });
    }

    next();
  };
};

module.exports.PERMISSION_MATRIX = PERMISSION_MATRIX;
