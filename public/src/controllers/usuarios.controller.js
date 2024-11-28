import { pool } from "../conexion.js";
import jwt from "jsonwebtoken";
import { verificarRol } from "./tareas.controller.js";

const JWT_SECRET = process.env.JWT_SECRET || "51120077CR";

export const ObtenerTareas = async (req, res) => {
  try {
    // Obtiene el token del encabezado de autorización
    const token = req.headers["authorization"];

    // Decodifica el token para obtener el id_usuario
    const decodedToken = jwt.verify(token, JWT_SECRET); // Cambia 'tu_secreto' por tu clave secreta
    const id_usuario = decodedToken.id_usuario;

    // Realiza la consulta a PostgreSQL usando el pool
    const result = await pool.query(
      `SELECT id_tarea, titulo, descripcion, fecha, categoria, estado 
               FROM tareas 
               WHERE id_usuario = $1`,
      [id_usuario]
    );

    // Asegúrate de que el resultado sea un arreglo
    const tareas = result.rows;

    // Formatea las tareas y usa 'fecha' en lugar de 'fecha_creacion'
    const response = {
      tareas: tareas.map((tarea) => ({
        id_tarea: tarea.id_tarea, // Incluye id_tarea
        titulo: tarea.titulo,
        descripcion: tarea.descripcion,
        fecha: tarea.fecha, // Cambio de 'fecha_creacion' a 'fecha'
        categoria: tarea.categoria,
        estado: tarea.estado,
      })),
    };

    // Envía la respuesta como JSON
    res.status(200).json(response);
  } catch (error) {
    console.error("Error al obtener las tareas:", error.message);
    res.status(500).json({ mensaje: "Error al obtener las tareas" });
  }
};

export const obtenerUsuariosOrg = async (req, res) => {
  const {organizacion} = req.body; // La organización viene en el cuerpo de la solicitud
  const token = req.headers["authorization"]; // Se espera "Bearer <token>"
    console.log(organizacion)
  // Verificar el token y el rol del usuario
  if (!token || !verificarRol(token)) {
    return res
      .status(403)
      .json({ mensaje: "Acceso denegado. Rol no autorizado." });
  }

  try {
    const resultOrganizacion = await pool.query(
      `SELECT id_organizacion FROM organizacion WHERE organizacion = $1`,
      [organizacion]
    );

    // Verificar si la organización existe
    if (resultOrganizacion.rows.length === 0) {
      return res.status(404).json({ mensaje: "Organización no encontrada." });
    }

    const id_organizacion = resultOrganizacion.rows[0].id_organizacion;

    // 2. Obtener los usuarios asociados a la organización
    const resultUsuarios = await pool.query(
      `SELECT id_usuario, nombre FROM usuarios WHERE id_organizacion = $1`,
      [id_organizacion]
    );

    // Verificar si se encontraron usuarios
    if (resultUsuarios.rows.length === 0) {
      return res
        .status(404)
        .json({
          mensaje: "No se encontraron usuarios para esta organización.",
        });
    }

    // Formatear la respuesta
    const usuarios = resultUsuarios.rows.map((usuario) => ({
      id_usuario: usuario.id_usuario,
      nombre: usuario.nombre,
    }));

    // Responder con los usuarios encontrados
    return res.status(200).json({ usuarios });
  } catch (error) {
    console.error("Error al obtener los usuarios:", error.message);
    return res.status(500).json({ mensaje: "Error interno del servidor." });
  }
};

export const ActualizarProgresoTareas = async (req, res) => {
  try {
    // Obtén el token del encabezado de autorización
    const token = req.headers["authorization"];

    // Decodifica el token para obtener el id_usuario
    const decodedToken = jwt.verify(token, JWT_SECRET); // Cambia 'JWT_SECRET' por tu clave secreta
    const id_usuario = decodedToken.id_usuario;

    // Obtén el arreglo de tareas desde el cuerpo de la solicitud
    const { tareas } = req.body;

    if (!Array.isArray(tareas) || tareas.length === 0) {
      return res.status(400).json({ mensaje: "Se requiere un arreglo de tareas válido." });
    }

    // Itera sobre cada tarea y actualiza su estado
    const updates = tareas.map(({ id_tarea, estado }) => {
      return pool.query(
        `UPDATE tareas 
         SET estado = $1 
         WHERE id_tarea = $2 AND id_usuario = $3`,
        [estado, id_tarea, id_usuario]
      );
    });

    // Ejecuta todas las actualizaciones en paralelo
    const results = await Promise.all(updates);

    // Verifica cuántas tareas se actualizaron
    const totalActualizadas = results.reduce((count, result) => count + result.rowCount, 0);

    res.status(200).json({
      mensaje: `${totalActualizadas} tareas actualizadas correctamente.`,
      totalActualizadas,
    });
  } catch (error) {
    console.error("Error al actualizar el progreso de las tareas:", error.message);
    res.status(500).json({ mensaje: "Error interno al actualizar el progreso de las tareas." });
  }
};

