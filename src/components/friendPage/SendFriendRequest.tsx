import React, { useState } from "react";
import BackButton from "../../assets/back-button.png";
import { useWeb3 } from "../Web3/Web3";
import styles from "./SendFriendRequest.module.css";
// import confetti from ';
import { SendIcon, Check, Loader2, AlertCircle } from "lucide-react";

// Define props interface
interface SendFriendRequestProps {
    onStateChange: (state: string) => void;
}

const SendFriendRequest: React.FC<SendFriendRequestProps> = ({ onStateChange }) => {
    const [walletAddressInput, setWalletAddressInput] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [showSuccess, setShowSuccess] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const { userAccount, peerLink } = useWeb3();

    // const fireConfetti = () => {
    //     const count = 200;
    //     const defaults = {
    //         origin: { y: 0.7 },
    //         spread: 50,
    //     };

    //     function fire(particleRatio: number, opts: any) {
    //         // confetti({
    //         //     ...defaults,
    //         //     ...opts,
    //         //     particleCount: Math.floor(count * particleRatio),
    //         //     scalar: 1.2,
    //         // });
    //     }

    //     fire(0.25, {
    //         spread: 26,
    //         startVelocity: 55,
    //         origin: { x: 0.2, y: 0.7 }
    //     });

    //     fire(0.2, {
    //         spread: 60,
    //         origin: { x: 0.8, y: 0.7 }
    //     });

    //     fire(0.35, {
    //         spread: 100,
    //         decay: 0.91,
    //         origin: { x: 0.5, y: 0.7 }
    //     });
    // };

    const showSuccessState = () => {
        setShowSuccess(true);
        // fireConfetti();

        // Reset after animation
        setTimeout(() => {
            setShowSuccess(false);
            setWalletAddressInput('');
            onStateChange("Rewards");
        }, 10000);
    };

    const handleWalletAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setWalletAddressInput(e.target.value);
        setError(''); // Clear any existing errors when input changes
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userAccount || !peerLink) {
            setError('Wallet not connected');
            return;
        }

        const toAddress = walletAddressInput.trim();
        if (toAddress.length < 1) {
            setError('Please enter a wallet address');
            return;
        }

        // Basic Ethereum address validation
        if (!/^0x[a-fA-F0-9]{40}$/.test(toAddress)) {
            setError('Invalid Ethereum address format');
            return;
        }

        // Prevent sending request to self
        if (toAddress.toLowerCase() === userAccount.address.toLowerCase()) {
            setError('Cannot send friend request to yourself');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            // Send the transaction and wait for it to be mined
            await peerLink.methods
                .sendFriendRequest(toAddress)
                .send({ from: userAccount.address })
                .on('transactionHash', (hash: string) => {
                    console.log('Transaction Hash:', hash);
                })
                .on('receipt', (receipt: any) => {
                    console.log('Transaction Receipt:', receipt);
                    showSuccessState();
                })
                .on('error', (error: any) => {
                    throw error;
                });
        } catch (err: any) {
            console.error("Error sending friend request:", err);
            setError(err.message.includes('User denied')
                ? 'Transaction was rejected'
                : 'Failed to send friend request. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`${styles.inboxContainer} relative`}>
            {/* Success overlay */}
            {showSuccess && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10 animate-fade-in">
                    <div className="bg-white rounded-lg p-6 text-center transform scale-110 transition-transform">
                        <Check className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-800">Friend Request Sent!</h3>
                        <p className="text-gray-600 mt-2">Get ready to make a new friend!</p>
                    </div>
                </div>
            )}

            <h2>Send Friend Request</h2>
            <div className={styles.backButtonContainer}>
                <img
                    onClick={() => !isLoading && onStateChange("Rewards")}
                    className={`${styles.backButton} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    src={BackButton}
                    alt="back-button"
                />
            </div>

            <form onSubmit={handleSubmit} className={styles.requestForm}>
                <div className={styles.inputGroup}>
                    <label htmlFor="wallet-address" className={styles.label}>
                        Wallet Address
                    </label>
                    <input
                        id="wallet-address"
                        name="wallet-address"
                        type="text"
                        value={walletAddressInput}
                        onChange={handleWalletAddressChange}
                        placeholder="0x..."
                        className={`${styles.input} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''} 
                            ${error ? 'border-red-500' : ''}`}
                        disabled={isLoading}
                    />
                    {error && (
                        <div className="flex items-center gap-2 text-red-500 mt-2 text-sm">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </div>
                    )}
                </div>
                <button
                    type="submit"
                    className={`${styles.submitButton} relative flex items-center justify-center gap-2
                        ${isLoading ? 'opacity-75 cursor-not-allowed' : 'hover:scale-105'} 
                        transition-all duration-200`}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Sending Request...
                        </>
                    ) : (
                        <>
                            <SendIcon className="w-5 h-5" />
                            Send Friend Request
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default SendFriendRequest;
