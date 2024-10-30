import React, { useState } from 'react';
import axios from 'axios';

const GenerarPregunta = ({ temaNombre }) => {
    const [pregunta, setPregunta] = useState(null);
    const [modelo, setModelo] = useState("gpt-3.5-turbo"); // Puedes cambiar el modelo a "gpt-4" si prefieres

    const handleGenerarPregunta = async () => {
        try {
            const response = await axios.post('http://localhost:5000/api/generate', {
                temaNombre,
                modelo,
            });
            setPregunta(response.data);
        } catch (error) {
            console.error("Error al generar la pregunta:", error);
        }
    };

    return (
        <div>
            <h4>Generar pregunta para el tema: {temaNombre}</h4>

            <label>
                Modelo de ChatGPT:
                <select value={modelo} onChange={(e) => setModelo(e.target.value)}>
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                    <option value="gpt-4">GPT-4</option>
                </select>
            </label>

            <button onClick={handleGenerarPregunta}>Generar Pregunta</button>

            {pregunta && (
                <div>
                    <h5>Pregunta generada:</h5>
                    <p>{pregunta.pregunta}</p>
                    <ul>
                        <li>{pregunta.respuesta_1}</li>
                        <li>{pregunta.respuesta_2}</li>
                        <li>{pregunta.respuesta_3}</li>
                        <li>{pregunta.respuesta_4}</li>
                        <li>{pregunta.respuesta_correcta}</li>
                    </ul>
                </div>
            )}
        </div>
    );
};

export default GenerarPregunta;