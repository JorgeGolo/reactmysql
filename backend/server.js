const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Configura la conexión con MySQL
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

// Conectar a la base de datos
db.connect((err) => {
    if (err) {
        console.error('Error de conexión:', err);
        process.exit(1); // Finaliza el proceso si falla la conexión
    }
    console.log('Conectado a la base de datos de MySQL');
});

// Rutas de prueba
app.get('/api/test', (req, res) => {
    res.send('¡Servidor funcionando!');
});

// Ruta para obtener datos de la tabla temas
app.get('/api/temas', (req, res) => {
  const sql = 'SELECT * FROM temas';
  db.query(sql, (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Error al obtener temas' });
      return;
    }
    res.json(results);
  });
});

// Iniciar el servidor
app.listen(5000, () => {
    console.log('Servidor backend corriendo en http://localhost:5000');
});
