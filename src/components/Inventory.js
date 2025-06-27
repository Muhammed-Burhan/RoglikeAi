import React from 'react';
import './Inventory.css';

const Inventory = ({ player, onClose }) => {
  if (!player || !player.inventory) {
    return null;
  }

  const getTotalGold = () => {
    return player.inventory
      .filter(item => item.itemType === 'gold')
      .reduce((total, item) => total + item.value, 0);
  };

  const getNonGoldItems = () => {
    return player.inventory.filter(item => item.itemType !== 'gold');
  };

  return (
    <div className="inventory-overlay" onClick={onClose}>
      <div className="inventory-panel" onClick={e => e.stopPropagation()}>
        <div className="inventory-header">
          <h3>🎒 Inventory</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="inventory-content">
          <div className="gold-section">
            <div className="gold-item">
              <span className="item-symbol">💰</span>
              <span className="item-name">Gold</span>
              <span className="item-count">{getTotalGold()}</span>
            </div>
          </div>

          <div className="items-section">
            {getNonGoldItems().length > 0 ? (
              getNonGoldItems().map((item, index) => (
                <div key={index} className="inventory-item">
                  <span className="item-symbol">{item.symbol}</span>
                  <span className="item-name">{item.name}</span>
                  {item.value && (
                    <span className="item-value">({item.value})</span>
                  )}
                </div>
              ))
            ) : (
              <div className="empty-inventory">
                No items in inventory
              </div>
            )}
          </div>
        </div>

        <div className="inventory-footer">
          <p>Press I to close inventory</p>
        </div>
      </div>
    </div>
  );
};

export default Inventory; 