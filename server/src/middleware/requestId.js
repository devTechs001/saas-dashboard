import crypto from 'crypto';

/**
 * Assign every request an X-Request-Id (or adopt the caller's),
 * expose it on the response, and stash it for log correlation.
 */
const requestId = (req, res, next) => {
  const incoming = req.headers['x-request-id'];
  const id =
    typeof incoming === 'string' && /^[\w-]{1,64}$/.test(incoming)
      ? incoming
      : crypto.randomUUID();

  req.id = id;
  res.setHeader('X-Request-Id', id);
  next();
};

export default requestId;
