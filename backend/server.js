
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
    const { modelo, temaNombre, temaId } = req.body;

    try {
        // Extraer todas las preguntas del tema específico desde la base de datos
        const getAllQuestionsQuery = 'SELECT pregunta FROM preguntas WHERE id_tema = ?';
        db.query(getAllQuestionsQuery, [temaId], async (error, results) => {
            if (error) {
                console.error('Error al obtener las preguntas existentes:', error);
                return res.status(500).json({ message: 'Error al verificar preguntas existentes' });
            }

            // Concatenar todas las preguntas existentes en una sola cadena
            let existingQuestions = results.map(row => row.pregunta).join(' | ');

            // Definir un límite de caracteres (por ejemplo, 500 caracteres)
            const maxLength = 3000;

            // Truncar existingQuestions al principio si excede el límite
            if (existingQuestions.length > maxLength) {
                existingQuestions = existingQuestions.substring(existingQuestions.length - maxLength); // Mantener los últimos maxLength caracteres
            }
            // Llamada a la API de OpenAI para generar la pregunta, incluyendo las preguntas existentes en el prompt
            const chatCompletion = await openai.chat.completions.create({
                model: modelo || "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: "Eres un asistente útil que genera preguntas de quiz con cuatro opciones de respuesta." },
                    {
                        role: "user",
                        content: `Genera una pregunta sobre ${temaNombre} con cuatro respuestas posibles. Una será la correcta.
                                 No repitas ninguna de las preguntas ya existentes: "${existingQuestions}".
                                 Sigue este formato:
                                 
                                 Pregunta
                                 Respuesta 1
                                 Respuesta 2
                                 Respuesta 3
                                 Respuesta 4
                                 1

                                 Es importante que no pongas números, letras, ni símbolos delante de las respuestas.
                                 Solo el texto de cada respuesta y, al final, el número de la respuesta correcta en la última línea.
                                 La pregunta debe ir en una sola línea, y cada respuesta en una línea para cada una.`
                    }
                ],
                max_tokens: 100,
                temperature: 0.2
            });

            const generatedText = chatCompletion.choices[0].message.content;

            // Procesar el texto generado para separar la pregunta y las respuestas
            const [question, ...answers] = generatedText.split('\n').filter(line => line.trim());
            const correctAnswer = answers.pop();

            // Preparar el objeto de pregunta generada
            const preguntaGenerada = {
                pregunta: question,
                respuesta_1: answers[0] || '',
                respuesta_2: answers[1] || '',
                respuesta_3: answers[2] || '',
                respuesta_4: answers[3] || '',
                respuesta_correcta: correctAnswer || ''
            };

            // Insertar la pregunta generada en la base de datos
            const insertQuery = `
                INSERT INTO preguntas (pregunta, id_tema, respuesta_1, respuesta_2, respuesta_3, respuesta_4, respuesta_correcta)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;
            db.query(insertQuery, [question, temaId, answers[0], answers[1], answers[2], answers[3], correctAnswer], (error, results) => {
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
// Ruta para obtener datos de la tabla test
app.get('/api/tests', (req, res) => {
    const sql = 'SELECT * FROM test'; // Consulta para obtener todos los tests
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error al obtener los tests:', err);
            res.status(500).json({ error: 'Error al obtener los tests' });
        } else {
            res.json(results); // Enviar los resultados como respuesta JSON
        }
    });
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

app.post('/api/tests', (req, res) => {
    const { tema_id, numero_preguntas } = req.body;

    // Establecemos la consulta para insertar la fecha actual junto con tema_id y numero_preguntas
    const query = 'INSERT INTO test (fecha, tema_id, numero_preguntas) VALUES (NOW(), ?, ?)';
    
    db.query(query, [tema_id, numero_preguntas], (error, results) => {
        if (error) {
            console.error('Error al insertar en la tabla test:', error);
            return res.status(500).json({ error: 'Error al crear el test.' });
        }
        
        // Respuesta exitosa con los datos insertados
        res.status(201).json({
            message: 'Test creado exitosamente',
            testId: results.insertId,
            fecha: new Date(), // Fecha actual
            tema_id,
            numero_preguntas
        });
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



// Ruta para obtener un número específico de preguntas de un tema basado en el test
app.get('/api/tests/:testId/preguntas', (req, res) => {
    const testId = req.params.testId; // Obtén el ID del test de los parámetros de la ruta

    // Consulta para obtener el tema y el número de preguntas del test
    const testQuery = 'SELECT tema_id, numero_preguntas FROM test WHERE id = ?';

    db.query(testQuery, [testId], (err, testResults) => {
        if (err) {
            console.error('Error al obtener datos del test:', err);
            return res.status(500).json({ message: 'Error al obtener datos del test' });
        }

        if (testResults.length === 0) {
            return res.status(404).json({ message: 'No se encontró el test' });
        }

        const temaId = testResults[0].tema_id;
        const numeroPreguntas = testResults[0].numero_preguntas;

        // Consulta para obtener un número específico de preguntas del tema
        const preguntasQuery = 'SELECT * FROM preguntas WHERE id_tema = ? LIMIT ?';

        db.query(preguntasQuery, [temaId, numeroPreguntas], (err, preguntasResults) => {
            if (err) {
                console.error('Error al obtener preguntas:', err);
                return res.status(500).json({ message: 'Error al obtener preguntas' });
            }

            if (preguntasResults.length === 0) {
                return res.status(404).json({ message: 'No se encontraron preguntas para este tema' });
            }

            res.json(preguntasResults); // Devuelve las preguntas encontradas
        });
    });
});