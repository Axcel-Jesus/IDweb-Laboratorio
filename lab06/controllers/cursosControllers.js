let cursos = require('../data/cursos');

exports.getAllCursos = (req, res) => {
    if (req.query.creditos) {
        const creditosBuscados = parseInt(req.query.creditos);
        const cursosFiltrados = cursos.filter(c => c.creditos === creditosBuscados);
        return res.status(200).json({ status: 'success', data: cursosFiltrados });
    }
    res.status(200).json({ status: 'success', data: cursos });
};

exports.getCursoById = (req, res) => {
    const id = parseInt(req.params.id); 
    const curso = cursos.find(c => c.id === id);

    if (!curso) {
        return res.status(404).json({ status: 'fail', message: 'Curso no encontrado' });
    }
    res.status(200).json({ status: 'success', data: curso });
};

exports.createCurso = (req, res) => {
    const { nombre, codigo, creditos } = req.body;

    if (!nombre || !codigo || !creditos) {
        return res.status(400).json({ status: 'fail', message: 'Faltan campos obligatorios (nombre, codigo, creditos)' });
    }

    const nuevoCurso = {
        id: cursos.length > 0 ? cursos[cursos.length - 1].id + 1 : 1,
        nombre,
        codigo,
        creditos: parseInt(creditos)
    };

    cursos.push(nuevoCurso);
    res.status(201).json({ status: 'success', data: nuevoCurso });
};

exports.updateCurso = (req, res) => {
    const id = parseInt(req.params.id);
    const { nombre, codigo, creditos } = req.body;
    
    const cursoIndex = cursos.findIndex(c => c.id === id);

    if (cursoIndex === -1) {
        return res.status(404).json({ status: 'fail', message: 'Curso no encontrado para actualizar' });
    }

    if (nombre) cursos[cursoIndex].nombre = nombre;
    if (codigo) cursos[cursoIndex].codigo = codigo;
    if (creditos) cursos[cursoIndex].creditos = parseInt(creditos);

    res.status(200).json({ status: 'success', data: cursos[cursoIndex] });
};

exports.deleteCurso = (req, res) => {
    const id = parseInt(req.params.id);
    const cursoIndex = cursos.findIndex(c => c.id === id);

    if (cursoIndex === -1) {
        return res.status(404).json({ status: 'fail', message: 'Curso no encontrado para eliminar' });
    }

    cursos.splice(cursoIndex, 1);
    
    res.status(200).json({ status: 'success', message: `Curso con ID ${id} eliminado correctamente` });
};