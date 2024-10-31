import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';
import AddTema from './AddTema'; // Importa el componente para añadir temas
import ShowPreguntas from './ShowPreguntas'; // Importa el componente para mostrar preguntas
import GenerarPregunta from './GenerarPregunta'; // Importa el componente para mostrar preguntas

function App() {
  const [temas, setTemas] = useState([]);
  const [selectedTemaId, setSelectedTemaId] = useState(null); // Para manejar el tema seleccionado
  const [preguntas, setPreguntas] = useState([]); // Nuevo estado para las preguntas
  const [temaNombre, setTemaNombre] = useState(''); // Nuevo estado para el nombre del tema
  const [showGenerarPregunta, setShowGenerarPregunta] = useState(false); // Controla mostrar el componente GenerarPregunta

  useEffect(() => {
    const fetchTemas = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/temas');
        setTemas(response.data);
      } catch (error) {
        console.error('Error al obtener temas con axios:', error);
      }
    };

    fetchTemas();
  }, []);


  const fetchPreguntas = async (temaId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/preguntas/${temaId}`);
      
      // Verificar si hay preguntas en la respuesta
      if (response.data && Array.isArray(response.data)) {
        setPreguntas(response.data); // Si hay preguntas, las establece
      } else {
        setPreguntas([]); // Si no hay preguntas, establece un arreglo vacío
      }
    } catch (error) {
      console.warn('Error al cargar preguntas:', error);
      setPreguntas([]); // También puedes limpiar las preguntas en caso de error
    }
  };

  const handleGenerarPregunta = (temaId) => {
    setSelectedTemaId(temaId);
    setShowGenerarPregunta(true); // Muestra el componente GenerarPregunta
    const tema = temas.find((tema) => tema.id === temaId);
    if (tema) {
      setTemaNombre(tema.nombre);
    }
  };

  const handleMostrarPreguntas = async (temaId) => {
    setSelectedTemaId(temaId);
    setShowGenerarPregunta(false); // Oculta GenerarPregunta al agregar una pregunta
    await fetchPreguntas(temaId);
  };


  const addTema = (tema) => {
    setTemas((prevTemas) => [...prevTemas, tema]);
  };

  const temaSeleccionado = temas.find((tema) => tema.id === selectedTemaId);

  return (
    <div className="App">
      <h2>Temas</h2>
      <ul>
        {temas.map((tema) => (
          <li key={tema.id}>
            <span>{tema.nombre}</span>
            <span onClick={() => handleMostrarPreguntas(tema.id)}>Mostrar Preguntas</span>
            <span onClick={() => handleGenerarPregunta(tema.id)}>Generar Pregunta</span>
          </li>
        ))}
        <li><AddTema onAddTema={addTema} /></li>
      </ul>

      {/* Mostrar solo un elemento a la vez */}

      {!showGenerarPregunta && (
        <div>
          {preguntas.length > 0 ? (
            <ShowPreguntas preguntas={preguntas} temaNombre={temaSeleccionado?.nombre} />
          ) : (
            <p>No hay preguntas para este tema.</p>
          )}
        </div>
      )}

      {showGenerarPregunta && (
        <div>
          <GenerarPregunta temaNombre={temaNombre} temaId={selectedTemaId} />
        </div>
      )}
      <h2>Tests</h2>
    </div>
  );
}

export default App;
