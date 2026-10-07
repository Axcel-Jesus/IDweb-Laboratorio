// data/cursos.js

let cursos = [
    { 
        id: 1, 
        nombre: 'Introducción al Desarrollo Web', 
        codigo: 'CS101', 
        creditos: 4 
    },
    { 
        id: 2, 
        nombre: 'Estructuras de Datos', 
        codigo: 'CS102', 
        creditos: 4 
    },
    { 
        id: 3, 
        nombre: 'Ingeniería de Software', 
        codigo: 'CS201', 
        creditos: 3 
    }
];

// Exportamos el arreglo para poder usarlo y modificarlo desde los controladores
module.exports = cursos;