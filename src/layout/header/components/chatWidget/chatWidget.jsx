import React from 'react';
import { useChatWidgetLogic } from './chatWidget.func';
import { getChatMessages } from '../../../../utils/tuning-loader';
import styles from './chatWidget.module.css';
import MarkdownRenderer from '@/utils/components/MarkdownRenderer';

const ChatWidget = ({ isOpen, onClose }) => {
    const chatMessages = getChatMessages();
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
        handleMessagesScroll
    } = useChatWidgetLogic({ isOpen, onClose });



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
                    {messages.map((message, index) => (
                        <div key={message.id} className={styles.messageGroup}>
                                                    <div
                            className={`${styles.message} ${message.sender === 'ai' ? styles.aiMessage : styles.userMessage}`}
                        >
                            {message.sender === 'ai' ? (
                                <MarkdownRenderer content={message.text} />
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

                    {/* Typing Indicator */}
                    {isTyping && (
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
                        disabled={isTyping}
                    />
                    <button
                        type="submit"
                        className={styles.sendButton}
                        disabled={!inputValue.trim() || isTyping}
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
};

export default ChatWidget;