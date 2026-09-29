// app.js - Módulo de Gestión
const form = document.querySelector('#todo-form');
const titleInput = document.querySelector('#todo-title');
const courseInput = document.querySelector('#todo-course');
const dateInput = document.querySelector('#todo-date');
const completedInput = document.querySelector('#todo-completed');
const list = document.querySelector('#todo-list');
const alerts = document.querySelector('#todo-alerts');
const todoModal = new bootstrap.Modal(document.querySelector('#todo-modal'));

function loadTasks() {
    try {
        const savedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
        if (!Array.isArray(savedTasks)) return [];

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

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function getTodayDate() {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${today.getFullYear()}-${month}-${day}`;
}

function clearValidationErrors() {
    alerts.replaceChildren();
    alerts.classList.add('d-none');
}

function showValidationErrors(errors) {
    const errorList = document.createElement('ul');
    errorList.className = 'mb-0';

    errors.forEach((message) => {
        const item = document.createElement('li');
        item.textContent = message;
        errorList.appendChild(item);
    });

    alerts.replaceChildren(errorList);
    alerts.classList.remove('d-none');
}

function renderTasks() {
    const taskElements = tasks.map((task) => {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center gap-3';

        const details = document.createElement('div');
        details.className = 'd-flex align-items-start gap-2';

        const completed = document.createElement('input');
        completed.type = 'checkbox';
        completed.className = 'form-check-input mt-1';
        completed.checked = task.completada;
        completed.dataset.action = 'toggle';
        completed.dataset.id = task.id;
        completed.setAttribute('aria-label', `Marcar ${task.titulo} como completada`);

        const text = document.createElement('div');
        const title = document.createElement('strong');
        title.textContent = task.titulo;
        if (task.completada) title.classList.add('text-decoration-line-through', 'text-muted');

        const metadata = document.createElement('div');
        metadata.className = 'small text-muted';
        metadata.textContent = `Curso: ${task.curso} | Entrega: ${task.fechaEntrega || 'No indicada'}`;

        text.append(title, metadata);
        details.append(completed, text);

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
        completada: completedInput.checked
    });
    saveTasks();
    form.reset();
    renderTasks();
    todoModal.hide();
});

list.addEventListener('click', (e) => {
    const button = e.target.closest('[data-action="delete"]');
    if (!button) return;

    tasks = tasks.filter((task) => String(task.id) !== button.dataset.id);
    saveTasks();
    renderTasks();
});

list.addEventListener('change', (e) => {
    if (e.target.dataset.action !== 'toggle') return;

    const task = tasks.find((item) => String(item.id) === e.target.dataset.id);
    if (!task) return;

    task.completada = e.target.checked;
    saveTasks();
    renderTasks();
});

document.addEventListener('DOMContentLoaded', renderTasks);
document.querySelector('#todo-modal').addEventListener('show.bs.modal', clearValidationErrors);