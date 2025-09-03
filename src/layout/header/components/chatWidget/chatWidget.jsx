import React, { Suspense, lazy, useState, useEffect, useMemo } from 'react';
import { useChatWidgetLogic } from './chatWidget.func';
import { getChatMessages } from '../../../../utils/tuning-loader';
import styles from './chatWidget.module.css';

// Lazy load the markdown renderer
const MarkdownRenderer = lazy(() => import('@/utils/components/markdownRenderer/markdownRenderer'));

const ChatWidget = React.memo(({ isOpen, onClose }) => {
    const chatMessages = useMemo(() => getChatMessages(), []);
    const [markdownLoaded, setMarkdownLoaded] = useState(false);
    
    const {
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
    } = useChatWidgetLogic({ isOpen, onClose });

    // Preload markdown renderer when chat opens
    useEffect(() => {
        if (isOpen && !markdownLoaded) {
            // Small delay to make the loading feel more natural
            const timer = setTimeout(() => {
                setMarkdownLoaded(true);
            }, 300); // 300ms delay before starting to load libraries
            
            return () => clearTimeout(timer);
        }
    }, [isOpen, markdownLoaded]);

    // Show initial message immediately when markdown is loaded
    useEffect(() => {
        if (markdownLoaded && isOpen && messages.length === 0) {
            // Show intro message immediately once libraries are loaded
            showInitialMessage();
        }
    }, [markdownLoaded, isOpen, messages.length, showInitialMessage]);

    // Always render the chat widget for smooth animations
    // The visibility is controlled by CSS classes instead of conditional rendering

    // Show loading state when chat opens but markdown isn't loaded yet
    const showLoadingState = isOpen && !markdownLoaded;

    return (
        <>
            {/* Overlay for expanded mode */}
            <div
                className={`${styles.overlay} ${(isOpen && isExpanded) ? styles.overlayVisible : ''}`}
                onClick={handleOverlayClick}
            />

            {/* Chat Window */}
            <div className={`${styles.chatWindow} ${isOpen ? styles.chatWindowOpen : ''} ${isExpanded ? styles.chatWindowExpanded : ''} ${(!isOpen && isExpanded) ? styles.chatWindowExpandedClosed : ''}`}>
                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.headerLeft}>
                        <div className={styles.avatar}>
                            <img 
                                src="/chatBot/owner.jpeg" 
                                alt="Fares Chaabane" 
                                className={styles.avatarImage}
                            />
                        </div>
                        <div className={styles.headerText}>
                            <h3 className={styles.title}>{chatMessages.ui.headerTitle}</h3>
                            <p className={styles.subtitle}>{chatMessages.ui.onlineStatus}</p>
                        </div>
                    </div>
                    <div className={styles.headerButtons}>
                        <button
                            className={styles.headerButton}
                            onClick={handleExpandToggle}
                        >
                            {isExpanded ? '⊖' : '⊞'}
                        </button>
                        <button
                            className={styles.headerButton}
                            onClick={handleClose}
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <div className={styles.messagesContainer} onWheel={handleMessagesScroll}>
                    {/* Show loading state when opening chat - simulates AI "thinking" while libraries load */}
                    {showLoadingState && (
                        <div className={styles.typingIndicator}>
                            <div className={styles.dot} style={{ animationDelay: '0ms' }}></div>
                            <div className={styles.dot} style={{ animationDelay: '200ms' }}></div>
                            <div className={styles.dot} style={{ animationDelay: '400ms' }}></div>
                        </div>
                    )}

                    {/* Show messages only after loading is complete */}
                    {!showLoadingState && messages.map((message, index) => (
                        <div key={message.id} className={styles.messageGroup}>
                            <div
                                className={`${styles.message} ${message.sender === 'ai' ? styles.aiMessage : styles.userMessage}`}
                            >
                                {message.sender === 'ai' ? (
                                    markdownLoaded ? (
                                        <Suspense fallback={<span>{message.text}</span>}>
                                            <MarkdownRenderer content={message.text} />
                                        </Suspense>
                                    ) : (
                                        <span>{message.text}</span>
                                    )
                                ) : (
                                    message.text
                                )}
                            </div>
                            <div className={`${styles.timestamp} ${message.sender === 'ai' ? styles.timestampAi : styles.timestampUser}`}>
                                {message.timestamp}
                            </div>

                            {/* Quick Replies for AI messages */}
                            {message.sender === 'ai' && index === messages.length - 1 && !isTyping && (
                                <div className={styles.quickReplies}>
                                    {quickReplies.map((reply) => (
                                        <button
                                            key={reply}
                                            className={styles.quickReply}
                                            onClick={() => sendMessage(reply)}
                                        >
                                            {reply}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Typing Indicator for actual AI responses */}
                    {!showLoadingState && isTyping && (
                        <div className={styles.typingIndicator}>
                            <div className={styles.dot} style={{ animationDelay: '0ms' }}></div>
                            <div className={styles.dot} style={{ animationDelay: '200ms' }}></div>
                            <div className={styles.dot} style={{ animationDelay: '400ms' }}></div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form className={styles.inputContainer} onSubmit={handleSubmit}>
                    <input
                        className={styles.input}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={chatMessages.ui.inputPlaceholder}
                        disabled={isTyping || showLoadingState}
                    />
                    <button
                        type="submit"
                        className={styles.sendButton}
                        disabled={!inputValue.trim() || isTyping || showLoadingState}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path
                                d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"
                                stroke="#141416"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </button>
                </form>
            </div>
        </>
    );
});

export default ChatWidget;