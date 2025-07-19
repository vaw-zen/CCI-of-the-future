import { useState, useEffect, useRef } from 'react';

export function useChatWidgetLogic({ isOpen, onClose }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 1,
            text: "Hi! How can I assist with your cleaning today?",
            sender: 'ai',
            timestamp: '02:27 PM'
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

    const sendMessage = (text) => {
        const userMessage = {
            id: Date.now(),
            text,
            sender: 'user',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');

        setIsTyping(true);

        setTimeout(() => {
            setIsTyping(false);
            const aiMessage = {
                id: Date.now() + 1,
                text: `I'd be happy to help you with your cleaning needs! What specific service are you looking for?`,
                sender: 'ai',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, aiMessage]);
        }, 1500);
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

    const quickReplies = ['Book a Cleaning', 'View Services', 'Get a Quote'];

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
