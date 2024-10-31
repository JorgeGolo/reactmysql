import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import AddTema from './AddTema'; 
import ShowPreguntas from './ShowPreguntas'; 
import GenerarPregunta from './GenerarPregunta';
import Tests from './Tests'; // Importa el nuevo componente Tests

function App() {
  const [temas, setTemas] = useState([]);
  const [selectedTemaId, setSelectedTemaId] = useState(null);
  const [preguntas, setPreguntas] = useState([]);
  const [temaNombre, setTemaNombre] = useState('');
  const [showGenerarPregunta, setShowGenerarPregunta] = useState(false);

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
      if (response.data && Array.isArray(response.data)) {
        setPreguntas(response.data);
      } else {
        setPreguntas([]);
      }
    } catch (error) {
      console.warn('Error al cargar preguntas:', error);
      setPreguntas([]);
    }
  };

  const handleGenerarPregunta = (temaId) => {
    setSelectedTemaId(temaId);
    setShowGenerarPregunta(true);
    const tema = temas.find((tema) => tema.id === temaId);
    if (tema) {
      setTemaNombre(tema.nombre);
    }
  };

  const handleMostrarPreguntas = async (temaId) => {
    setSelectedTemaId(temaId);
    setShowGenerarPregunta(false);
    await fetchPreguntas(temaId);
  };

  const addTema = (tema) => {
    setTemas((prevTemas) => [...prevTemas, tema]);
  };

  const temaSeleccionado = temas.find((tema) => tema.id === selectedTemaId);

  return (
    <Router>
      <div className="App">
        <nav>
          <Link to="/">Temas y preguntas</Link> | <Link to="/tests">Tests</Link>
        </nav>

        <Routes>
          <Route 
            path="/" 
            element={
              <div>
                <h2>Temas y preguntas</h2>
                <ul>
                  {temas.map((tema) => (
                    <li key={tema.id}>
                      <span>{tema.nombre}</span>
                      <button onClick={() => handleMostrarPreguntas(tema.id)}>Mostrar Preguntas</button>
                      <button onClick={() => handleGenerarPregunta(tema.id)}>Generar Pregunta</button>
                    </li>
                  ))}
                  <li><AddTema onAddTema={addTema} /></li>
                </ul>

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
                  <GenerarPregunta temaNombre={temaNombre} temaId={selectedTemaId} />
                )}
              </div>
            }
          />

          <Route path="/tests" element={<Tests />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
