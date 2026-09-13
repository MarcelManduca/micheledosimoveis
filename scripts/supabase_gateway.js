import http from 'node:http';

const PORT = 54321;
const POSTGREST_PORT = 54320;

const server = http.createServer((req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || '127.0.0.1'}`);
  
  if (url.pathname.startsWith('/rest/v1/')) {
    const postgrestPath = url.pathname.replace(/^\/rest\/v1/, '') + url.search;
    
    const options = {
      hostname: '127.0.0.1',
      port: POSTGREST_PORT,
      path: postgrestPath,
      method: req.method,
      headers: { ...req.headers, host: `127.0.0.1:${POSTGREST_PORT}` }
    };

    const proxyReq = http.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
      proxyRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
      console.error('[Gateway Error]', err.message);
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'PostgREST Gateway error: ' + err.message }));
    });

    req.pipe(proxyReq);
    return;
  }

  if (url.pathname.startsWith('/auth/v1/')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ user: null, session: null }));
    return;
  }

  // Health check or default
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: 'ok', version: 'Supabase-Homolog-Gateway-1.0' }));
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Supabase Gateway listening on http://127.0.0.1:${PORT}`);
});
