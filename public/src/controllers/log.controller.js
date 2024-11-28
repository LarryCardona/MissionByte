import { pool } from "../conexion.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "51120077CR";

export const authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(401).json({ error: "No autorizado, token faltante" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded;

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      const { id_rol, organizacion, nombre } = jwt.decode(token);
      const newToken = jwt.sign({ id_rol, organizacion, nombre }, JWT_SECRET, {
        expiresIn: "2h",
      });

      return res
        .status(200)
        .json({ mensaje: "Token renovado", accessToken: newToken });
    }

    return res.status(401).json({ error: err.message });
  }
};
export const loginUser = async (req, res) => {
  const { correo, contrasena } = req.body;

  if (!correo || !contrasena) {
    return res
      .status(400)
      .json({ error: "Correo y contraseña son requeridos" });
  }

  try {
    // Consulta el usuario por correo
    const userResult = await pool.query(
      "SELECT * FROM usuarios WHERE correo = $1",
      [correo]
    );
    const user = userResult.rows[0];

    // Verifica si el usuario existe
    if (!user) {
      return res.status(404).json({ error: "Correo no encontrado" });
    }

    // Verifica la contraseña
    const passwordIsValid = bcrypt.compareSync(contrasena, user.contrasena);
    if (!passwordIsValid) {
      return res
        .status(401)
        .json({ error: "Contraseña incorrecta" });
    }

    // Genera el token JWT
    const accessToken = jwt.sign(
      { id_usuario: user.id_usuario, id_rol: user.id_rol, organizacion: user.organizacion },
      JWT_SECRET,
      { expiresIn: "2h" }
    );
    return res.status(200).json({
      mensaje: "Login exitoso",
      accessToken,
      nombre: user.nombre,
      id_rol: user.id_rol, // Enviar el id_rol en la respuesta
    });

  } catch (err) {
    console.error("Error en el proceso de login:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const registerUser = async (req, res) => {
  const { nombre, correo, contrasena, organizacion, id_rol, id_cargo } = req.body;

  // Validaciones de entrada
  if (!nombre || !correo || !contrasena || !organizacion || !id_rol || !id_cargo) {
    return res
      .status(400)
      .json("Todos los datos son requeridos, llene todos los campos");
  }

  try {
    // Verifica si el nombre ya está en uso
    const nameCheck = await pool.query(
      "SELECT * FROM usuarios WHERE nombre = $1",
      [nombre]
    );

    if (nameCheck.rows.length > 0) {
      return res
        .status(400)
        .json({ error: "El nombre ya está en uso. Por favor, elige otro." });
    }

    // Verifica si el correo ya está en uso
    const emailCheck = await pool.query(
      "SELECT * FROM usuarios WHERE correo = $1",
      [correo]
    );

    if (emailCheck.rows.length > 0) {
      return res
        .status(400)
        .json({ error: "El correo ya está en uso. Por favor, inicia sesión." });
    }

    // Verifica si la organización ya existe
    const orgCheck = await pool.query(
      "SELECT id_organizacion FROM organizacion WHERE organizacion = $1",
      [organizacion]
    );

    let id_organizacion;
    if (orgCheck.rows.length > 0) {
      // La organización ya existe, tomar su id
      id_organizacion = orgCheck.rows[0].id_organizacion;
    } else {
      // Insertar la nueva organización y obtener su id
      const orgResult = await pool.query(
        "INSERT INTO organizacion (organizacion) VALUES ($1) RETURNING id_organizacion",
        [organizacion]
      );
      id_organizacion = orgResult.rows[0].id_organizacion;
    }

    // Hashea la contraseña
    const hashedPassword = await bcrypt.hash(contrasena, 10);

    // Inserta el nuevo usuario en la tabla usuarios
    const userResult = await pool.query(
      `INSERT INTO usuarios 
      (nombre, correo, contrasena, id_organizacion, id_rol, id_cargo) 
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING id_usuario`,
      [nombre, correo, hashedPassword, id_organizacion, id_rol, id_cargo]
    );

    const id_usuario = userResult.rows[0].id_usuario;

    // Genera el token JWT con duración de 2 horas
    const token = jwt.sign(
      { id_usuario, id_rol, id_organizacion},
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    // Respuesta de éxito con los datos insertados y el token
    return res.status(201).json({
      mensaje: "Usuario registrado exitosamente.",
      nombre,
      token
    });
  } catch (error) {
    console.error("Error al registrar el usuario:", error);
    return res.status(500).json({ error: "Error del servidor" });
  }
};
