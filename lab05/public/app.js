const form = document.querySelector('#student-form');
const nameInput = document.querySelector('#student-name');
const studentList = document.querySelector('#student-list');
const starterList = [
    { id: 'student-1', name: 'Ana Torres' },
    { id: 'student-2', name: 'Luis Mendoza' },
    { id: 'student-3', name: 'Camila Rojas' }
];

function loadStudents() {
    try {
        const storedStudents = JSON.parse(localStorage.getItem('students'));
        return Array.isArray(storedStudents) ? storedStudents : starterList;
    } catch {
        return starterList;
    }
}

let list = loadStudents();

function saveStudents() {
    localStorage.setItem('students', JSON.stringify(list));
}

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

form.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = nameInput.value.trim();
    if (!name) return;

    list.push({ id: `${Date.now()}-${Math.random()}`, name });
    saveStudents();
    renderStudents();
    form.reset();
    nameInput.focus();
});

studentList.addEventListener('click', (event) => {
    const deleteButton = event.target.closest('[data-student-id]');
    if (!deleteButton) return;

    list = list.filter((student) => student.id !== deleteButton.dataset.studentId);
    saveStudents();
    renderStudents();
});

renderStudents();