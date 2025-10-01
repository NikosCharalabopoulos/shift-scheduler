// Τυλίγει async controllers για να πετάνε στο errorHandler χωρίς try/catch
function asyncHandler(fn) {
  return function wrapped(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = { asyncHandler };
