// server.js
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const publicDir = path.join(__dirname, '..', 'public');
const studentsFile = path.join(__dirname, 'estudiantes.json');
const contentTypes = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.ico': 'image/x-icon',
    '.txt': 'text/plain; charset=utf-8'
};

function readStudents(callback) {
    fs.readFile(studentsFile, 'utf8', (err, data) => {
        if (err) {
            callback(err.code === 'ENOENT' ? null : err, err.code === 'ENOENT' ? [] : undefined);
            return;
        }

        try {
            const students = JSON.parse(data);
            if (!Array.isArray(students)) {
                callback(new Error('El archivo de estudiantes debe contener una lista'), undefined);
                return;
            }
            callback(null, students);
        } catch {
            callback(new Error('El archivo de estudiantes contiene JSON inválido'), undefined);
        }
    });
}

function sendJson(res, statusCode, data) {
    res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(data));
}

function serveStaticFile(req, res) {
    let pathname;
    try {
        pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    } catch {
        res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Solicitud inválida');
        return;
    }

    const requestedPath = pathname === '/' ? '/index.html' : pathname;
    const filePath = path.resolve(publicDir, `.${requestedPath}`);
    if (filePath !== publicDir && !filePath.startsWith(`${publicDir}${path.sep}`)) {
        res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Acceso denegado');
        return;
    }

    fs.readFile(filePath, (err, content) => {
        if (err) {
            const statusCode = err.code === 'ENOENT' ? 404 : 500;
            res.writeHead(statusCode, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end(statusCode === 404 ? 'Archivo no encontrado' : 'Error interno del servidor');
            return;
        }

        const contentType = contentTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
    });
}

const server = http.createServer((req, res) => {
    console.log(`Petición recibida: ${req.method} ${req.url}`);

    const pathname = new URL(req.url, 'http://localhost').pathname;
    if (pathname === '/api/estudiantes' && req.method === 'GET') {
        readStudents((err, students) => {
            if (err) {
                sendJson(res, 500, { error: 'No se pudo leer la lista de estudiantes' });
                return;
            }
            sendJson(res, 200, students);
        });
    } else if (pathname === '/api/estudiantes' && req.method === 'POST') {
        let body = '';
        req.setEncoding('utf8');
        req.on('data', (chunk) => {
            body += chunk;
        });
        req.on('end', () => {
            let student;
            try {
                student = JSON.parse(body);
            } catch {
                sendJson(res, 400, { error: 'El cuerpo debe contener JSON válido' });
                return;
            }

            if (student === null || typeof student !== 'object' || Array.isArray(student)) {
                sendJson(res, 400, { error: 'El estudiante debe ser un objeto JSON' });
                return;
            }

            readStudents((err, students) => {
                if (err) {
                    sendJson(res, 500, { error: 'No se pudo leer la lista de estudiantes' });
                    return;
                }

                students.push(student);
                fs.writeFile(studentsFile, JSON.stringify(students, null, 2), 'utf8', (writeErr) => {
                    if (writeErr) {
                        sendJson(res, 500, { error: 'No se pudo guardar el estudiante' });
                        return;
                    }
                    sendJson(res, 201, student);
                });
            });
        });
    } else if (pathname === '/api/status' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'OK', uptime: process.uptime() }));
    } else if (req.method === 'GET') {
        serveStaticFile(req, res);
    } else {
        res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Método no permitido');
    }
});

server.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});