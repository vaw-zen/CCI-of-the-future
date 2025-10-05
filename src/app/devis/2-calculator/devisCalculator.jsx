"use client";

import styles from './devisCalculator.module.css';
import { useDevisCalculatorLogic } from './devisCalculator.func';

export default function DevisCalculator() {
  const {
    services,
    urgencyLevels,
    areas,
    selectedServices,
    quantities,
    urgency,
    area,
    surfaceArea,
    total,
    showTicker,
    tickerValue,
    handleServiceToggle,
    handleOptionChange,
    handleQuantityChange,
    getQuantityLabel,
    getQuantityPlaceholder,
    setSurfaceArea,
    setUrgency,
    setArea
  } = useDevisCalculatorLogic();

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
          {/* {Object.keys(selectedServices).length > 0 && (
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
          )} */}

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