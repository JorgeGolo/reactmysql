import React, { useState } from 'react';
import axios from 'axios';


const AddTema = ({ onAddTema }) => {
  const [nuevoTema, setNuevoTema] = useState('');

  const handleInputChange = (event) => {
    setNuevoTema(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (nuevoTema.trim()) {
      try {
        // Hacer solicitud POST al backend para agregar el tema
        const response = await axios.post('http://localhost:5000/api/temas', {
          nombre: nuevoTema,
        });

        // Llamar a onAddTema con el tema agregado del backend
        onAddTema(response.data);
        setNuevoTema(''); // Limpiar el input
      } catch (error) {
        console.error('Error al agregar el tema:', error);
      }
    }
  };

  

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={nuevoTema}
        onChange={handleInputChange}
        placeholder="Añadir un nuevo tema"
        required
      />
      <button type="submit">Agregar</button>
    </form>
  );
};

export default AddTema;
