// ShowPreguntas.js
import React from 'react';

const ShowPreguntas = ({ preguntas, temaNombre }) => {
  return (
    <div>
      <h4>Preguntas para el tema: {temaNombre}</h4>
      <ul>
        {preguntas.map((pregunta) => (
          <li key={pregunta.id}>{pregunta.pregunta}</li> // Asume que cada pregunta tiene un 'id' y 'pregunta'
        ))}
      </ul>
    </div>
  );
};

export default ShowPreguntas;