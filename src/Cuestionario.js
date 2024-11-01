import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Cuestionario({ temaid }) {
    const [preguntas, setPreguntas] = useState([]); // Estado para almacenar las preguntas

    useEffect(() => {
        const fetchPreguntas = async () => {
            try {
                // Solicitar preguntas según el ID del test
                const response = await axios.get(`http://localhost:5000/api/tests/${temaid}/preguntas`);
                setPreguntas(response.data); // Actualizar el estado con las preguntas obtenidas
            } catch (error) {
                console.error('Error al obtener preguntas:', error);
            }
        };

        if (temaid) {
            fetchPreguntas(); // Llamar a la función si hay un test seleccionado
        }
    }, [temaid]);

    return (
        <div>
            <h2>Cuestionario</h2>
            <p>ID del Test: {temaid}</p>
            <ul>
                {preguntas.map((pregunta, index) => (
                    <li key={pregunta.id}>
                        <strong>Pregunta {index + 1}:</strong> {pregunta.pregunta}
                        <ul>
                            <li>{pregunta.respuesta_1}</li>
                            <li>{pregunta.respuesta_2}</li>
                            <li>{pregunta.respuesta_3}</li>
                            <li>{pregunta.respuesta_4}</li>
                        </ul>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Cuestionario;
