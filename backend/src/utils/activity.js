const ActivityLog = require('../models/ActivityLog');
const { getIO } = require('../config/socket');

/**
 * Record an activity log entry and broadcast it in real time.
 * Failures here must never break the main request flow.
 */
async function logActivity({ user, action, entity, entityId, message, meta }) {
  try {
    const entry = await ActivityLog.create({
      user,
      action,
      entity,
      entityId,
      message,
      meta,
    });

    const io = getIO();
    if (io) {
      io.emit('activity', {
        _id: entry._id,
        action,
        message,
        entity,
        entityId,
        createdAt: entry.createdAt,
      });
    }
    return entry;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Activity log failed:', err.message);
    return null;
  }
}

module.exports = { logActivity };
