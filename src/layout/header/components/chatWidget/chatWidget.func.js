import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { getChatMessages, getAIConfig } from '../../../../utils/tuning-loader';

export function useChatWidgetLogic({ isOpen, onClose }) {
    // Memoize these to prevent re-renders
    const chatMessages = React.useMemo(() => getChatMessages(), []);
    const aiConfig = React.useMemo(() => getAIConfig(), []);
    
    const [isExpanded, setIsExpanded] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [messages, setMessages] = useState(() => []);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    useEffect(() => {
        // Only scroll if chat is open to prevent unnecessary scrolling
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen, scrollToBottom]);

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
            timestamp: new Date().toLocaleTimeString(aiConfig.chat.locale, aiConfig.chat.timeFormat)
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
                    timestamp: new Date().toLocaleTimeString(aiConfig.chat.locale, aiConfig.chat.timeFormat)
                };
                setMessages(prev => [...prev, aiMessage]);
            } else {
                console.error('API returned error:', data.error, data.details);
                // Fallback response if API fails - console log error, show human message
                console.error('API Error Details:', data.error, data.details);
                const fallbackMessage = {
                    id: Date.now() + 1,
                    text: chatMessages.errorMessages.apiError,
                    sender: 'ai',
                    timestamp: new Date().toLocaleTimeString(aiConfig.chat.locale, aiConfig.chat.timeFormat)
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
            // Fallback response on error - console log error, show human message
            const errorMessage = {
                id: Date.now() + 1,
                text: chatMessages.errorMessages.unknownError,
                sender: 'ai',
                timestamp: new Date().toLocaleTimeString(aiConfig.chat.locale, aiConfig.chat.timeFormat)
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

    const handleMessagesScroll = useCallback((e) => {
        e.stopPropagation();
    }, []);

    const quickReplies = useMemo(() => chatMessages.quickReplies, [chatMessages.quickReplies]);

    const showInitialMessage = useCallback(() => {
        if (messages.length === 0) {
            const initialMessage = {
                id: 1,
                text: chatMessages.initialMessage.text,
                sender: chatMessages.initialMessage.sender,
                timestamp: new Date().toLocaleTimeString(aiConfig.chat.locale, aiConfig.chat.timeFormat)
            };
            setMessages([initialMessage]);
        }
    }, [messages.length, chatMessages.initialMessage, aiConfig.chat.locale, aiConfig.chat.timeFormat]);

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
        handleMessagesScroll,
        showInitialMessage
    };
}
