import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [items, setItems] = useState([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');

  const fetchItems = async () => {
    const response = await fetch('/items.json');
    const data = await response.json();
    setItems(data);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleAddItem = async (e) => {
    e.preventDefault();
    await fetch(`/items.json?newItemName=${encodeURIComponent(name)}&newItemPrice=${price}`, {
      method: 'PUT'
    });
    fetchItems();
    setName('');
    setPrice('');
  };

  const updateName = async (id) => {
    const newName = prompt('Enter the new name:');
    if (!newName) return;
    await fetch(`/updateName?id=${encodeURIComponent(id)}&newItemName=${encodeURIComponent(newName)}`, {
      method: 'POST'
    });
    fetchItems();
  };

  const updatePrice = async (id) => {
    const newPrice = prompt('Enter the new price:');
    if (!newPrice || isNaN(parseFloat(newPrice))) return;
    await fetch(`/updatePrice?id=${encodeURIComponent(id)}&newItemPrice=${encodeURIComponent(newPrice)}`, {
      method: 'POST'
    });
    fetchItems();
  };

  const deleteItem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    await fetch(`/items.json?id=${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
    fetchItems();
  };

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">📦 Stuff for Sale</h2>
      <div id="items-container">
        {items.map(item => (
          <div className="item-card" key={item.id}>
            <h5><strong>{item.name}</strong></h5>
            <p className="price">Price: ${parseFloat(item.price).toFixed(2)}</p>
            <button className="btn btn-sm btn-outline-primary me-2" onClick={() => updateName(item.id)}>Update Name</button>
            <button className="btn btn-sm btn-outline-warning me-2" onClick={() => updatePrice(item.id)}>Update Price</button>
            <button className="btn btn-sm btn-outline-danger" onClick={() => deleteItem(item.id)}>Delete Item</button>
          </div>
        ))}
      </div>

      <hr />

      <h4>Add New Item</h4>
      <form className="row g-3" onSubmit={handleAddItem}>
        <div className="col-md-6">
          <label htmlFor="item-name" className="form-label">Name:</label>
          <input type="text" id="item-name" className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="col-md-6">
          <label htmlFor="item-price" className="form-label">Price:</label>
          <input type="number" id="item-price" className="form-control" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required />
        </div>
        <div className="col-12">
          <button type="submit" className="btn btn-primary mt-2">Add New Item</button>
        </div>
      </form>
    </div>
  );
}

export default App;


