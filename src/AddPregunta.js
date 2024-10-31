// AddPregunta.js
import React, { useState } from 'react';
import axios from 'axios';

function AddPregunta({ temaId, onAddPregunta }) {
  const [pregunta, setPregunta] = useState('');
  const [respuesta1, setRespuesta1] = useState('');
  const [respuesta2, setRespuesta2] = useState('');
  const [respuesta3, setRespuesta3] = useState('');
  const [respuesta4, setRespuesta4] = useState('');
  const [respuestaCorrecta, setRespuestaCorrecta] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('handleSubmit llamado'); // Añadir este log

    const nuevaPregunta = {
      pregunta,
      temaId,
      respuestas: [respuesta1, respuesta2, respuesta3, respuesta4],
      respuestaCorrecta,
    };

    // Llama a la función para actualizar el estado en App.js
    onAddPregunta(nuevaPregunta); 
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Pregunta:</label>
        <input
          type="text"
          value={pregunta}
          onChange={(e) => setPregunta(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Respuesta 1:</label>
        <input
          type="text"
          value={respuesta1}
          onChange={(e) => setRespuesta1(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Respuesta 2:</label>
        <input
          type="text"
          value={respuesta2}
          onChange={(e) => setRespuesta2(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Respuesta 3:</label>
        <input
          type="text"
          value={respuesta3}
          onChange={(e) => setRespuesta3(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Respuesta 4:</label>
        <input
          type="text"
          value={respuesta4}
          onChange={(e) => setRespuesta4(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Respuesta Correcta (1-4):</label>
        <input
          type="number"
          value={respuestaCorrecta}
          onChange={(e) => setRespuestaCorrecta(e.target.value)}
          min="1"
          max="4"
          required
        />
      </div>
      <button type="submit">Añadir Pregunta</button>
    </form>
  );
}

export default AddPregunta;
