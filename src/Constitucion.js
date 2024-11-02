import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Nav from './Nav'; // Asegúrate de que este componente existe y está bien importado

const App = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/constitucion');
                const structuredData = structureData(response.data);
                setData(structuredData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const structureData = (data) => {
        const map = {};
        data.forEach(item => {
            map[item.id] = { ...item, children: [] }; // Inicializa la estructura
        });

        const tree = [];
        data.forEach(item => {
            if (item.id_padre) {
                map[item.id_padre].children.push(map[item.id]);
            } else {
                tree.push(map[item.id]); // Es un elemento raíz
            }
        });

        return tree;
    };

    const renderTree = (items) => {
        return (
            <ul>
                {items.map(item => (
                    <li key={item.id}>
                        <h2>{item.titulo}</h2>
                        <p>{item.contenido}</p>
                        {item.children && item.children.length > 0 && renderTree(item.children)} {/* Llama a la función recursivamente */}
                    </li>
                ))}
            </ul>
        );
    };

    if (loading) return <p>Cargando...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div>
            <Nav />
            {renderTree(data)} {/* Renderiza la estructura de datos */}
        </div>
    );
};

export default App;
