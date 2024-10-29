import { useState, useEffect, useRef } from 'react';
import { useWeb3 } from "../Web3/Web3";
import { Send, ArrowLeft, Wallet, Receipt, Edit2, Trash2, X, Check } from 'lucide-react';
import styles from './MessageFeed.module.css';

interface Message {
    sender: string;
    senderName: string;
    content: string;
    timestamp: number;
    messageType: number;
    isEdited: boolean;
    isDeleted: boolean;
    paymentInfo?: {
        amount: string;
        memo?: string;
    };
}

interface MessageFeedProps {
    friendAddress: string;
    friendName: string;
    onBack: () => void;
}

const MessageFeed: React.FC<MessageFeedProps> = ({ friendAddress, friendName, onBack }) => {
    const { userAccount, peerSystemContracts, web3 } = useWeb3();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentMemo, setPaymentMemo] = useState('');
    const [editingMessageIndex, setEditingMessageIndex] = useState<number | null>(null);
    const [editedContent, setEditedContent] = useState('');
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchMessages = async () => {
        if (!peerSystemContracts?.peerChat || !userAccount) return;

        try {
            const msgs = await peerSystemContracts.peerChat.methods
                .getMessages(friendAddress)
                .call({ from: userAccount.address });
            console.log("Friend Messages: ", msgs);
            setMessages(msgs);
        } catch (err) {
            console.error("Error fetching messages:", err);
        }
    };

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 10000);
        return () => clearInterval(interval);
    }, [friendAddress, peerSystemContracts, userAccount]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !peerSystemContracts?.peerChat || userAccount == null) return;

        try {
            await peerSystemContracts.peerChat.methods
                .sendMessage(friendAddress, newMessage)
                .send({ from: userAccount.address });
            setNewMessage('');
            fetchMessages();
        } catch (err) {
            console.error("Error sending message:", err);
        }
    };

    const handleEditMessage = async (index: number) => {
        if (!peerSystemContracts?.peerChat || !userAccount) return;

        try {
            await peerSystemContracts.peerChat.methods
                .editMessage(friendAddress, index, editedContent)
                .send({ from: userAccount.address });
            setEditingMessageIndex(null);
            setEditedContent('');
            fetchMessages();
        } catch (err) {
            console.error("Error editing message:", err);
        }
    };

    const handleDeleteMessage = async (index: number) => {
        if (!peerSystemContracts?.peerChat || !userAccount) return;

        try {
            await peerSystemContracts.peerChat.methods
                .deleteMessage(friendAddress, index)
                .send({ from: userAccount.address });
            fetchMessages();
        } catch (err) {
            console.error("Error deleting message:", err);
        }
    };

    const handleSendPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!paymentAmount || !peerSystemContracts?.peerChat || userAccount == null) return;

        try {
            const amountInWei = web3?.utils.toWei(paymentAmount, 'ether');
            const message = `Sent ${paymentAmount} ETH`;

            await peerSystemContracts.peerChat.methods
                .sendPayment(friendAddress, message, paymentMemo)
                .send({
                    from: userAccount.address,
                    value: amountInWei
                });

            setShowPaymentModal(false);
            setPaymentAmount('');
            setPaymentMemo('');
            fetchMessages();
        } catch (err) {
            console.error("Error sending payment:", err);
        }
    };

    const startEditing = (message: Message, index: number) => {
        setEditingMessageIndex(index);
        setEditedContent(message.content);
    };

    const cancelEditing = () => {
        setEditingMessageIndex(null);
        setEditedContent('');
    };

    const renderMessage = (message: Message, index: number) => {
        const isOwnMessage = message.sender.toLowerCase() === userAccount?.address.toLowerCase();
        const isPayment = message.messageType.toString() == '1';
        const isEditing = editingMessageIndex === index;

        if (message.isDeleted) {
            return (
                <div key={index} className={`${styles.messageGroup} ${isOwnMessage ? styles.sent : styles.received}`}>
                    <div className={`${styles.messageBubble} ${styles.deletedMessage}`}>
                        <p>Message deleted</p>
                    </div>
                </div>
            );
        }

        return (
            <div key={index} className={`${styles.messageGroup} ${isOwnMessage ? styles.sent : styles.received}`}>
                <div className={`${styles.messageBubble} ${isOwnMessage ? styles.sent : styles.received} ${isPayment ? styles.payment : ''}`}>
                    {!isOwnMessage && <p className={styles.senderName}>{message.senderName}</p>}

                    {isPayment && message.paymentInfo ? (
                        <div className={styles.paymentInfo}>
                            <div className={styles.paymentHeader}>
                                <Receipt size={16} />
                                <span>Payment {isOwnMessage ? "Sent" : "Received"}</span>
                            </div>
                            <p className={styles.paymentAmount}>
                                {web3?.utils.fromWei(message.paymentInfo.amount, 'ether')} ETH
                            </p>
                            {message.paymentInfo?.memo && (
                                <div className={styles.paymentMemoContainer}>
                                    <p className={styles.paymentMemoLabel}>Memo</p>
                                    <p className={styles.paymentMemo}>"{message.paymentInfo.memo}"</p>
                                </div>
                            )}
                        </div>
                    ) : isEditing ? (
                        <div className={styles.editContainer}>
                            <input
                                type="text"
                                value={editedContent}
                                onChange={(e) => setEditedContent(e.target.value)}
                                className={styles.editInput}
                            />
                            <div className={styles.editActions}>
                                <button
                                    onClick={() => handleEditMessage(index)}
                                    className={styles.editButton}
                                >
                                    <Check size={16} />
                                </button>
                                <button
                                    onClick={cancelEditing}
                                    className={styles.cancelButton}
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <p>{message.content}</p>
                    )}

                    <div className={styles.messageFooter}>
                        <p className={styles.messageTime}>
                            {new Date(Number(message.timestamp) * 1000).toLocaleTimeString()}
                            {message.isEdited && <span className={styles.editedTag}> (edited)</span>}
                        </p>

                        {isOwnMessage && !isPayment && !isEditing && (
                            <div className={styles.messageActions}>
                                <button
                                    onClick={() => startEditing(message, index)}
                                    className={styles.actionButton}
                                >
                                    <Edit2 size={14} />
                                </button>
                                <button
                                    onClick={() => handleDeleteMessage(index)}
                                    className={styles.actionButton}
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <button onClick={onBack} className={styles.backButton}>
                    <ArrowLeft size={24} />
                </button>
                <div className={styles.headerInfo}>
                    <h2>{friendName}</h2>
                    <p>{friendAddress.slice(0, 6)}...{friendAddress.slice(-4)}</p>
                </div>
            </div>

            <div className={styles.messagesFeed}>
                {messages.map(renderMessage)}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className={styles.inputContainer}>
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className={styles.messageInput}
                />
                <div className={styles.actionButtons}>
                    <button
                        type="button"
                        className={styles.payButton}
                        onClick={() => setShowPaymentModal(true)}
                    >
                        <Wallet size={20} />
                    </button>
                    <button type="submit" className={styles.sendButton}>
                        <Send size={20} />
                    </button>
                </div>
            </form>

            {showPaymentModal && (
                <>
                    <div className={styles.modalOverlay} onClick={() => setShowPaymentModal(false)} />
                    <div className={styles.paymentModal}>
                        <form onSubmit={handleSendPayment} className={styles.paymentForm}>
                            <h3>Send Payment</h3>
                            <label>
                                Amount (ETH)
                                <input
                                    type="number"
                                    step="0.000000000000000001"
                                    value={paymentAmount}
                                    onChange={(e) => setPaymentAmount(e.target.value)}
                                    placeholder="0.0"
                                />
                            </label>
                            <label>
                                Memo (optional)
                                <input
                                    type="text"
                                    value={paymentMemo}
                                    onChange={(e) => setPaymentMemo(e.target.value)}
                                    placeholder="What's this for?"
                                />
                            </label>
                            <div className={styles.modalButtons}>
                                <button
                                    type="button"
                                    className={styles.cancelButton}
                                    onClick={() => setShowPaymentModal(false)}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className={styles.confirmButton}>
                                    Send Payment
                                </button>
                            </div>
                        </form>
                    </div>
                </>
            )}
        </div>
    );
};

export default MessageFeed;