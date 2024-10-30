// AddPregunta.js
import React, { useState } from 'react';

const AddPregunta = ({ temaId, onAddPregunta }) => {
    const [pregunta, setPregunta] = useState('');
    const [respuesta1, setRespuesta1] = useState('');
    const [respuesta2, setRespuesta2] = useState('');
    const [respuesta3, setRespuesta3] = useState('');
    const [respuesta4, setRespuesta4] = useState('');
    const [respuestaCorrecta, setRespuestaCorrecta] = useState(1); // Por defecto, la respuesta correcta es 1

    const handleSubmit = (e) => {
        e.preventDefault();
        const nuevaPregunta = {
            pregunta,
            id_tema: temaId,
            respuesta_1: respuesta1,
            respuesta_2: respuesta2,
            respuesta_3: respuesta3,
            respuesta_4: respuesta4,
            respuesta_correcta: respuestaCorrecta,
        };
        onAddPregunta(nuevaPregunta);
        // Limpiar el formulario después de enviar
        setPregunta('');
        setRespuesta1('');
        setRespuesta2('');
        setRespuesta3('');
        setRespuesta4('');
        setRespuestaCorrecta(1);
    };

    return (
        <form onSubmit={handleSubmit}>
            <h3>Añadir Pregunta</h3>
            <input 
                type="text" 
                value={pregunta} 
                onChange={(e) => setPregunta(e.target.value)} 
                placeholder="Pregunta" 
                required 
            />
            <input 
                type="text" 
                value={respuesta1} 
                onChange={(e) => setRespuesta1(e.target.value)} 
                placeholder="Respuesta 1" 
                required 
            />
            <input 
                type="text" 
                value={respuesta2} 
                onChange={(e) => setRespuesta2(e.target.value)} 
                placeholder="Respuesta 2" 
                required 
            />
            <input 
                type="text" 
                value={respuesta3} 
                onChange={(e) => setRespuesta3(e.target.value)} 
                placeholder="Respuesta 3" 
                required 
            />
            <input 
                type="text" 
                value={respuesta4} 
                onChange={(e) => setRespuesta4(e.target.value)} 
                placeholder="Respuesta 4" 
                required 
            />
            <select 
                value={respuestaCorrecta} 
                onChange={(e) => setRespuestaCorrecta(e.target.value)}
            >
                <option value={1}>Respuesta 1</option>
                <option value={2}>Respuesta 2</option>
                <option value={3}>Respuesta 3</option>
                <option value={4}>Respuesta 4</option>
            </select>
            <button type="submit">Añadir Pregunta</button>
        </form>
    );
};

export default AddPregunta;
