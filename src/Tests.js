import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Tests() {
    const [tests, setTests] = useState([]); // Estado para la lista de tests existentes

    const [temas, setTemas] = useState([]);
    const [selectedTema, setSelectedTema] = useState(''); // Estado para el tema seleccionado
    const [numeroPreguntas, setNumeroPreguntas] = useState(10); // Estado para número de preguntas

    // Obtener temas para el select al cargar el componente
    useEffect(() => {
        const fetchTemas = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/temas');
                setTemas(response.data);
            } catch (error) {
                console.error('Error al obtener temas:', error);
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

    const handleCreateTest = () => {
        if (selectedTema) {
            alert(`Creando test para el tema con ID: ${selectedTema}`);
            // Aquí puedes agregar la lógica para crear el test
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
