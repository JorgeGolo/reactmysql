import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';
import AddTema from './AddTema'; 
import ShowPreguntas from './ShowPreguntas'; 
import GenerarPregunta from './GenerarPregunta';
import Cuestionario from './Cuestionario';

import Constitucion from './Constitucion';


import Nav from './Nav';


function App() {
  const [temas, setTemas] = useState([]);
  const [selectedTemaId, setSelectedTemaId] = useState(null);
  const [preguntas, setPreguntas] = useState([]);
  const [temaNombre, setTemaNombre] = useState('');
  const [showGenerarPregunta, setShowGenerarPregunta] = useState(false);
  const [tests, setTests] = useState([]); // Estado para almacenar la lista de tests
  const [selectedTema, setSelectedTema] = useState(''); // Estado para el tema seleccionado
  const [numeroPreguntas, setNumeroPreguntas] = useState(10); // Estado para número de preguntas
  const [temaidSeleccionado, setTemaidSeleccionado] = useState(null); // Estado para almacenar el temaId seleccionado


  
  useEffect(() => {
    const fetchTemas = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/temas');
        setTemas(response.data);
      } catch (error) {
        console.error('Error al obtener temas con axios:', error);
      }
    };

    const fetchTests = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/tests');
        setTests(response.data);
      } catch (error) {
        console.error('Error al obtener tests:', error);
      }
    };

    fetchTemas();
    fetchTests();
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

  const handleSelectChange = (e) => {
    setSelectedTema(e.target.value); // Actualiza el estado con el tema seleccionado
  };

  const handleCreateTest = async () => {
    if (selectedTema) {
      try {
        await axios.post('http://localhost:5000/api/tests', {
          tema_id: selectedTema,
          numero_preguntas: numeroPreguntas,
        });
        
        // Vuelve a cargar todos los tests desde el servidor
        const response = await axios.get('http://localhost:5000/api/tests');
        setTests(response.data);
        
      } catch (error) {
        console.error('Error al crear el test:', error);
        alert('Error al crear el test.');
      }
    } else {
      alert('Por favor, selecciona un tema para crear el test.');
    }
  };

  const handleGenerarTest = (temaid) => {
    setTemaidSeleccionado(temaid); // Almacena el temaId para mostrar en Cuestionario
  };

  const temaSeleccionado = temas.find((tema) => tema.id === selectedTemaId);

  const handleBorrarTema = async (temaid) => {
    const confirmacion = window.confirm(
        "¿Estás seguro de que deseas borrar este tema? Esto también eliminará todas las preguntas y tests relacionados."
    );

    if (!confirmacion) {
        return; // Si el usuario cancela, no hacer nada
    }

    try {
        await axios.delete(`http://localhost:5000/api/temas/${temaid}`);

        // Actualiza el estado para eliminar el tema de la lista
        setTemas((prevTemas) => prevTemas.filter((tema) => tema.id !== temaid));

        // Actualiza el estado de tests para eliminar aquellos que están relacionados con el tema borrado
        setTests((prevTests) => prevTests.filter((test) => test.tema_id !== temaid));

        // Limpia las preguntas si el tema borrado es el actualmente seleccionado
        if (selectedTemaId === temaid) {
            setPreguntas([]); // Limpia las preguntas
            setSelectedTemaId(null); // Opcional: Resetea el tema seleccionado
        }

        console.log('Tema borrado y tests actualizados correctamente');
    } catch (error) {
        console.error('Error al borrar el tema:', error);
        alert('Error al borrar el tema.');
    }
};

  return (
    <div className="App">
      <Nav/>
      <h2>Temas y preguntas</h2>
      <h3>Temas generales</h3>
      <ul>
        {temas.map((tema) => (
          <li key={tema.id}>
            <span>{tema.nombre}</span>
            <button onClick={() => handleMostrarPreguntas(tema.id)}>Mostrar Preguntas</button>
            <button onClick={() => handleGenerarPregunta(tema.id)}>Generar Pregunta</button>
            <button onClick={() => handleBorrarTema(tema.id)}>Borrar Tema</button>
          </li>
        ))}
        <li><AddTema onAddTema={addTema} /></li>
      </ul>
      <h3>Constitución Española</h3>


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

      {/* Sección de Tests */}
      <h2>Crear Examen</h2>
      <form onSubmit={(e) => e.preventDefault()}>
        <label>Tema:</label>
        <select value={selectedTema} onChange={handleSelectChange}>
          <option value="">Selecciona un tema</option>
          {temas.map((tema) => (
            <option key={tema.id} value={tema.id}>
              {tema.nombre}
            </option>
          ))}
        </select>

        <label>Número de Preguntas:</label>
        <input
          type="number"
          value={numeroPreguntas}
          onChange={(e) => setNumeroPreguntas(e.target.value)}
          min="1"
        />
        <button onClick={handleCreateTest}>Crear examen</button>
      </form>

      <h3>Lista de Exámenes Creados</h3>
      <ul>
                {tests.map((test) => {
                    // Encuentra el tema correspondiente al tema_id del test
                    const tema = temas.find(t => t.id === test.tema_id); // Buscamos el tema por ID
                    const temaNombre = tema ? tema.nombre : 'Tema no encontrado'; // Si se encuentra, obtener el nombre

                    return (
                        <li key={test.id}>
                            ID: {test.id} | Tema: {temaNombre} (ID: {test.tema_id}) | Número de Preguntas: {test.numero_preguntas} | Fecha: {test.fecha}
                            <button onClick={() => handleGenerarTest(test.id)}>Hacer test</button>
                        </li>
                    );
                })}
            </ul>

      {/* Mostrar el componente Cuestionario solo si se selecciona un tema */}
      {temaidSeleccionado && <Cuestionario temaid={temaidSeleccionado} />}
    </div>
  );
}

export default App;
