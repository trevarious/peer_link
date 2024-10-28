import { useState, useEffect, useRef } from 'react';
import { useWeb3 } from "../Web3/Web3";
import { Send, ArrowLeft, Wallet, Receipt } from 'lucide-react';
import styles from './MessageFeed.module.css';

const MessageFeed = ({ friendAddress, friendName, onBack }) => {
    const { userAccount, peerSystemContracts, web3 } = useWeb3();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentMemo, setPaymentMemo] = useState('');
    const messagesEndRef = useRef(null);

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
        // Poll for new messages every 10 seconds
        const interval = setInterval(fetchMessages, 10000);
        return () => clearInterval(interval);
    }, [friendAddress, peerSystemContracts, userAccount]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !peerSystemContracts?.peerChat) return;

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

    const handleSendPayment = async (e) => {
        e.preventDefault();
        if (!paymentAmount || !peerSystemContracts?.peerChat) return;

        try {
            const amountInWei = web3.utils.toWei(paymentAmount, 'ether');
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

    const renderMessage = (message, index) => {
        const isOwnMessage = message.sender.toLowerCase() === userAccount?.address.toLowerCase();
        const isPayment = message.messageType.toString() === '1'; // PAYMENT type from enum
        console.log("Message Type: ", message.messageType);

        return (
            <div
                key={index}
                className={`${styles.messageGroup} ${isOwnMessage ? styles.sent : styles.received}`}
            >
                <div
                    className={`${styles.messageBubble} ${isOwnMessage ? styles.sent : styles.received
                        } ${isPayment ? styles.payment : ''}`}
                >
                    {!isOwnMessage && (
                        <p className={styles.senderName}>{message.senderName}</p>
                    )}

                    {isPayment ? (
                        <div className={styles.paymentInfo}>
                            <div className={styles.paymentHeader}>
                                <Receipt size={16} />
                                <span>Payment {isOwnMessage ? "Sent" : "Received"}</span>
                            </div>
                            <p className={styles.paymentAmount}>
                                {web3.utils.fromWei(message.paymentInfo.amount, 'ether')} ETH
                            </p>
                            {message.paymentInfo.memo && (
                                <div className={styles.paymentMemoContainer}>
                                    <p className={styles.paymentMemoLabel}>Memo</p>
                                    <p className={styles.paymentMemo}>"{message.paymentInfo.memo}"</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p>{message.content}</p>
                    )}

                    <p className={styles.messageTime}>
                        {new Date(Number(message.timestamp) * 1000).toLocaleTimeString()}
                    </p>
                </div>
            </div>
        );
    };

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <button onClick={onBack} className={styles.backButton}>
                    <ArrowLeft size={24} />
                </button>
                <div className={styles.headerInfo}>
                    <h2>{friendName}</h2>
                    <p>{friendAddress.slice(0, 6)}...{friendAddress.slice(-4)}</p>
                </div>
            </div>

            {/* Messages */}
            <div className={styles.messagesFeed}>
                {messages.map(renderMessage)}
                <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
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

            {/* Payment Modal */}
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