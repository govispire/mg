// backend/middleware/auditLogger.js
// Automatically appends an audit log entry after any state-changing operation
// Usage: router.post('/users', auth, requireRole(['owner']), auditLog('user.create'), handler)

const pool = require('../db');

module.exports = function auditLog(action, options = {}) {
  return async function (req, res, next) {
    // Store original json method to intercept response
    const originalJson = res.json.bind(res);

    res.json = async function (body) {
      // Only log on success responses (2xx)
      if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
        try {
          const resourceId = options.getResourceId
            ? options.getResourceId(req, body)
            : (req.params.id || body?.id || body?.user?.id || null);

          const resourceName = options.getResourceName
            ? options.getResourceName(req, body)
            : (body?.name || body?.user?.name || body?.title || null);

          await pool.query(
            `INSERT INTO audit_logs
               (actor_id, actor_role, action, resource_type, resource_id, resource_name, new_data, ip_address)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
              req.user.id,
              req.user.role,
              action,
              options.resourceType || action.split('.')[0],
              resourceId ? String(resourceId) : null,
              resourceName,
              options.captureBody ? JSON.stringify(body) : null,
              req.ip || req.headers['x-forwarded-for'] || null,
            ]
          );
        } catch (logErr) {
          // Never crash the request because of audit log failure
          console.warn('[AuditLog] Failed to write log:', logErr.message);
        }
      }

      return originalJson(body);
    };

    next();
  };
};
