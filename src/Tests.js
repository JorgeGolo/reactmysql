import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cuestionario from './Cuestionario';

function Tests() {
    const [temas, setTemas] = useState([]);
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

    return (
        <div>
            <h2>Tests</h2>
            <p>Esta es la pantalla de tests, donde se mostrarán las pruebas disponibles.</p>

            <form onSubmit={(e) => e.preventDefault()}>
                <label>Tema:</label>
                <select value={selectedTema} onChange={handleSelectChange}>
                    <option value="">Selecciona un tema</option> {/* Opción predeterminada */}
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
                <button onClick={handleCreateTest}>Crear test</button>
            </form>

            {/* Muestra la lista de tests de la tabla aqui */}
            <h3>Lista de Tests</h3>
            <ul>
                {tests.map((test) => (
                    <li key={test.id}>
                        ID: {test.id} | Tema ID: {test.tema_id} | Número de Preguntas: {test.numero_preguntas} | Fecha: {test.fecha}
                        <button onClick={() => handleGenerarTest(test.id)}>Generar test</button>
                    </li>
                ))}
            </ul>
              
            {/* Mostrar el componente Cuestionario solo si se selecciona un tema */}
            {temaidSeleccionado && <Cuestionario temaid={temaidSeleccionado} />}

        </div>
    );
}

export default Tests;
