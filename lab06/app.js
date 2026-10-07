const express = require('express');
const app = express();
const PORT = 3000;

// 1. Middleware global incorporado: Permite a Express leer el body en formato JSON
app.use(express.json());

// 2. Middleware personalizado de Auditoría (Logger): Registra método, URL y tiempo de respuesta
app.use((req, res, next) => {
    const start = Date.now();
    
    // Usamos el evento 'finish' de la respuesta para calcular el tiempo total
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`[${new Date().toISOString()}] ${req.method} en ${req.url} - ${duration}ms`);
    });
    
    next(); // Fundamental llamar a next() para que la petición no se quede colgada
});

// --- AQUÍ CONECTAREMOS NUESTRAS RUTAS MÁS ADELANTE ---
// const cursosRoutes = require('./routes/cursosRoutes');
// app.use('/api/cursos', cursosRoutes);

// 3. Middleware de Manejo de Errores: Captura errores y retorna un JSON con código HTTP 500
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        status: 'error',
        message: 'Ocurrió un error interno en el servidor'
    });
});

// Levantar el servidor
app.listen(PORT, () => {
    console.log(`Servidor Express corriendo en el puerto ${PORT}`);
});