import { useState, useEffect, useRef } from 'react';

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

export function useDevisCalculatorLogic() {
  const [selectedServices, setSelectedServices] = useState({});
  const [quantities, setQuantities] = useState({});
  const [urgency, setUrgency] = useState('normal');
  const [area, setArea] = useState('tunis');
  const [surfaceArea, setSurfaceArea] = useState('');
  const [total, setTotal] = useState(0);
  const [showTicker, setShowTicker] = useState(false);
  const [tickerValue, setTickerValue] = useState(0);
  const tickerRef = useRef({ raf: null, previousTotal: 0 });

  function triggerAddAnimation(newTotal) {
    // cancel any running animation
    if (tickerRef.current.raf) {
      cancelAnimationFrame(tickerRef.current.raf);
      tickerRef.current.raf = null;
    }

    const previousTotal = tickerRef.current.previousTotal;
    setShowTicker(true);
    setTickerValue(previousTotal);

    const duration = 900; // ms
    const start = performance.now();

    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / duration);
      // ease out
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(previousTotal + eased * (newTotal - previousTotal));
      setTickerValue(current);

      if (progress < 1) {
        tickerRef.current.raf = requestAnimationFrame(step);
      } else {
        tickerRef.current.raf = null;
        tickerRef.current.previousTotal = newTotal;
        // leave visible briefly then dismiss
        setTimeout(() => setShowTicker(false), 700);
      }
    }

    tickerRef.current.raf = requestAnimationFrame(step);
  }

  const handleServiceToggle = (serviceId) => {
    setSelectedServices(prev => {
      const newSelected = { ...prev };
      if (newSelected[serviceId]) {
        // remove
        delete newSelected[serviceId];
        const newQuantities = { ...quantities };
        delete newQuantities[serviceId];
        setQuantities(newQuantities);
      } else {
        // add
        newSelected[serviceId] = 'standard';
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

      return { ...prev, [serviceId]: newQty };
    });
  };

  const getQuantityLabel = (serviceId) => {
    if (serviceId === 'salon') return "Nombre de places";
    if (['tapis', 'marbre', 'tfc'].includes(serviceId)) return 'Surface (m²)';
    if (serviceId === 'tapisserie') return "Nombre d'articles";
    return 'Quantité';
  };

  const getQuantityPlaceholder = (serviceId) => {
    if (serviceId === 'salon') return 'Ex: 3 places';
    if (['tapis', 'marbre', 'tfc'].includes(serviceId)) return 'Ex: 25 m²';
    if (serviceId === 'tapisserie') return 'Ex: 1 article';
    return 'Ex: 1';
  };

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

    const newTotal = Math.round(subtotal);

    // Trigger animation if total changed
    if (newTotal !== total) {
      triggerAddAnimation(newTotal);
    }

    setTotal(newTotal);
  };

  useEffect(() => {
    calculateTotal();
  }, [selectedServices, quantities, urgency, area, surfaceArea]);

  return {
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
  };
}
