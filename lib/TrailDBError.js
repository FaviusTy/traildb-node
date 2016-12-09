/**
 * Initialize a new TrailDBError.
 * @param {String} message - Error message.
 */
module.exports = function TrailDBError(message) {
  const error = new Error(message);
  error.name  = 'TrailDBError';
  return error;
};
