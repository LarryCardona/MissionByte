// Crear un MutationObserver
const observer = new MutationObserver(function (mutationsList) {
  mutationsList.forEach(function (mutation) {
    if (mutation.type === "childList" || mutation.type === "attributes") {
      const signUpButton = document.getElementById("signUp");
      const signInButton = document.getElementById("signIn");
      const switchToSignInButton = document.getElementById("switchToSignIn");
      const switchToSignUpButton = document.getElementById("switchToSignUp");
      const aContainer = document.getElementById("a-container");
      const bContainer = document.getElementById("b-container");
      const switchC1 = document.getElementById("switch-c1");
      const switchC2 = document.getElementById("switch-c2");

      switchToSignInButton.addEventListener("click", () => {
        aContainer.classList.add("is-hidden");
        bContainer.classList.remove("is-hidden");
        bContainer.classList.add("is-z200");
        switchC2.classList.remove("is-hidden");
        switchC1.classList.add("is-hidden");
      });

      switchToSignUpButton.addEventListener("click", () => {
        aContainer.classList.remove("is-hidden");
        bContainer.classList.add("is-hidden");
        aContainer.classList.add("is-z200");
        switchC1.classList.remove("is-hidden");
        switchC2.classList.add("is-hidden");
      });
    }
  });
});

observer.observe(document.body, { childList: true, subtree: true });

// Guardar tokens en localStorage
// Guardar tokens en localStorage
function setToken(key, value) {
  localStorage.setItem(key, value);
}

// Obtener el token desde localStorage
function getToken(key) {
  return localStorage.getItem(key);
}

// Borrar el token desde localStorage
function removeToken(key) {
  localStorage.removeItem(key);
}

function validarLogin() {
  const correo = document.getElementById("signInEmail").value.trim();
  const contrasena = document.getElementById("signInPassword").value.trim();
  const mensajeElem = document.getElementById("Mensaje");

  // Validación de campos
  if (!correo || !contrasena) {
    mensajeElem.innerText = "Por favor, llene todos los campos.";
    return;
  }

  const logindata = {
    correo,
    contrasena,
  };

  // Enviar datos al servidor para el login
  fetch("http://localhost:4000/loginUser", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(logindata),
  })
    .then((response) => {
      if (!response.ok) {
        return response.json().then((error) => {
          throw new Error(error.error || "Error desconocido");
        });
      }
      return response.json();
    })
    .then((data) => {
      mensajeElem.innerText = data.mensaje || "Login exitoso";

      localStorage.setItem("authToken", data.accessToken);
      localStorage.setItem("nombreUsuario", data.nombre);

      switch (data.id_rol) {
        case 1: // Rol administrador
          window.location.href = "";
          break;
        case 2: // Rol empleado
          window.location.href = "../empleado/empleado.html";
          break;
        default:
          window.location.href = ""; // Redirige a la página principal
      }
    })
    .catch((error) => {
      mensajeElem.innerText = error.message;
      console.error("Error:", error);
    });
}

function registrar() {
  const nombre = document.getElementById("nombre").value.trim();
  const correo = document.getElementById("correo").value.trim();
  const contrasena = document.getElementById("contrasena").value.trim();
  const organizacion = document
    .getElementById("organizacion")
    .value.toUpperCase();
  const cargo = document.getElementById("cargo").value.trim().toUpperCase();

  const mensajeElem = document.getElementById("mensaje");

  if (!nombre || !correo || !contrasena || !organizacion || !cargo) {
    mensajeElem.innerText = "Llene todos los campos.";
    return;
  }

  let id_cargo;
  if (cargo === "LIDER") {
    id_cargo = 1;
  } else if (cargo === "EMPLEADO") {
    id_cargo = 2;
  } else {
    mensajeElem.innerText = 'Cargo inválido. Debe ser "Lider" o "Empleado".';
    return;
  }

  const usuario = {
    nombre,
    correo,
    contrasena,
    organizacion,
    id_rol: id_cargo,
    id_cargo,
  };

  fetch("http://localhost:4000/registro", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(usuario),
  })
    .then((response) => {
      if (!response.ok) {
        return response.json().then((error) => {
          throw new Error(error.error || "Error desconocido");
        });
      }
      return response.json();
    })
    .then((data) => {
      mensajeElem.innerText = data.mensaje || "Registro exitoso";
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("nombreUsuario", data.nombre);

      switch (data.id_rol) {
        case 1: // Rol administrador
          window.location.href = "/admin";
          break;
        case 2: // Rol empleado
          window.location.href = "/empleado";
          break;
        default:
          window.location.href = "/"; // Redirige a la página principal
      }
    })
    .catch((error) => {
      mensajeElem.innerText = error.message;
      console.error("Error:", error);
    });
}
