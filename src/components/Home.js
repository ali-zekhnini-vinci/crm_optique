import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Home = () => {
  const [frames, setFrames] = useState([]);

  useEffect(() => {
    const fetchFrames = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/frames'); // Assure-toi que l'endpoint est correct
        console.log(res.data);
        setFrames(res.data);
      } catch (err) {
        console.error(err.response.data);
      }
    };
    fetchFrames();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-8">Montures</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {frames.map(frame => (
          <div key={frame.id} className="bg-white shadow-md rounded-lg overflow-hidden">
            <img
              className="w-full h-40 object-cover"
              src={frame.url} // Assure-toi que l'URL de l'image est correcte
              alt={frame.name}
            />
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">Stock : {frame.stock}</h2>
              <p className="text-gray-700">{frame.brand}</p>
              <p className="text-gray-700">{frame.model}</p>
              <p className="text-gray-700">Prix: {frame.price} €</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
