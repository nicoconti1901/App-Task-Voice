document.addEventListener("DOMContentLoaded", () => {
  const micButton = document.getElementById("micButton");
  const taskList = document.getElementById("taskList");
  const noTasksMessage = document.getElementById("noTasksMessage");
  const modal = document.getElementById("modal");
  const modalMessage = document.getElementById("modal-message");
  const modalConfirm = document.getElementById("modal-confirm");
  const modalCancel = document.getElementById("modal-cancel");
  const successModal = document.getElementById("success-modal");
  const successMessage = document.getElementById("success-message");
  const successClose = document.getElementById("success-close");

  let taskToDelete = null;

  // Check for browser support
  if (!("webkitSpeechRecognition" in window)) {
    alert("Speech Recognition not supported in this browser.");
    return;
  }

  const recognition = new webkitSpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = "es-ES";

  micButton.addEventListener("click", () => {
    micButton.classList.add("recording");
    recognition.start();
  });

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript.toUpperCase(); // Convertir a mayúsculas
    addTask(transcript);
    micButton.classList.remove("recording");
  };

  recognition.onerror = (event) => {
    console.error("Speech recognition error", event);
    micButton.classList.remove("recording");
  };

  recognition.onend = () => {
    micButton.classList.remove("recording");
  };

  function addTask(task) {
    const date = new Date().toLocaleString(); // Obtener la fecha y hora actual
    const li = document.createElement("li");
    li.className = "task-item";
    li.innerHTML = `
           <div class="task-date">${date}</div> 
      <div class="task-details">
        <input type="checkbox" class="task-checkbox" />
        <span class="task-text">${task}</span>
        <button class="delete-button" title="Eliminar">
          <img src="/assets/img/X.png" alt="Eliminar" />
        </button>
      </div>
    `;
    taskList.prepend(li);
    saveTask({ task, date }); // Guardar la tarea con la fecha
    addDeleteEventListener(li.querySelector(".delete-button")); // Añadir evento de eliminación al nuevo botón
    addToggleCheckboxEventListener(li); // Añadir evento de alternar checkbox al nuevo elemento
    updateNoTasksMessage(); // Actualizar el mensaje de "No hay tareas agregadas"

  }

  function saveTask(task) {
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks.push(task);
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }

  function loadTasks() {
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks.sort((a, b) => new Date(b.date) - new Date(a.date)); // Ordenar por fecha descendente
    tasks.forEach((taskObj) => {
      const li = document.createElement("li");
      li.className = "task-item";
      li.innerHTML = `
              <div class="task-date">${taskObj.date}</div> 
      <div class="task-details">
        <input type="checkbox" class="task-checkbox" />
        <span class="task-text">${taskObj.task}</span>
        <button class="delete-button" title="Eliminar">
          <img src="/assets/img/X.png" alt="Eliminar" />
        </button>
      </div>
      `;
      taskList.appendChild(li);
      addDeleteEventListener(li.querySelector(".delete-button")); // Añadir evento de eliminación a los botones cargados
      addToggleCheckboxEventListener(li); // Añadir evento de alternar checkbox al nuevo elemento

    });
    updateNoTasksMessage(); // Actualizar el mensaje de "No hay tareas agregadas"
  }

  function deleteTask(taskElement) {
    const taskText = taskElement.querySelector(".task-text").textContent;
    taskToDelete = taskElement;
    modalMessage.textContent = `¿Estás seguro de que deseas eliminar la tarea: "${taskText}"?`;
    modal.style.display = "block";
  }

  function removeTaskFromStorage(taskText) {
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks = tasks.filter((task) => task.task !== taskText);
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }

  function showSuccessModal(message) {
    successMessage.textContent = message;
    successModal.style.display = "block";
  }

  modalConfirm.addEventListener("click", () => {
    if (taskToDelete) {
      const taskText = taskToDelete.querySelector(".task-text").textContent;
      taskToDelete.remove();
      removeTaskFromStorage(taskText);
      showSuccessModal("Tarea borrada con éxito");
      taskToDelete = null;
      updateNoTasksMessage(); // Actualizar el mensaje de "No hay tareas agregadas"
    }
    modal.style.display = "none";
  });

  modalCancel.addEventListener("click", () => {
    taskToDelete = null;
    modal.style.display = "none";
  });

  successClose.addEventListener("click", () => {
    successModal.style.display = "none";
  });

  function addDeleteEventListener(button) {
    button.addEventListener("click", (event) => {
      const taskItem = event.target.closest(".task-item");
      deleteTask(taskItem);
    });
  }

  function addToggleCheckboxEventListener(taskItem) {
    const checkbox = taskItem.querySelector(".task-checkbox");

    taskItem.addEventListener("click", (event) => {
      if (!event.target.closest(".delete-button")) {
        checkbox.checked = !checkbox.checked;
      }
    });

    checkbox.addEventListener("click", (event) => {
      event.stopPropagation(); // Evitar que el evento se propague al task-item
    });
  }

  function updateNoTasksMessage() {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    if (tasks.length === 0) {
      noTasksMessage.style.display = "block";
    } else {
      noTasksMessage.style.display = "none";
    }
  }

  loadTasks(); // Cargar tareas al iniciar
});
