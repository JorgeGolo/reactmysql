
require('dotenv').config({ path: '../.env' });
console.log(process.env.DB_HOST, process.env.DB_USER, process.env.DB_PASSWORD, process.env.DB_NAME);

const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const { OpenAI } = require('openai');

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

app.post('/api/generate', async (req, res) => {
    const { modelo, temaNombre, temaId } = req.body; // Recibir el modelo, tema y temaId desde el frontend

    try {
        // Llamada a la API de OpenAI para generar la pregunta
        const chatCompletion = await openai.chat.completions.create({
            model: modelo || "gpt-4",
            messages: [
                { role: "system", content: "Eres un asistente útil que genera preguntas de quiz con cuatro opciones de respuesta." },
                { role: "user", content: `Genera una pregunta sobre ${temaNombre} con cuatro posibles respuestas. Agrega la respuesta correcta en otra línea.` }
            ],
        });

        const generatedText = chatCompletion.choices[0].message.content;

        // Procesar el texto generado para separar la pregunta y las respuestas
        const [question, ...answers] = generatedText.split('\n').filter(line => line.trim());

        // Eliminar letras y paréntesis al inicio de cada respuesta y limpiar la respuesta correcta
        const cleanAnswers = answers.map(answer => answer.replace(/^[A-D]\)\s*/, '').trim());
        const correctAnswer = cleanAnswers.pop().replace(/^Respuesta correcta:\s*/, '');

        // Enviar la pregunta generada al frontend
        const preguntaGenerada = {
            pregunta: question,
            respuesta_1: cleanAnswers[0] || '',
            respuesta_2: cleanAnswers[1] || '',
            respuesta_3: cleanAnswers[2] || '',
            respuesta_4: cleanAnswers[3] || '',
            respuesta_correcta: correctAnswer || ''
        };
        // Verificar si la pregunta ya existe en la base de datos
        const checkQuery = 'SELECT * FROM preguntas WHERE pregunta = ? AND id_tema = ?';
        db.query(checkQuery, [question, temaId], (checkError, checkResults) => {
            if (checkError) {
                console.error('Error al verificar la pregunta en la base de datos:', checkError);
                return res.status(500).json({ message: 'Error al verificar la pregunta' });
            }

            if (checkResults.length > 0) {
                return res.status(400).json({ message: 'La pregunta ya existe para este tema' });
            }

            // Si la pregunta no existe, insertarla en la base de datos
            const query = `
                INSERT INTO preguntas (pregunta, id_tema, respuesta_1, respuesta_2, respuesta_3, respuesta_4, respuesta_correcta)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;
            db.query(query, [question, temaId, answers[0], answers[1], answers[2], answers[3], correctAnswer], (error, results) => {
                if (error) {
                    console.error('Error al guardar la pregunta en la base de datos:', error);
                    return res.status(500).json({ message: 'Error al guardar la pregunta' });
                }

                // Enviar la pregunta generada y confirmación de guardado al frontend
                res.status(201).json({
                    id: results.insertId,
                    ...preguntaGenerada,
                    message: 'Pregunta generada y guardada exitosamente'
                });
            });
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
