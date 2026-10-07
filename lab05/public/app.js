const form = document.querySelector('#student-form');
const nameInput = document.querySelector('#student-name');
const studentList = document.querySelector('#student-list');
let list = [];

function renderStudents() {
    if (list.length === 0) {
        const emptyMessage = document.createElement('li');
        emptyMessage.textContent = 'No hay estudiantes en la lista.';
        studentList.replaceChildren(emptyMessage);
        return;
    }

    const studentItems = list.map((student) => {
        const item = document.createElement('li');
        const name = document.createElement('span');
        name.className = 'student-name';
        name.textContent = student.name;

        const deleteButton = document.createElement('button');
        deleteButton.type = 'button';
        deleteButton.className = 'delete-button';
        deleteButton.textContent = 'Eliminar';
        deleteButton.dataset.studentId = student.id;
        deleteButton.setAttribute('aria-label', `Eliminar a ${student.name}`);

        item.append(name, deleteButton);
        return item;
    });

    studentList.replaceChildren(...studentItems);
}

async function loadStudents() {
    try {
        const response = await fetch('/api/estudiantes');
        if (!response.ok) throw new Error('No se pudo cargar la lista.');

        list = await response.json();
        renderStudents();
    } catch {
        const errorMessage = document.createElement('li');
        errorMessage.textContent = 'No se pudo conectar con el servidor.';
        studentList.replaceChildren(errorMessage);
    }
}

form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const name = nameInput.value.trim();
    if (!name) return;

    try {
        const response = await fetch('/api/estudiantes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: `${Date.now()}-${Math.random()}`, name })
        });
        if (!response.ok) throw new Error('No se pudo guardar el estudiante.');

        const savedStudent = await response.json();
        list.push(savedStudent);
        renderStudents();
        form.reset();
        nameInput.focus();
    } catch {
        window.alert('No se pudo guardar el estudiante en el servidor.');
    }
});

studentList.addEventListener('click', async (event) => {
    const deleteButton = event.target.closest('[data-student-id]');
    if (!deleteButton) return;

    try {
        const response = await fetch(`/api/estudiantes/${encodeURIComponent(deleteButton.dataset.studentId)}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('No se pudo eliminar el estudiante.');

        list = list.filter((student) => student.id !== deleteButton.dataset.studentId);
        renderStudents();
    } catch {
        window.alert('No se pudo eliminar el estudiante del servidor.');
    }
});

loadStudents();