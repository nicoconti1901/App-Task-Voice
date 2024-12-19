document.addEventListener("DOMContentLoaded", () => {
  const micButton = document.getElementById("micButton");
  const taskList = document.getElementById("taskList");
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
    const transcript = event.results[0][0].transcript;
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
    const li = document.createElement("li");
    li.className = "task-item";
    li.innerHTML = `
        <input type="checkbox" class="task-checkbox" />
        <span class="task-text">${task}</span>
        <button class="delete-button">
          <img src="/assets/img/trash-regular-24.png"></img>
        </button>
      `;
    taskList.appendChild(li);
    saveTask(task);
  }

  function saveTask(task) {
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks.push(task);
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }

  function loadTasks() {
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks.forEach((task) => {
      const li = document.createElement("li");
      li.className = "task-item";
      li.innerHTML = `
          <input type="checkbox" class="task-checkbox" />
          <span class="task-text">${task}</span>
          <button class="delete-button">
            <img src="/assets/img/trash-regular-24.png"></img>
          </button>
        `;
      taskList.appendChild(li);
    });
  }

  function deleteTask(taskElement) {
    const taskText = taskElement.querySelector(".task-text").textContent;
    taskToDelete = taskElement;
    modalMessage.textContent = `¿Estás seguro de que deseas eliminar la tarea: "${taskText}"?`;
    modal.style.display = "block";
  }

  function removeTaskFromStorage(task) {
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks = tasks.filter((t) => t !== task);
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

  taskList.addEventListener("click", (event) => {
    if (event.target.closest(".delete-button")) {
      const taskItem = event.target.closest(".task-item");
      deleteTask(taskItem);
    }
  });

  loadTasks();
});
