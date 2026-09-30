// server.js
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const publicDir = path.join(__dirname, '..', 'public');

const server = http.createServer((req, res) => {
    console.log(`Petición recibida: ${req.method} ${req.url}`);

    if (req.url === '/' && req.method === 'GET') {
        const filePath = path.join(publicDir, 'index.html');
        fs.readFile(filePath, (err, content) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Error interno del servidor');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(content);
            }
        });
    } else if (req.url === '/styles.css' && req.method === 'GET') {
        const filePath = path.join(publicDir, 'styles.css');
        fs.readFile(filePath, (err, content) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
                res.end('Error al cargar los estilos');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/css; charset=utf-8' });
                res.end(content);
            }
        });
    } else if (req.url === '/api/status' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'OK', uptime: process.uptime() }));
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Recurso no encontrado' }));
    }
});

server.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});