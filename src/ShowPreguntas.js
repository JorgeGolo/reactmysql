// ShowPreguntas.js
import React from 'react';

const ShowPreguntas = ({ preguntas, temaNombre }) => {
  return (
    <div>
      <h4>Preguntas para el tema: {temaNombre}</h4>
      <ul>
        {preguntas.map((pregunta) => (
          <li key={pregunta.id}>
            <span>{pregunta.pregunta}</span>
            {/* Asume que cada pregunta tiene un 'id' y 'pregunta' */}
            <span>{pregunta.respuesta_1}</span>
            <span>{pregunta.respuesta_2}</span>
            <span>{pregunta.respuesta_3}</span>
            <span>{pregunta.respuesta_4}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ShowPreguntas;