// Examenes.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cuestionario from './Cuestionario';

import Nav from './Nav';

const Examenes = () => {

    const [tests, setTests] = useState([]); // Estado para almacenar la lista de tests
    const [temas, setTemas] = useState([]);
    const [temaidSeleccionado, setTemaidSeleccionado] = useState(null); // Estado para almacenar el temaId seleccionado
    const [temaNombre, setTemaNombre] = useState('');

    const handleGenerarTest = (temaid) => {
        setTemaidSeleccionado(temaid); // Almacena el temaId para mostrar en Cuestionario
    };
    

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
    

    return (
    
        <div>
            <Nav/>

            {/* Aquí puedes agregar más contenido relacionado con los exámenes */}

            <h3>Lista de Tests</h3>
            <ul>
                {tests.map((test) => {
                    // Encuentra el tema correspondiente al tema_id del test
                    const tema = temas.find(t => t.id === test.tema_id); // Buscamos el tema por ID
                    const temaNombre = tema ? tema.nombre : 'Tema no encontrado'; // Si se encuentra, obtener el nombre

                    return (
                        <li key={test.id}>
                            {test.id} | Tema: {temaNombre} ({test.tema_id}) | {test.numero_preguntas} preguntas
                            <button onClick={() => handleGenerarTest(test.id)}>Hacer examen</button>
                        </li>
                    );
                })}
            </ul>
        {/* Mostrar el componente Cuestionario solo si se selecciona un tema */}
        {temaidSeleccionado && <Cuestionario temaid={temaidSeleccionado} />}
        </div>
    );
};

export default Examenes;