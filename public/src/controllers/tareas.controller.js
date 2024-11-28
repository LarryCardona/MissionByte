import { pool } from "../conexion.js";
import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "51120077CR";

export const verificarRol = async (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET); // Cambia "tu_secreto" por tu clave secreta
    return decoded.id_rol == 1;
  } catch (error) {
    console.error("Error al verificar el token:", error.message);
    return false;
  }
};

export const insertarTareas = async (req, res) => {
  const token = req.headers["authorization"]; // Se espera "Bearer <token>"
  const { tareas } = req.body; // Las tareas vienen en el cuerpo de la solicitud

  // Verificar el rol del usuario
  if (!token || !verificarRol(token)) {
    return res
      .status(403)
      .json({ mensaje: "Acceso denegado. Rol no autorizado." });
  }

  // Validación de datos recibidos
  if (!Array.isArray(tareas) || tareas.length === 0) {
    console.log("Tareas recibidas:", tareas); // Verifica que las tareas estén llegando correctamente
    return res
      .status(400)
      .json({
        mensaje: "El formato de las tareas es incorrecto o está vacío.",
      });
  }

  try {
    // Iterar sobre las tareas y hacer la inserción
    for (const tarea of tareas) {
      const {
        id_tarea,
        titulo,
        descripcion,
        fecha_creacion,
        categoria,
        estado,
        id_usuario,
      } = tarea;

      // Verificar que el `id_tarea` no exista
      const idCheck = await pool.query(
        `SELECT * FROM tareas WHERE id_tarea = $1`,
        [id_tarea]
      );
      if (idCheck.rows.length > 0) {
        console.log(`El id_tarea "${id_tarea}" ya existe. Saltando...`);
        continue; // Salta a la siguiente tarea
      }

      // Verificar si ya existe una tarea similar (por título, descripción e id_usuario)
      const taskCheck = await pool.query(
        `SELECT * FROM tareas WHERE titulo = $1 AND descripcion = $2 AND id_usuario = $3`,
        [titulo, descripcion, id_usuario]
      );

      if (taskCheck.rows.length > 0) {
        console.log(
          `La tarea con título "${titulo}" y descripción "${descripcion}" ya existe para el usuario ${id_usuario}. Saltando...`
        );
        continue; // Salta a la siguiente tarea
      }

      // Si el id_tarea y la tarea no existen, insertar
      const query = `
        INSERT INTO tareas (id_tarea, titulo, descripcion, fecha, categoria, estado, id_usuario)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `;
      await pool.query(query, [
        id_tarea,
        titulo,
        descripcion,
        fecha_creacion,
        categoria,
        estado,
        id_usuario,
      ]);
      console.log(`Tarea insertada con éxito: ${titulo}`);
    }

    return res
      .status(201)
      .json({ mensaje: "Tareas insertadas correctamente." });
  } catch (error) {
    console.error("Error al insertar las tareas:", error.message);
    return res.status(500).json({ mensaje: "Error interno del servidor." });
  }
};
