import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Cuestionario({ temaid }) {
    const [preguntas, setPreguntas] = useState([]); // Estado para almacenar todas las preguntas
    const [preguntaActualIndex, setPreguntaActualIndex] = useState(0); // Estado para el índice de la pregunta actual
    const [respuestaSeleccionada, setRespuestaSeleccionada] = useState(null); // Estado para la respuesta seleccionada
    const [cuestionarioCompletado, setCuestionarioCompletado] = useState(false); // Estado para indicar si el cuestionario está completo

    useEffect(() => {
        const fetchPreguntas = async () => {
            try {
                // Solicitar preguntas según el ID del test
                const response = await axios.get(`http://localhost:5000/api/tests/${temaid}/preguntas`);
                setPreguntas(response.data); // Actualizar el estado con las preguntas obtenidas
                setPreguntaActualIndex(0); // Reiniciar el índice de la pregunta al obtener preguntas
                setRespuestaSeleccionada(null); // Reiniciar la respuesta seleccionada
                setCuestionarioCompletado(false); // Asegurarse de que el cuestionario no esté completo al cargar nuevas preguntas
            } catch (error) {
                console.error('Error al obtener preguntas:', error);
            }
        };

        if (temaid) {
            fetchPreguntas(); // Llamar a la función si hay un test seleccionado
        }
    }, [temaid]);

    const handleSeleccionRespuesta = (respuesta) => {
        setRespuestaSeleccionada(respuesta); // Actualiza la respuesta seleccionada
    };

    const handleSiguientePregunta = () => {
        if (preguntaActualIndex < preguntas.length - 1) {
            setPreguntaActualIndex(preguntaActualIndex + 1); // Pasa a la siguiente pregunta
            setRespuestaSeleccionada(null); // Reinicia la respuesta seleccionada
        } else {
            setCuestionarioCompletado(true); // Marca el cuestionario como completo si no hay más preguntas
        }
    };

    const handleReiniciarCuestionario = () => {
        setPreguntaActualIndex(0); // Reiniciar el índice de la pregunta
        setRespuestaSeleccionada(null); // Reiniciar la respuesta seleccionada
        setCuestionarioCompletado(false); // Marcar el cuestionario como no completado
    };

    // Pregunta actual basada en el índice
    const preguntaActual = preguntas[preguntaActualIndex];

    return (
        <div>
            <h2>Cuestionario</h2>
            {cuestionarioCompletado ? (
                <div>
                    <p>¡Has completado el cuestionario!</p>
                    <button onClick={handleReiniciarCuestionario}>Reiniciar Cuestionario</button>
                </div>
            ) : (
                preguntaActual ? (
                    <div>
                        <p><strong>Pregunta {preguntaActualIndex + 1}:</strong> {preguntaActual.pregunta}</p>
                        <ul>
                            {[preguntaActual.respuesta_1, preguntaActual.respuesta_2, preguntaActual.respuesta_3, preguntaActual.respuesta_4].map((respuesta, index) => (
                                <li key={index}>
                                    <input
                                        type="radio"
                                        name="respuesta"
                                        value={respuesta}
                                        onChange={() => handleSeleccionRespuesta(respuesta)}
                                        checked={respuestaSeleccionada === respuesta}
                                    />
                                    {respuesta}
                                </li>
                            ))}
                        </ul>
                        <button 
                            onClick={handleSiguientePregunta} 
                            disabled={!respuestaSeleccionada} // Deshabilita si no hay selección
                        >
                            Siguiente
                        </button>
                    </div>
                ) : (
                    <p>No hay preguntas disponibles.</p> // Mensaje si no hay preguntas
                )
            )}
        </div>
    );
}

export default Cuestionario;
