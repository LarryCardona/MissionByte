document.addEventListener("DOMContentLoaded", () => {
    const addTaskButton = document.getElementById("addTaskButton");
    const tasksContainer = document.getElementById("tasksContainer");

    // Mostrar formulario al hacer click en el botón de añadir tarea
    addTaskButton.addEventListener("click", () => {
        showTaskForm();
    });

    // Función para mostrar el formulario de nueva tarea
    function showTaskForm() {
        const taskForm = `
            <div id="taskFormContainer" class="task-form-container">
                <h3>Agregar Nueva Tarea</h3>
                <form id="taskForm">
                    <label for="titulo">Título:</label>
                    <input type="text" id="titulo" name="titulo" required>

                    <label for="descripcion">Descripción:</label>
                    <textarea id="descripcion" name="descripcion" required></textarea>

                    <label for="fecha_creacion">Fecha de Creación:</label>
                    <input type="date" id="fecha_creacion" name="fecha_creacion" required>

                    <label for="categoria">Categoría:</label>
                    <select id="categoria" name="categoria" required>
                        <option value="Alta prioridad">Alta prioridad</option>
                        <option value="Media prioridad">Media prioridad</option>
                        <option value="Baja prioridad">Baja prioridad</option>
                    </select>

                    <label for="estado">Estado:</label>
                    <select id="estado" name="estado" required>
                        <option value="En progreso">En progreso</option>
                        <option value="Completada">Completada</option>
                        <option value="Pendiente">Pendiente</option>
                    </select>

                    <label for="usuario">Asignar Usuario:</label>
                    <select id="usuario" name="usuario" required>
                        <!-- Aquí se llenarán los usuarios disponibles -->
                    </select>

                    <button type="submit" id="submitTask">Crear Tarea</button>
                    <button type="button" id="cancelTask" onclick="cancelTaskForm()">Cancelar</button>
                </form>
            </div>
        `;
        
        // Insertar el formulario en el contenedor de tareas
        tasksContainer.innerHTML = taskForm;

        // Llamar a la función que carga los usuarios
        loadUsers();
    }

    // Función para cargar los usuarios en el campo de selección
    function loadUsers() {
        fetch("http://localhost:4000/obtenerUsuarios", {
            method: "GET",
            headers: {
                "authorization": localStorage.getItem("authToken"),
            },
        })
            .then(response => response.json())
            .then(data => {
                const usuarioSelect = document.getElementById("usuario");
                
                // Añadir cada usuario a la lista desplegable
                data.usuarios.forEach(user => {
                    const option = document.createElement("option");
                    option.value = user.id_usuario;
                    option.textContent = user.nombre;
                    usuarioSelect.appendChild(option);
                });
            })
            .catch(error => {
                console.error("Error al cargar los usuarios:", error);
            });
    }

    // Función para manejar la creación de la tarea
    document.getElementById("taskForm").addEventListener("submit", function(event) {
        event.preventDefault();

        const titulo = document.getElementById("titulo").value;
        const descripcion = document.getElementById("descripcion").value;
        const fecha_creacion = document.getElementById("fecha_creacion").value;
        const categoria = document.getElementById("categoria").value;
        const estado = document.getElementById("estado").value;
        const usuario = document.getElementById("usuario").value;

        const taskData = {
            titulo,
            descripcion,
            fecha_creacion,
            categoria,
            estado,
            usuario,
        };

        // Enviar los datos de la nueva tarea al backend
        fetch("http://localhost:4000/agregarTarea", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "authorization": localStorage.getItem("authToken"), // Enviar token
            },
            body: JSON.stringify(taskData),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert("Tarea creada con éxito");
                // Aquí podrías recargar las tareas o añadir la tarea creada al DOM
                cancelTaskForm(); // Cerrar el formulario
            } else {
                alert("Error al crear la tarea");
            }
        })
        .catch(error => {
            console.error("Error al crear la tarea:", error);
        });
    });

    // Función para cancelar la creación de la tarea
    function cancelTaskForm() {
        // Volver al estado original, por ejemplo, mostrando solo las tareas
        fetchTasks();  // Asegúrate de que fetchTasks obtenga todas las tareas
    }

});

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

      console.log(response);

      if (response.valid) {
        // Token válido, configurar interfaz de usuario y cargar datos
        updateUIWithUserDetails();
        loadData(); // Llamamos a loadData aquí
      } else if (response.accessToken) {
        // Token expirado, pero el servidor ha enviado un nuevo token
        localStorage.setItem("authToken", response.accessToken); // Guardar el nuevo token
        token = response.accessToken; // Actualizar la variable local

        // Reintentar configuración de la interfaz con el nuevo token y cargar datos
        updateUIWithUserDetails();
        loadData(); // Llamamos a loadData aquí también
      } else {
        console.log("Token inválido.");
      }
    });
  }

  // Función para configurar la interfaz de usuario si el token es válido o se ha renovado
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
});
