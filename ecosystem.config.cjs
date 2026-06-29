// Configuração PM2 para rodar o site em uma VPS (Hostinger KVM, etc.).
//
// Uso na VPS:
//   npm install -g pm2
//   bun run build           # gera .output/
//   pm2 start ecosystem.config.cjs --env production
//   pm2 save && pm2 startup # arranque automático no boot
//
// Atualização após `git pull`:
//   bun install && bun run build && pm2 reload michele-imoveis

module.exports = {
  apps: [
    {
      name: "michele-imoveis",
      script: ".output/server/index.mjs",
      cwd: __dirname,
      instances: 1,                 // aumente para "max" se a VPS tiver vários vCPUs
      exec_mode: "fork",            // "cluster" também funciona com Nitro/Node
      max_memory_restart: "512M",
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        HOST: "127.0.0.1",
      },
    },
  ],
};
