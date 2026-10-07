// routes/cursosRoutes.js
const express = require('express');
const router = express.Router();

// Importamos el controlador con toda la lógica
const cursosController = require('../controllers/cursosController');

// Definición de endpoints (Rutas)
router.get('/', cursosController.getAllCursos);
router.get('/:id', cursosController.getCursoById);
router.post('/', cursosController.createCurso);
router.put('/:id', cursosController.updateCurso);
router.delete('/:id', cursosController.deleteCurso);

module.exports = router;