import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Tests() {
    const [temas, setTemas] = useState([]);
    const [tests, setTests] = useState([]); // Estado para almacenar la lista de tests
    const [selectedTema, setSelectedTema] = useState(''); // Estado para el tema seleccionado
    const [numeroPreguntas, setNumeroPreguntas] = useState(10); // Estado para número de preguntas

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
                // Petición POST al endpoint /api/tests
                const response = await axios.post('http://localhost:5000/api/tests', {
                    tema_id: selectedTema,
                    numero_preguntas: numeroPreguntas,
                });

                // Agregar el nuevo test a la lista de tests
                setTests([...tests, response.data]);
                //alert('Test creado exitosamente');

            } catch (error) {
                console.error('Error al crear el test:', error);
                alert('Error al crear el test.');
            }
        } else {
            alert('Por favor, selecciona un tema para crear el test.');
        }
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
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Tests;
