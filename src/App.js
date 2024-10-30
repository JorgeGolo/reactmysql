import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';
import AddPregunta from './AddPregunta'; // Importa el nuevo componente

import AddTema from './AddTema'; // Importa el nuevo componente


function App() {
  const [temas, setTemas] = useState([]);
  const [selectedTemaId, setSelectedTemaId] = useState(null); // Para manejar el tema seleccionado

  useEffect(() => {
    // Ejemplo con fetch para obtener un texto
    fetch('http://localhost:5000/api/test')
      .then((response) => response.text())
      .then((data) => console.log("Respuesta de /api/test:", data))
      .catch((error) => console.error('Error en fetch:', error));

    // Ejemplo con axios para obtener la lista de temas
    axios.get('http://localhost:5000/api/temas')
      .then((response) => {
        setTemas(response.data); // Guardamos los datos en el estado
      })
      .catch((error) => {
        console.error('Error al obtener temas con axios:', error);
      });
  }, []);

  const handleTemaClick = (id) => {
    setSelectedTemaId(id === selectedTemaId ? null : id); // Alternar la visibilidad del formulario
  };

  const addPregunta = async (nuevaPregunta) => {
    try {
      const response = await axios.post('http://localhost:5000/api/preguntas', nuevaPregunta);
      console.log('Pregunta añadida:', response.data);
      // Aquí puedes actualizar la lista de preguntas o hacer algo con la respuesta
    } catch (error) {
      console.error('Error al añadir pregunta:', error);
    }
  };

  // Función para agregar un nuevo tema al estado
  const addTema = (tema) => {
    setTemas([...temas, tema]); // Agrega el tema del backend al estado
  };

  return (
    <div className="App">
      <ul>
        {temas.map((tema) => (
          <li key={tema.id} onClick={() => handleTemaClick(tema.id)}>
            {tema.nombre}
          </li>
        ))}
        <li><AddTema onAddTema={addTema} /></li> {/* Incluye el componente de agregar tema */}
      </ul>

      {/* Div separado para el formulario de añadir preguntas */}
      {selectedTemaId && (
        <div>
          <AddPregunta temaId={selectedTemaId} onAddPregunta={addPregunta} />
        </div>
      )}
    </div>
  );
}

export default App;
