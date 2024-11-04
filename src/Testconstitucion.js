import React, { useState } from 'react';
import axios from 'axios';  // Importar Axios
import Nav from './Nav';

function Testconstitucion() {
  // Estado para almacenar la respuesta del servidor
  const [descripcion, setDescripcion] = useState('');
  const [modelo] = useState('gpt-3.5-turbo'); // Definir el valor del campo oculto
  const [preguntaGenerada, setPreguntaGenerada] = useState('');

  // Pregunta tipo 1, a partir de artículo
  async function GenerarPreguntaA(e) {
    e.preventDefault(); // Prevenir el comportamiento por defecto del formulario
    console.log("pregunta A");
    try {
      // Llamar al endpoint usando Axios, incluyendo el campo oculto
      const response = await axios.get('http://localhost:5000/api/preguntaconsta', {
        params: {
          modelo: modelo, // Enviar el valor del campo oculto
        },
      });
      // Actualizar el estado con la descripción
      setDescripcion(response.data.descripcion);
      setPreguntaGenerada(response.data.pregunta); // Cambiado aquí
    } catch (error) {
      console.error('Error:', error);
      setDescripcion('Ocurrió un error al generar la pregunta.');
    }
  }

  return (
    <div>
      <Nav />
      <form onSubmit={GenerarPreguntaA}>
        <input type="hidden" value={modelo} name="modelo" /> {/* Usar el estado modelo */}
        <button type="submit">Generar Pregunta a partir de artículo aleatorio</button>
      </form>
      {/* Mostrar la respuesta */}
      {/*descripcion && (
        <div>
          <h4>Descripción:</h4>
          <p>{descripcion}</p>
        </div>
      )*/}
        {preguntaGenerada && (
                <div>
                    <p>{preguntaGenerada.pregunta}</p>
                    <ul>
                        <li>{preguntaGenerada.respuesta_1}</li>
                        <li>{preguntaGenerada.respuesta_2}</li>
                        <li>{preguntaGenerada.respuesta_3}</li>
                        <li>{preguntaGenerada.respuesta_4}</li>
                        <li>{preguntaGenerada.respuesta_correcta}</li>
                    </ul>
                </div>
            )}
    </div>
  );
}

export default Testconstitucion;
