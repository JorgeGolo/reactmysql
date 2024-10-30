
require('dotenv').config({ path: '../.env' });
console.log(process.env.DB_HOST, process.env.DB_USER, process.env.DB_PASSWORD, process.env.DB_NAME);

const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const { OpenAI, Configuration } = require('openai');

const app = express();
app.use(cors());
app.use(express.json());


const openai = new OpenAI({
    apiKey: process.env['OPENAI_API_KEY'],
  });




// Configura la conexión con MySQL
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

app.post('/api/test-openai', async (req, res) => {
    try {
        const response = await openai.listModels();
        res.json(response.data);
    } catch (error) {
        console.error('Error al conectar con OpenAI:', error);
        res.status(500).json({ error: 'Error de conexión a OpenAI' });
    }
});
// Conectar a la base de datos
db.connect((err) => {
    if (err) {
        console.error('Error de conexión:', err);
        process.exit(1); // Finaliza el proceso si falla la conexión
    }
    console.log('Conectado a la base de datos de MySQL');
});

// Ruta para las preguntas para OpenAI
app.post('/api/generate', async (req, res) => {
    const { modelo, temaNombre } = req.body; // Recibir el modelo y tema del frontend

    try {
        // Llamada a la API de OpenAI para generar la pregunta
        const chatCompletion = await openai.chat.completions.create({
            model: modelo || "gpt-4", // Usa el modelo proporcionado por el usuario o gpt-4 por defecto
            messages: [
                { role: "system", content: "Eres un asistente útil que genera preguntas de quiz con cuatro opciones de respuesta." },
                { role: "user", content: `Genera una pregunta sobre ${temaNombre} con cuatro posibles respuestas. Agrega la respuesta correcta en otra línea.` }
            ],
        });

        // Imprimir la respuesta completa para depuración
        console.log('Respuesta de la API:', chatCompletion);

        // Verificar si la respuesta tiene la estructura esperada
        if (!chatCompletion || !chatCompletion.choices || chatCompletion.choices.length === 0) {
            throw new Error('No se recibieron opciones de la API de OpenAI.');
        }

        const generatedText = chatCompletion.choices[0].message.content;

        // Extraemos la pregunta y respuestas desde el texto generado
        const [question, ...answers] = generatedText.split('\n').filter(line => line.trim());

        // Suponiendo que la respuesta correcta se coloca en la última línea
        const correctAnswer = answers.pop(); // Extraer la respuesta correcta

        // Enviar la pregunta y respuestas al frontend
        res.json({
            pregunta: question,
            respuesta_1: answers[0] || '',
            respuesta_2: answers[1] || '',
            respuesta_3: answers[2] || '',
            respuesta_4: answers[3] || '',
            respuesta_correcta: correctAnswer || '' // Incluir la respuesta correcta
        });
    } catch (error) {
        console.error('Error al generar la pregunta:', error);
        res.status(500).json({ error: error.message || 'Error al generar la pregunta' });
    }
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

app.post('/api/preguntas', (req, res) => {
    const { pregunta, temaId, respuestas, respuestaCorrecta } = req.body;

    // Verificar si la pregunta ya existe
    const checkQuery = 'SELECT * FROM preguntas WHERE pregunta = ? AND id_tema = ?';
    db.query(checkQuery, [pregunta, temaId], (checkError, checkResults) => {
        if (checkError) {
            console.error('Error al verificar la pregunta:', checkError);
            return res.status(500).json({ message: 'Error al verificar la pregunta' });
        }

        if (checkResults.length > 0) {
            return res.status(400).json({ message: 'La pregunta ya existe para este tema' });
        }

        // Si no existe, proceder a insertar
        const query = 'INSERT INTO preguntas (pregunta, id_tema, respuesta_1, respuesta_2, respuesta_3, respuesta_4, respuesta_correcta) VALUES (?, ?, ?, ?, ?, ?, ?)';
        db.query(query, [pregunta, temaId, respuestas[0], respuestas[1], respuestas[2], respuestas[3], respuestaCorrecta], (error, results) => {
            if (error) {
                console.error('Error al insertar la pregunta:', error);
                res.status(500).json({ message: 'Error al agregar la pregunta' });
            } else {
                res.status(201).json({ id: results.insertId, pregunta, temaId, respuestas, respuestaCorrecta });
            }
        });
    });
});


// Endpoint para agregar un nuevo tema
app.post('/api/temas', (req, res) => {
    const { nombre } = req.body;
    const query = 'INSERT INTO temas (nombre) VALUES (?)';
  
    db.query(query, [nombre], (error, results) => {
      if (error) {
        console.error('Error al insertar el tema:', error);
        res.status(500).json({ message: 'Error al agregar el tema' });
      } else {
        res.status(201).json({ id: results.insertId, nombre });
      }
    });
  });

// Iniciar el servidor
app.listen(5000, () => {
    console.log('Servidor backend corriendo en http://localhost:5000');
});

// Ruta para obtener preguntas por temaId
app.get('/api/preguntas/:temaId', (req, res) => {
    const temaId = req.params.temaId; // Obtén el ID del tema de los parámetros de la ruta
    const sql = 'SELECT * FROM preguntas WHERE id_tema = ?'; // Consulta para obtener las preguntas

    db.query(sql, [temaId], (err, results) => {
        if (err) {
            console.error('Error al obtener preguntas:', err);
            return res.status(500).json({ message: 'Error al obtener preguntas' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'No se encontraron preguntas para este tema' });
        }

        res.json(results); // Devuelve las preguntas encontradas
    });
});
