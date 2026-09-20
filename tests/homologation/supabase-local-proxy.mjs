import http from 'node:http';

const POSTGREST_HOST = process.env.POSTGREST_HOST || '127.0.0.1';
const POSTGREST_PORT = parseInt(process.env.POSTGREST_PORT || '3002', 10);
const PROXY_PORT = parseInt(process.env.PROXY_PORT || '3001', 10);

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Auth mock para rotas do cliente Supabase Auth se acionadas (simulado)
  if (req.url.startsWith('/auth/v1/')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ user: null, session: null }));
    return;
  }

  let targetPath = req.url;
  if (targetPath.startsWith('/rest/v1/')) {
    targetPath = targetPath.slice('/rest/v1'.length);
  } else if (targetPath === '/rest/v1') {
    targetPath = '/';
  }

  // Preservar exatamente os headers recebidos da requisição original
  const forwardHeaders = { ...req.headers };
  forwardHeaders.host = `${POSTGREST_HOST}:${POSTGREST_PORT}`;

  const options = {
    hostname: POSTGREST_HOST,
    port: POSTGREST_PORT,
    path: targetPath,
    method: req.method,
    headers: forwardHeaders
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on('error', (err) => {
    console.error('[Proxy Error]:', err.message);
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Bad Gateway', details: err.message }));
  });

  req.pipe(proxyReq, { end: true });
});

server.listen(PROXY_PORT, '127.0.0.1', () => {
  console.log(`Supabase Local Proxy escutando em http://127.0.0.1:${PROXY_PORT} -> PostgREST :${POSTGREST_PORT}`);
});
