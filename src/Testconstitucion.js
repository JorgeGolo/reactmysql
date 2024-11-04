import React, { useState, useEffect } from 'react';
import axios from 'axios';  // Importar Axios
import Nav from './Nav';

function Testconstitucion() {
  const [jerarquia, setJerarquia] = useState('');
  //const [modelo] = useState('gpt-3.5-turbo');
  //const [modelo] = useState('gpt-4');
  const [modelo] = useState('gpt-4o');
  const [preguntaGenerada, setPreguntaGenerada] = useState(null); // Cambiar a null para verificar si la pregunta está cargada
  const [respuestaSeleccionada, setRespuestaSeleccionada] = useState(''); // Estado para la opción seleccionada

  // Pregunta tipo 1, a partir de artículo
  async function GenerarPreguntaA() {
    try {
      const response = await axios.get('http://localhost:5000/api/preguntaconsta', {
        params: {
          modelo: modelo,
        },
      });
      setJerarquia(response.data.jerarquia); // Ajustar al campo correcto que devuelve la API
      setPreguntaGenerada(response.data.pregunta);
      setRespuestaSeleccionada(''); // Desmarcar cualquier opción seleccionada al generar una nueva pregunta
    } catch (error) {
      console.error('Error:', error);
      setJerarquia('Ocurrió un error al generar la pregunta.');
    }
  }

  // Llamar a la función al cargar el componente
  useEffect(() => {
    GenerarPreguntaA();
  }, []);

  // Manejar el cambio de selección de la respuesta
  const handleRespuestaChange = (e) => {
    setRespuestaSeleccionada(e.target.value);
  };

  return (
    <div>
      <Nav />
      
      {preguntaGenerada && (
        <div>
          <p>{preguntaGenerada.pregunta}</p>
          <form>
            <label>
              <input
                type="radio"
                value="1"
                checked={respuestaSeleccionada === '1'}
                onChange={handleRespuestaChange}
              />
              {preguntaGenerada.respuesta_1}
            </label>
            <br />
            <label>
              <input
                type="radio"
                value="2"
                checked={respuestaSeleccionada === '2'}
                onChange={handleRespuestaChange}
              />
              {preguntaGenerada.respuesta_2}
            </label>
            <br />
            <label>
              <input
                type="radio"
                value="3"
                checked={respuestaSeleccionada === '3'}
                onChange={handleRespuestaChange}
              />
              {preguntaGenerada.respuesta_3}
            </label>
            <br />
            <label>
              <input
                type="radio"
                value="4"
                checked={respuestaSeleccionada === '4'}
                onChange={handleRespuestaChange}
              />
              {preguntaGenerada.respuesta_4}
            </label>
          </form>

          {/* Mostrar mensaje si la respuesta es correcta o incorrecta */}
          {respuestaSeleccionada && (
            <div>
              {respuestaSeleccionada === preguntaGenerada.respuesta_correcta ? (
                <p>
                  <span style={{ color: 'green' }}>¡Respuesta correcta!</span>
                  <button onClick={GenerarPreguntaA} style={{ marginTop: '10px' }}>
                  Siguiente
                  </button>
                  <hr />               
                  {Array.isArray(jerarquia) && jerarquia.length > 0 ? (
                      jerarquia.map(item => (
                        <div key={item.id}>
                          <h4>{item.titulo}</h4>
                          <p>{item.contenido}</p>
                        </div>
                      ))
                    ) : (
                      <p>{jerarquia}</p> // Si jerarquia no es un array
                    )}
                </p>
              ) : (
                <p style={{ color: 'red' }}>¡Respuesta incorrecta!</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Testconstitucion;
