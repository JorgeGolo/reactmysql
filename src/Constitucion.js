import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Nav from './Nav';

const App = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedItems, setExpandedItems] = useState({});

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
            map[item.id] = { ...item, children: [] };
        });

        const tree = [];
        data.forEach(item => {
            if (item.id_padre) {
                map[item.id_padre].children.push(map[item.id]);
            } else {
                tree.push(map[item.id]);
            }
        });

        return tree;
    };

    const toggleExpand = (id) => {
        setExpandedItems((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };
    const renderContent = (content) => {
        if (!content) return null;
    
        // Verifica si el contenido contiene una lista numerada (1. 2. 3...) o alfabética (a) b) c)...)
        const hasNumberedList = content.match(/\b\d\.\s/);
        const hasAlphaList = content.match(/\b[a-i]\)\s/);
    
        // Si el contenido tiene una lista, dividimos en partes
        if (hasNumberedList || hasAlphaList) {
            // Usamos la expresión regular adecuada para capturar los elementos de lista
            const listItems = content.match(hasNumberedList
                ? /(?:\b\d\.\s)([^\d].*?)(?=\b\d\.\s|$)/gs
                : /(?:\b[a-i]\)\s)([^\d].*?)(?=\b[a-i]\)\s|$)/gs);
    
            // Extraemos el texto antes de la lista, si existe
            const [initialText] = content.split(listItems[0]);
    
            return (
                <div>
                    {initialText && <p>{initialText.trim()}</p>}
                    <ul>
                        {listItems.map((item, index) => (
                            <li key={index}>{item.trim()}</li>
                        ))}
                    </ul>
                </div>
            );
        }
    
        // Si no se detecta una lista, renderiza el contenido como un párrafo
        return <p>{content}</p>;
    };
    const excludedIds = [11, 66, 77, 112, 124, 146, 156, 182, 190, 134, 165, 161 , 157, 13, 18, 46, 61, 64, 78, 94, 107, 157, 36, 20];

    const renderTree = (items) => {
        return (
            <ul>
                {items.map(item => (

                    !excludedIds.includes(item.id) ? ( // Filtrar usando el array

                        <li key={item.id}>
                            <h3 onClick={() => toggleExpand(item.id)} style={{ cursor: 'pointer' }}>
                                {item.titulo}
                            </h3>
                            {expandedItems[item.id] && (
                                <>
                                    {renderContent(item.contenido)}
                                    {item.children && item.children.length > 0 && renderTree(item.children)}
                                </>
                            )}
                        </li>
                    ) : (
                        <li key={item.id}>
                        <h3 onClick={() => toggleExpand(item.id)} style={{ cursor: 'pointer' }}>
                            {item.titulo} - {item.contenido}
                        </h3>
                        {expandedItems[item.id] && (
                            <>
                                {item.children && item.children.length > 0 && renderTree(item.children)}
                            </>
                        )}
                    </li>
                    )
                ))}
            </ul>
        );
    };

    if (loading) return <p>Cargando...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div>
            <Nav />
            {renderTree(data)}
        </div>
    );
};

export default App;
