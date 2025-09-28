"use client";

import { useState, useEffect, useRef } from 'react';
import styles from './devisCalculator.module.css';

const services = {
  salon: {
    name: 'Nettoyage de Salon',
    icon: '🛋️',
    basePrice: 15,
    unity:"place",
    description: 'Nettoyage professionnel de canapés, fauteuils et meubles',
    options: {
      'standard': { name: 'Standard', multiplier: 1 },
      'premium': { name: 'Premium avec protection', multiplier: 1.5 },
      'deep': { name: 'Nettoyage en profondeur', multiplier: 1.8 }
    }
  },
  tapis: {
    name: 'Nettoyage de Tapis',
    icon: '🏠',
    basePrice: 6,
    unity:"m²",
    description: 'Nettoyage et désinfection de tous types de tapis',
    options: {
      'standard': { name: 'Standard', multiplier: 1 },
      'premium': { name: 'Avec traitement anti-taches', multiplier: 1.4 },
      'restoration': { name: 'Restauration complète', multiplier: 2 }
    }
  },
  tapisserie: {
    name: 'Tapisserie',
    icon: '🎨',
    basePrice: 120,
    description: 'Rénovation et nettoyage de tapisseries anciennes',
    options: {
      'cleaning': { name: 'Confection', multiplier: 1 },
      'restoration': { name: 'Restauration partielle', multiplier: 1.6 },
      'full': { name: 'Restauration complète', multiplier: 2.5 }
    }
  },
  marbre: {
    name: 'Polissage de Marbre',
    icon: '💎',
    basePrice: 15,
    unity:"m²",
    description: 'Polissage et cristallisation du marbre',
    options: {
      'polish': { name: 'Polissage standard', multiplier: 1 },
      'crystal': { name: 'Cristallisation', multiplier: 1.3 },
      'restoration': { name: 'Restauration complète', multiplier: 2 }
    }
  },
  tfc: {
    name: 'Nettoyage TFC',
    icon: '🏢',
    basePrice: 10,
    unity:"m²",
    description: 'Nettoyage de bureaux et espaces commerciaux',
    options: {
      'basic': { name: 'Nettoyage de base', multiplier: 1 },
      'complete': { name: 'Nettoyage complet', multiplier: 1.5 },
      'maintenance': { name: 'Contrat maintenance', multiplier: 0.8 }
    }
  }
};

const urgencyLevels = {
  'normal': { name: 'Normal (7-10 jours)', multiplier: 1 },
  'urgent': { name: 'Urgent (3-5 jours)', multiplier: 1.2 },
  'emergency': { name: 'Urgence (24-48h)', multiplier: 1.5 }
};

const areas = {
  'tunis': { name: 'Tunis Centre', multiplier: 1 },
  'ariana': { name: 'Ariana', multiplier: 1.1 },
  'ben_arous': { name: 'Ben Arous', multiplier: 1.1 },
  'manouba': { name: 'Manouba', multiplier: 1.2 },
  'nabeul': { name: 'Nabeul/Hammamet', multiplier: 1.3 },
  'other': { name: 'Autre région', multiplier: 1.4 }
};

