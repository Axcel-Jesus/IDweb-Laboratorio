// app.js - Módulo de Gestión
const form = document.querySelector('#todo-form');
const titleInput = document.querySelector('#todo-title');
const courseInput = document.querySelector('#todo-course');
const dateInput = document.querySelector('#todo-date');
const list = document.querySelector('#todo-list');
const filterSelect = document.querySelector('#todo-filter');
const alerts = document.querySelector('#todo-alerts');
const todoModal = new bootstrap.Modal(document.querySelector('#todo-modal'));

// Recupera las tareas guardadas y normaliza los datos de versiones anteriores.
function loadTasks() {
    try {
        const savedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
        if (!Array.isArray(savedTasks)) return [];

        // Asegura que cada tarea tenga todos los atributos esperados.
        return savedTasks.map((task, index) => ({
            id: task.id ?? `${Date.now()}-${index}`,
            titulo: task.titulo ?? task.text ?? '',
            curso: task.curso ?? '',
            fechaEntrega: task.fechaEntrega ?? '',
            completada: task.completada ?? task.completed ?? false
        }));
    } catch {
        return [];
    }
}

let tasks = loadTasks();

// Guarda el arreglo actualizado de tareas en el almacenamiento del navegador.
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Devuelve la fecha de hoy en el formato requerido por los campos date.
function getTodayDate() {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${today.getFullYear()}-${month}-${day}`;
}

// Oculta y limpia los mensajes de validación anteriores.
function clearValidationErrors() {
    alerts.replaceChildren();
    alerts.classList.add('d-none');
}

// Muestra los errores recibidos como una lista dentro del área de alertas.
function showValidationErrors(errors) {
    const errorList = document.createElement('ul');
    errorList.className = 'mb-0';

    // Crea un elemento de lista por cada error de validación.
    errors.forEach((message) => {
        const item = document.createElement('li');
        item.textContent = message;
        errorList.appendChild(item);
    });

    alerts.replaceChildren(errorList);
    alerts.classList.remove('d-none');
}

// Filtra las tareas según el estado seleccionado y actualiza el DOM.
function renderTasks() {
    const selectedFilter = filterSelect.value;
    // Conserva las tareas que coinciden con el filtro actual.
    const visibleTasks = tasks.filter((task) => {
        if (selectedFilter === 'pending') return !task.completada;
        if (selectedFilter === 'completed') return task.completada;
        return true;
    });

    if (visibleTasks.length === 0) {
        const emptyMessage = document.createElement('li');
        emptyMessage.className = 'list-group-item text-muted';
        emptyMessage.textContent = tasks.length === 0
            ? 'Aún no hay tareas.'
            : 'No hay tareas en esta categoría.';
        list.replaceChildren(emptyMessage);
        return;
    }

    // Construye los elementos visuales de cada tarea visible.
    const taskElements = visibleTasks.map((task) => {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center gap-3';

        const details = document.createElement('div');
        details.className = 'd-flex align-items-start gap-2';

        const statusButton = document.createElement('button');
        statusButton.type = 'button';
        statusButton.className = task.completada
            ? 'btn btn-success btn-sm flex-shrink-0'
            : 'btn btn-warning btn-sm flex-shrink-0';
        statusButton.textContent = task.completada ? 'Terminado' : 'Pendiente';
        statusButton.dataset.action = 'toggle';
        statusButton.dataset.id = task.id;
        statusButton.setAttribute(
            'aria-label',
            task.completada ? `Marcar ${task.titulo} como pendiente` : `Marcar ${task.titulo} como terminado`
        );

        const text = document.createElement('div');
        const title = document.createElement('strong');
        title.textContent = task.titulo;
        if (task.completada) title.classList.add('text-decoration-line-through', 'text-muted');

        const metadata = document.createElement('div');
        metadata.className = 'small text-muted';
        metadata.textContent = `Curso: ${task.curso} | Entrega: ${task.fechaEntrega || 'No indicada'}`;

        text.append(title, metadata);
        details.append(statusButton, text);

        const deleteButton = document.createElement('button');
        deleteButton.type = 'button';
        deleteButton.className = 'btn btn-danger btn-sm';
        deleteButton.textContent = 'Eliminar';
        deleteButton.dataset.action = 'delete';
        deleteButton.dataset.id = task.id;

        li.append(details, deleteButton);
        return li;
    });

    list.replaceChildren(...taskElements);
}

// Valida y guarda la tarea cuando se envía el formulario.
form.addEventListener('submit', (e) => {
    e.preventDefault();

    const errors = [];
    if (!titleInput.value.trim()) errors.push('Ingresa el título de la tarea.');
    if (!courseInput.value.trim()) errors.push('Ingresa el curso de la tarea.');
    if (!dateInput.value) {
        errors.push('Selecciona la fecha de entrega.');
    } else if (dateInput.value <= getTodayDate()) {
        errors.push('La fecha de entrega debe ser posterior a la fecha actual.');
    }

    if (errors.length > 0) {
        showValidationErrors(errors);
        return;
    }

    clearValidationErrors();
    tasks.push({
        id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
        titulo: titleInput.value.trim(),
        curso: courseInput.value.trim(),
        fechaEntrega: dateInput.value,
        completada: false
    });
    saveTasks();
    form.reset();
    renderTasks();
    todoModal.hide();
});

// Cambia el estado de una tarea o la elimina al pulsar sus botones.
list.addEventListener('click', (e) => {
    const button = e.target.closest('[data-action]');
    if (!button) return;

    // Localiza la tarea asociada al botón pulsado.
    const task = tasks.find((item) => String(item.id) === button.dataset.id);
    if (!task) return;

    if (button.dataset.action === 'toggle') {
        task.completada = !task.completada;
    } else if (button.dataset.action === 'delete') {
        // Elimina del arreglo la tarea seleccionada.
        tasks = tasks.filter((item) => String(item.id) !== button.dataset.id);
    } else {
        return;
    }

    saveTasks();
    renderTasks();
});

// Vuelve a dibujar la lista cuando cambia el filtro.
filterSelect.addEventListener('change', renderTasks);

// Dibuja las tareas guardadas cuando el documento termina de cargar.
document.addEventListener('DOMContentLoaded', renderTasks);
// Limpia errores anteriores cada vez que se abre el formulario modal.
document.querySelector('#todo-modal').addEventListener('show.bs.modal', clearValidationErrors);