const username = localStorage.getItem("nombreUsuario");

function Enviar() {
    window.location.href = "../login/login.html";
}

document.addEventListener("DOMContentLoaded", () => {
    let token = localStorage.getItem("authToken");

    if (token) {
        fetch("http://localhost:4000/verify-token", {
            method: "GET",
            headers: {
                authorization: token,
            },
        }).then(async (data) => {
            const response = await data.json();

            if (response.valid) {
                updateUIWithUserDetails();
                fetchUserTasks(); // Llamar para obtener las misiones
            } else if (response.accessToken) {
                localStorage.setItem("authToken", response.accessToken);
                token = response.accessToken;

                updateUIWithUserDetails();
                fetchUserTasks();
            } else {
                console.log("Token inválido.");
            }
        });
    }

    function updateUIWithUserDetails() {
        const loginButton = document.getElementById("log-button");
        const nombre = localStorage.getItem("nombreUsuario");

        if (nombre) {
            const elementoNombre = document.getElementById("nombre");
            elementoNombre.textContent = nombre;
        }

        if (loginButton) {
            loginButton.remove();
        }

        const logContainer = document.getElementById("log");
        if (logContainer) {
            logContainer.innerHTML = `
                <img src="../img/3.jpg" alt="H" id="home-persona">
            `;
        }
    }

    // Función para obtener las tareas del usuario
    function fetchUserTasks() {
        fetch("http://localhost:4000/obtenerTareas", {
            method: "GET",
            headers: {
                authorization: token,
            },
        })
            .then(async (response) => {
                if (response.ok) {
                    const data = await response.json(); // Parsear como JSON
                    const tasks = data.tareas; // Acceder a la propiedad `tareas`
                    if (Array.isArray(tasks)) {
                        displayTasks(tasks);
                    } else {
                        console.error("La propiedad `tareas` no contiene un arreglo:", tasks);
                    }
                } else {
                    console.error("Error al obtener las tareas. Código de estado:", response.status);
                }
            })
            .catch((error) => {
                console.error("Error en la solicitud:", error);
            });
    }
    
    // Función para mostrar las tareas en el contenedor con checkbox
    function displayTasks(tasks) {
        const tasksContainer = document.getElementById("tasks");
        tasksContainer.innerHTML = ""; // Limpiar tareas previas
    
        tasks.forEach((task) => {
            const taskElement = document.createElement("div");
            taskElement.className = "task-item";
    
            taskElement.innerHTML = `
                <label>
                    <input type="checkbox" ${task.estado === "Completada" ? "checked" : ""} 
                        onchange="updateTaskProgress(${task.id_tarea}, this.checked)">
                    ${task.titulo}
                </label>
                <p>${task.descripcion}</p>
                <span class="task-category">${task.categoria}</span>
                <span class="task-date">${task.fecha}</span>
            `;
    
            tasksContainer.appendChild(taskElement);
        });
    }
    
    // Función para actualizar el progreso de la tarea en la base de datos
    window.updateTaskProgress = function (taskId, isChecked) {
        fetch("http://localhost:4000/actualizarTarea", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                authorization: token,
            },
            body: JSON.stringify({
                id_tarea: taskId,
                estado: isChecked ? "Completada" : "En progreso",
            }),
        })
            .then(async (response) => {
                if (response.ok) {
                    console.log("Tarea actualizada correctamente.");
                } else {
                    console.error("Error al actualizar la tarea.");
                }
            })
            .catch((error) => {
                console.error("Error en la solicitud:", error);
            });
    };
});    