export default function DevisCalculator() {
  const [selectedServices, setSelectedServices] = useState({});
  const [quantities, setQuantities] = useState({});
  const [urgency, setUrgency] = useState('normal');
  const [area, setArea] = useState('tunis');
  const [surfaceArea, setSurfaceArea] = useState('');
  const [total, setTotal] = useState(0);

  const handleServiceToggle = (serviceId) => {
    setSelectedServices(prev => {
      const newSelected = { ...prev };
      if (newSelected[serviceId]) {
        // remove
        // compute removed amount based on current selection before deleting
        const currentOption = newSelected[serviceId] || 'standard';
        const service = services[serviceId];
        const quantity = quantities[serviceId] || 1;
        const optionMultiplier = service.options[currentOption]?.multiplier || 1;
        const removed = Math.round(service.basePrice * optionMultiplier * quantity);

        delete newSelected[serviceId];
        const newQuantities = { ...quantities };
        delete newQuantities[serviceId];
        setQuantities(newQuantities);

        // trigger negative animation (show -amount)
        triggerAddAnimation(-removed);
      } else {
        // add
        newSelected[serviceId] = 'standard';

        // compute added amount for animation
        const service = services[serviceId];
        const quantity = quantities[serviceId] || 1;
        const optionMultiplier = service.options['standard']?.multiplier || 1;
        const added = Math.round(service.basePrice * optionMultiplier * quantity);
        triggerAddAnimation(added);
      }
      return newSelected;
    });
  };

  const handleOptionChange = (serviceId, option) => {
    setSelectedServices(prev => ({
      ...prev,
      [serviceId]: option
    }));
  };

  const handleQuantityChange = (serviceId, quantity) => {
    setQuantities(prev => {
      // allow empty string so placeholder shows when user clears input
      if (quantity === '' || quantity === null) {
        return { ...prev, [serviceId]: '' };
      }

      const parsed = parseInt(quantity || '0', 10);
      const newQty = Math.max(1, isNaN(parsed) ? 1 : parsed);
      const oldQty = prev[serviceId] || 0;

      // trigger positive ticker animation for magnitude of change if service selected
      if (selectedServices[serviceId] && newQty !== oldQty) {
        const selectedOption = selectedServices[serviceId] || 'standard';
        const service = services[serviceId];
        const optionMultiplier = service.options[selectedOption]?.multiplier || 1;
        const delta = Math.round(Math.abs(newQty - oldQty) * service.basePrice * optionMultiplier);
        if (delta > 0) triggerAddAnimation(delta);
      }

      return { ...prev, [serviceId]: newQty };
    });
  };

  // Choose contextual label for quantity input depending on the service
  const getQuantityLabel = (serviceId) => {
    // services that measure by places
    if (serviceId === 'salon') return "Nombre de places";

    // services measured by surface
    if (['tapis', 'marbre', 'tfc'].includes(serviceId)) return 'Surface (m²)';

    // tapisserie and others: count of items
    if (serviceId === 'tapisserie') return "Nombre d'articles";

    // default fallback
    return 'Quantité';
  };

  // Provide contextual placeholders for quantity input
  const getQuantityPlaceholder = (serviceId) => {
    if (serviceId === 'salon') return 'Ex: 3 places';
    if (['tapis', 'marbre', 'tfc'].includes(serviceId)) return 'Ex: 25 m²';
    if (serviceId === 'tapisserie') return 'Ex: 1 article';
    return 'Ex: 1';
  };

  // Slot-like add animation state
  const [showTicker, setShowTicker] = useState(false);
  const [tickerValue, setTickerValue] = useState(0);
  const tickerRef = useRef({ raf: null });

  function triggerAddAnimation(amount) {
    // cancel any running animation
    if (tickerRef.current.raf) {
      cancelAnimationFrame(tickerRef.current.raf);
      tickerRef.current.raf = null;
    }

    setShowTicker(true);
    setTickerValue(0);

    const duration = 900; // ms
    const start = performance.now();

    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / duration);
      // ease out
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * amount);
      setTickerValue(current);

      if (progress < 1) {
        tickerRef.current.raf = requestAnimationFrame(step);
      } else {
        tickerRef.current.raf = null;
        // leave visible briefly then dismiss
        setTimeout(() => setShowTicker(false), 700);
      }
    }

    tickerRef.current.raf = requestAnimationFrame(step);
  }

  useEffect(() => {
    calculateTotal();
  }, [selectedServices, quantities, urgency, area, surfaceArea]);

  const calculateTotal = () => {
    let subtotal = 0;

    Object.entries(selectedServices).forEach(([serviceId, option]) => {
      const service = services[serviceId];
      const quantity = quantities[serviceId] || 1;
      const optionMultiplier = service.options[option]?.multiplier || 1;
      
      subtotal += service.basePrice * optionMultiplier * quantity;
    });

    // Surface area bonus (for tapis and salon)
    const surface = parseInt(surfaceArea) || 0;
    if (surface > 50) {
      subtotal *= 1.2; // 20% increase for large surfaces
    }

    // Apply urgency multiplier
    subtotal *= urgencyLevels[urgency].multiplier;

    // Apply area multiplier
    subtotal *= areas[area].multiplier;

    setTotal(Math.round(subtotal));
  };

  return (
    <section className={styles.calculatorSection}>
      <div className={styles.container}>
        <div className={styles.calculatorCard}>
          <div className={styles.header}>
            <h2 className={styles.title}>Calculateur de Devis</h2>
            <p className={styles.subtitle}>
              Sélectionnez vos services et obtenez un devis personnalisé instantané
            </p>
          </div>

          {/* Services Selection */}
          <div className={styles.servicesGrid}>
            {Object.entries(services).map(([serviceId, service]) => (
              <div 
                key={serviceId}
                className={`${styles.serviceCard} ${selectedServices[serviceId] ? styles.selected : ''}`}
              >
                <div className={styles.serviceHeader}>
                  <span className={styles.serviceIcon}>{service.icon}</span>
                  <div className={styles.serviceInfo}>
                    <h3>{service.name}</h3>
                    <p>{service.description}</p>
                    <span className={styles.basePrice}>À partir de {service.basePrice} DT {service.unity ? `par ${service.unity}` : ''}</span>
                  </div>
                  <button
                    type="button"
                    className={styles.selectButton}
                    onClick={() => handleServiceToggle(serviceId)}
                  >
                    {selectedServices[serviceId] ? '✓' : '+'}
                  </button>
                </div>

                {selectedServices[serviceId] && (
                  <div className={styles.serviceOptions}>
                    <div className={styles.optionGroup}>
                      <label>Type de service:</label>
                      <select
                        value={selectedServices[serviceId]}
                        onChange={(e) => handleOptionChange(serviceId, e.target.value)}
                        className={styles.select}
                      >
                        {Object.entries(service.options).map(([optionId, option]) => (
                          <option key={optionId} value={optionId}>
                            {option.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className={styles.optionGroup}>
                      <label>{getQuantityLabel(serviceId)}:</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input
                          type="number"
                          min="1"
                          placeholder={getQuantityPlaceholder(serviceId)}
                          value={quantities[serviceId] ?? ''}
                          onChange={(e) => handleQuantityChange(serviceId, e.target.value)}
                          className={styles.input}
                        />
                        {/* show unit for surface-based services */}
                        {['tapis', 'marbre', 'tfc'].includes(serviceId) && (
                          <small style={{ color: '#6c757d' }}>m²</small>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Additional Options */}
          {Object.keys(selectedServices).length > 0 && (
            <div className={styles.additionalOptions}>
              <h3>Options supplémentaires</h3>
              
              <div className={styles.optionsRow}>
                <div className={styles.optionGroup}>
                  <label>Surface totale (m²):</label>
                  <input
                    type="number"
                    placeholder="Ex: 50"
                    value={surfaceArea}
                    onChange={(e) => setSurfaceArea(e.target.value)}
                    className={styles.input}
                  />
                  <small>Surface &gt; 50m² : +20% sur le total</small>
                </div>

                <div className={styles.optionGroup}>
                  <label>Urgence:</label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value)}
                    className={styles.select}
                  >
                    {Object.entries(urgencyLevels).map(([urgencyId, urgencyLevel]) => (
                      <option key={urgencyId} value={urgencyId}>
                        {urgencyLevel.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.optionGroup}>
                  <label>Zone géographique:</label>
                  <select
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className={styles.select}
                  >
                    {Object.entries(areas).map(([areaId, areaInfo]) => (
                      <option key={areaId} value={areaId}>
                        {areaInfo.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Total Display */}
          {Object.keys(selectedServices).length > 0 && (
            <div className={styles.totalSection}>
              <div className={styles.totalCard}>
                <h3>Estimation de votre devis</h3>
                <div className={styles.totalAmount}>
                  <span className={styles.currency}>DT</span>
                  <span className={styles.amount}>{total}</span>
                </div>
                <p className={styles.totalNote}>
                  * Prix indicatif - Devis final après inspection sur site
                </p>
              </div>
            </div>
          )}

          {/* Ticker: slot-like added item animation (fixed) */}
          {showTicker && (
            <div className={`${styles.ticker} ${!showTicker ? styles.hide : ''}`} role="status" aria-live="polite">
              {/* <div className={styles.label}>{tickerValue < 0 ? 'Retiré' : 'Ajouté'}</div> */}
              <div className={styles.value}>{tickerValue < 0 ? '- DT ' + Math.abs(tickerValue) : 'DT ' + tickerValue}</div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}