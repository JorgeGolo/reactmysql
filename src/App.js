import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

import AddTema from './AddTema'; // Importa el nuevo componente


function App() {
  const [temas, setTemas] = useState([]);

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

  // Función para agregar un nuevo tema al estado
  const addTema = (tema) => {
    setTemas([...temas, tema]); // Agrega el tema del backend al estado
  };

  return (
    <div className="App">
      {/*<span>Temas</span>*/}
      <ul>
        {temas.map((tema) => (
          <li key={tema.id}>{tema.nombre}</li>
        ))}
          <li><AddTema onAddTema={addTema} /></li> {/* Incluye el componente de agregar tema */}
      </ul>
    </div>
  );
}

export default App;
