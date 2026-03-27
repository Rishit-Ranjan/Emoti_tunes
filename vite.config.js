import path from 'path';
import net from 'node:net';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to check if a local port is open (Node.js side)
const isPortOpen = (port) => new Promise((resolve) => {
    const socket = net.connect(port, '127.0.0.1', () => {
        socket.end();
        resolve(true);
    });
    socket.setTimeout(150);
    socket.on('timeout', () => { socket.destroy(); resolve(false); });
    socket.on('error', () => { resolve(false); });
});

export default defineConfig(async ({ mode }) => {
    const env = loadEnv(mode, '.', '');

    // Auto-detect Ollama port
    let ollamaTarget = env.VITE_FOUNDRY_TARGET || 'http://127.0.0.1:11434';
    if (!env.VITE_FOUNDRY_TARGET) {
        const portsToTry = [11434, 11435, 1234];
        for (const port of portsToTry) {
            if (await isPortOpen(port)) {
                ollamaTarget = `http://127.0.0.1:${port}`;
                console.log(`🟢 [Discovery] Found active LLM service on port: ${port}`);
                break;
            }
        }
    }

    return {
        plugins: [react()],
        define: {
            'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
            'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        },
        resolve: {
            alias: {
                '@': path.resolve(__dirname, '.'),
            }
        },
        server: {
            proxy: {
                // Single proxy for all LLM tasks (Ollama/Llava)
                '/api/foundry': {
                    target: ollamaTarget,
                    changeOrigin: true,
                    rewrite: (path) => path.replace(/^\/api\/foundry/, ''),
                    configure: (proxy) => {
                        proxy.on('error', (err) => {
                            console.log('🔴 LLM proxy error:', err.message);
                        });
                    }
                }
            }
        }
    };
});