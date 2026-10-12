export function requestLogger(req, res, next) {
  const startedAt = Date.now();

  res.on('finish', () => {
    const elapsed = Date.now() - startedAt;
    process.stdout.write(`${new Date().toISOString()} ${req.method} ${req.originalUrl} ${res.statusCode} ${elapsed}ms\n`);
  });

  next();
}
