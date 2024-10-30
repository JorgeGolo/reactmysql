import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';
import AddPregunta from './AddPregunta'; // Importa el componente para añadir preguntas
import AddTema from './AddTema'; // Importa el componente para añadir temas
import ShowPreguntas from './ShowPreguntas'; // Importa el componente para mostrar preguntas

function App() {
  const [temas, setTemas] = useState([]);
  const [selectedTemaId, setSelectedTemaId] = useState(null); // Para manejar el tema seleccionado
  const [preguntas, setPreguntas] = useState([]); // Nuevo estado para las preguntas
  const [temaNombre, setTemaNombre] = useState(''); // Nuevo estado para el nombre del tema
  const [showAddPregunta, setShowAddPregunta] = useState(false); // Nuevo estado para controlar qué mostrar

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

  const handleTemaClick = (temaId) => {
    setSelectedTemaId(temaId);
    setShowAddPregunta(true);
    const tema = temas.find((tema) => tema.id === temaId);
    if (tema) {
      setTemaNombre(tema.nombre);
    }
  };

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

  const handleMostrarPreguntas = async (temaId) => {
    setSelectedTemaId(temaId);
    setShowAddPregunta(false);
    await fetchPreguntas(temaId);
  };

  const addPregunta = async (nuevaPregunta) => {
    try {
      const response = await axios.post('http://localhost:5000/api/preguntas', nuevaPregunta);
      setPreguntas((prevPreguntas) => [...prevPreguntas, response.data]);
    } catch (error) {
      console.error('Error al añadir pregunta:', error);
    }
  };

  const addTema = (tema) => {
    setTemas((prevTemas) => [...prevTemas, tema]);
  };

  const temaSeleccionado = temas.find((tema) => tema.id === selectedTemaId);

  return (
    <div className="App">
      <ul>
        {temas.map((tema) => (
          <li key={tema.id}>
            <span>{tema.nombre}</span>
            <span onClick={() => handleTemaClick(tema.id)}>Añadir Pregunta</span>
            <span onClick={() => handleMostrarPreguntas(tema.id)}>Mostrar Preguntas</span>
          </li>
        ))}
        <li><AddTema onAddTema={addTema} /></li>
      </ul>

      {/* Mostrar solo un elemento a la vez */}
      {showAddPregunta ? (
        <div>
          <h4>Añadir pregunta para el tema: {temaNombre}</h4>
          <AddPregunta temaId={selectedTemaId} onAddPregunta={addPregunta} />
        </div>
      ) : (
        <div>
          {preguntas.length > 0 ? (
            <ShowPreguntas preguntas={preguntas} temaNombre={temaSeleccionado?.nombre} />
          ) : (
            <p>No hay preguntas para este tema.</p> // Mensaje cuando no hay preguntas
          )}
        </div>
      )}
    </div>
  );
}

export default App;
