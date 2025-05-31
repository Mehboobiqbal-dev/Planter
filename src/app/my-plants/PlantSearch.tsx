'use client'; // Mark this as a Client Component

import { useState } from 'react';
import { Plant } from '../../../types/plant';

interface PlantSearchProps {
  plants: Plant[];
}

export default function PlantSearch({ plants }: PlantSearchProps) {
  const [filteredPlants, setFilteredPlants] = useState<Plant[]>(plants);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = e.target.value.toLowerCase();
    const filtered = plants.filter(
      (plant) =>
        plant.name.toLowerCase().includes(searchTerm) ||
        plant.category.toLowerCase().includes(searchTerm) ||
        (plant.latin?.toLowerCase().includes(searchTerm) ?? false) // Safely handle undefined description
    );
    setFilteredPlants(filtered);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-4">
          <button className="text-green-600 font-medium">My Plants</button>
          <button className="text-gray-400">Wishlist</button>
        </div>
        <div className="flex space-x-4">
          <input
            type="text"
            placeholder="Find your plant"
            className="p-2 border rounded"
            onChange={handleSearch}
          />
          <select className="p-2 border rounded">
            <option value="cares">Sort by Cares</option>
            <option value="lastAdded">Last Added</option>
            <option value="a-z">A-Z</option>
          </select>
        </div>
      </div>
      <div className="text-gray-500 mb-4">ALL PLANTS</div>
      {filteredPlants.length === 0 ? (
        <p className="text-gray-600 text-center mt-12">
          No plants match your search.
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {filteredPlants.map((plant) => (
            <div key={plant._id} className="bg-white rounded-lg shadow p-4">
              <img
                src={plant.image}
                alt={plant.name}
                className="w-full h-48 object-cover rounded-md"
              />
              <h2 className="mt-4 text-xl font-semibold text-gray-800">
                {plant.name}
              </h2>
              <p className="mt-1 text-sm text-gray-500">{plant.category}</p>
              <p className="mt-2 text-gray-700 text-sm">
                {plant.latin || 'No description available'}
              </p>
            </div>
          ))}
        </div>
      )}
    </>
  );
}