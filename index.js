import express from "express";
import morgan from "morgan";
import dotenv from 'dotenv';
import helmet from "helmet";
import cors from "cors";
import logRoutes from "./public/src/routes/log.routes.js";
import tareasRoutes from "./public/src/routes/tareas.routes.js";
import usuariosRoutes from "./public/src/routes/usuarios.routes.js";

const app = express();

dotenv.config();

const PORT= process.env.PORT;

app.use(cors({
    origin: 'http://127.0.0.1:5500',  
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: 'Authorization, Content-Type',
    credentials: true
}));

app.use(morgan("dev"));
app.set('view engine', 'ejs');

app.use(express.static('public'));

app.get('/',  (req, res) => {

    res.render('index');
});

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(logRoutes);
app.use(tareasRoutes);
app.use(usuariosRoutes);


app.listen(PORT, () => {
    console.log(`Escuchando en el puerto ${PORT}`);
});
