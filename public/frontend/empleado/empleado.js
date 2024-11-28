const username = localStorage.getItem("nombreUsuario");

function Enviar() {
  window.location.href = "../login/login.html";
}
async function obtenerTareas() {
    const token = localStorage.getItem("authToken"); // Obtener el token del localStorage
  
    if (!token) {
      console.error("No se encontró el token de autenticación");
      return;
    }
  
    try {
      const response = await fetch("http://localhost:4000/obtenerTareas", {
        method: "GET",
        headers: {
          Authorization: token, // Enviar solo el token en el header de la solicitud
          "Content-Type": "application/json",
        },
      });
  
      if (!response.ok) {
        throw new Error("Error al obtener las tareas");
      }
  
      const data = await response.json();
  
      // Llamar a la función para mostrar las tareas en el HTML
      mostrarTareas(data.tareas);
    } catch (error) {
      console.error("Hubo un error al realizar la solicitud:", error);
    }
  }
  
  function mostrarTareas(tareas) {
    const tasksContainer = document.getElementById("tasks");
    tasksContainer.innerHTML = ""; // Limpiar cualquier tarea anterior
  
    tareas.forEach((tarea) => {
      // Crear el div contenedor de la tarea
      const tareaDiv = document.createElement("div");
      tareaDiv.classList.add("tarea"); // Puedes agregar clases CSS para cada tarea
  
      // Crear el checkbox para la tarea
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.id = `tarea-${tarea.id_tarea}`;
  
      // Crear un contenedor para el Título
      const tituloDiv = document.createElement("div");
      tituloDiv.classList.add("tarea-titulo");
      tituloDiv.textContent = `Título: ${tarea.titulo}`;
  
      // Crear un contenedor para la Categoría
      const categoriaDiv = document.createElement("div");
      categoriaDiv.classList.add("tarea-categoria");
      categoriaDiv.textContent = `Categoría: ${tarea.categoria}`;
  
      // Crear un contenedor para la Descripción
      const descripcionDiv = document.createElement("div");
      descripcionDiv.classList.add("tarea-descripcion");
      descripcionDiv.textContent = `Descripción: ${tarea.descripcion}`;
  
      // Agregar checkbox al div de tarea
      tareaDiv.appendChild(checkbox);
  
      // Agregar los contenedores de Título, Categoría y Descripción a la tarea
      tareaDiv.appendChild(tituloDiv);
      tareaDiv.appendChild(categoriaDiv);
      tareaDiv.appendChild(descripcionDiv);
  
      // Agregar la tarea completa al contenedor principal de tareas
      tasksContainer.appendChild(tareaDiv);
    });
  }
  
  

// Llamar a la función para obtener las tareas al cargar la página
document.addEventListener("DOMContentLoaded", obtenerTareas);

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
        updateUIWithUserDetails();// Llamar para obtener las misiones
      } else if (response.accessToken) {
        localStorage.setItem("authToken", response.accessToken);
        token = response.accessToken;

        updateUIWithUserDetails();

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
});
