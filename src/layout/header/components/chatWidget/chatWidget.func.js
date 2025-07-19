import { useState, useEffect, useRef } from 'react';

export function useChatWidgetLogic({ isOpen, onClose }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 1,
            text: "Bonjour! Je suis Fares de Chaabane's Cleaning Intelligence. Je suis ici pour vous aider avec tous vos besoins de nettoyage! Que vous ayez besoin de nettoyage résidentiel, de services commerciaux, ou que vous ayez des questions sur nos offres, n'hésitez pas à me le faire savoir. Comment puis-je vous aider aujourd'hui?",
            sender: 'ai',
            timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (!isOpen) {
            setIsExpanded(false);
        }
    }, [isOpen]);

    const sendMessage = async (text) => {
        const userMessage = {
            id: Date.now(),
            text,
            sender: 'user',
            timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsTyping(true);

        try {
            console.log('Sending message to API:', text);
            
            // Prepare chat history for Gemini - skip the initial AI message
            const chatHistory = messages
                .slice(1) // Skip the first AI message
                .map(msg => ({
                    role: msg.sender === 'user' ? 'user' : 'model',
                    parts: [{ text: msg.text }]
                }));
            
            console.log('Chat history prepared:', chatHistory);

            const requestBody = {
                message: text,
                chatHistory: chatHistory
            };
            
            console.log('Request body:', requestBody);

            const response = await fetch('/api/gemini', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);

            const data = await response.json();
            console.log('Response data:', data);

            if (data.success) {
                console.log('Success! AI response:', data.message);
                const aiMessage = {
                    id: Date.now() + 1,
                    text: data.message,
                    sender: 'ai',
                    timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                };
                setMessages(prev => [...prev, aiMessage]);
            } else {
                console.error('API returned error:', data.error, data.details);
                // Fallback response if API fails
                const fallbackMessage = {
                    id: Date.now() + 1,
                    text: `Je suis désolé, j'ai des difficultés à me connecter en ce moment. Erreur: ${data.error || 'Erreur inconnue'}`,
                    sender: 'ai',
                    timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                };
                setMessages(prev => [...prev, fallbackMessage]);
            }
        } catch (error) {
            console.error('Error sending message:', error);
            console.error('Error details:', {
                name: error.name,
                message: error.message,
                stack: error.stack
            });
            // Fallback response on error
            const errorMessage = {
                id: Date.now() + 1,
                text: `Je suis désolé, quelque chose s'est mal passé. Veuillez réessayer plus tard. Erreur: ${error.message}`,
                sender: 'ai',
                timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (inputValue.trim()) {
            sendMessage(inputValue.trim());
        }
    };

    const handleClose = () => {
        onClose();
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (inputValue.trim() && !isTyping) {
                sendMessage(inputValue.trim());
            }
        }
    };

    const handleExpandToggle = () => {
        setIsExpanded(!isExpanded);
    };

    const handleOverlayClick = () => {
        if (isExpanded) {
            setIsExpanded(false);
        }
    };

    const handleMessagesScroll = (e) => {
        e.stopPropagation();
    };

    const quickReplies = ['Réserver un Service de Nettoyage', 'Voir Nos Services', 'Obtenir un Devis Gratuit', 'Nettoyage d\'Urgence'];

    return {
        isExpanded,
        messages,
        inputValue,
        isTyping,
        messagesEndRef,
        quickReplies,
        setInputValue,
        sendMessage,
        handleSubmit,
        handleClose,
        handleKeyDown,
        handleExpandToggle,
        handleOverlayClick,
        handleMessagesScroll
    };
}
