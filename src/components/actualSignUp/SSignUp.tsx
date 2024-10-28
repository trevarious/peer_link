import { useState } from "react";
import { useWeb3 } from "../Web3/Web3";
import styles from "./SSignUp.module.css";
import confetti from 'canvas-confetti';

const SSignUp = () => {
    const [bioInput, setBioInput] = useState('');
    const [usernameInput, setUsernameInput] = useState('');
    const [walletAddressInput, setWalletAddressInput] = useState('');
    const [isTransitioning, setIsTransitioning] = useState(false);
    const { userAccount, peerLink } = useWeb3();

    const fireConfetti = () => {
        const duration = 3000;
        const end = Date.now() + duration;

        const interval = setInterval(() => {
            if (Date.now() > end) {
                return clearInterval(interval);
            }

            confetti({
                particleCount: 200,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#00ff00', '#0099ff']
            });
            confetti({
                particleCount: 200,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#00ff00', '#0099ff']
            });
        }, 50);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!userAccount) return;

        if (usernameInput.trim() === '' || bioInput.trim() === '') {
            alert("You must fill out all fields.");
            return;
        }

        if (walletAddressInput.toLowerCase() !== userAccount.address.toLowerCase()) {
            alert("Address field does not match the connected account");
            return;
        }

        try {
            // Start the loading/transition state
            setIsTransitioning(true);

            // Mint the user profile
            await peerLink.methods.mintUser(
                userAccount.address,
                usernameInput,
                bioInput
            ).send({ from: userAccount.address });

            // Trigger confetti
            fireConfetti();

            // After confetti, trigger the fade out animation
            setTimeout(() => {
                // The parent component will handle the actual page change
                if (typeof window !== 'undefined') {
                    // Force a re-check of the account status
                    window.location.reload();
                }
            }, 8000); // Wait for confetti to finish

        } catch (err) {
            console.log("Error:", err);
            setIsTransitioning(false);
        }
    }

    return (
        <div className={`${styles.pageWrapper} ${isTransitioning ? 'opacity-0' : 'opacity-100'} transition-opacity duration-1000`}>
            <div className={styles.container}>
                <div className={styles.headerSection}>
                    <h1 className={styles.mainTitle}>What is PeerLink?</h1>
                    <p className={styles.headerDescription}>
                        PeerLink is a decentralized social protocol where your reputation, friendships, and interactions are tokenized on-chain. Connect with others, earn rewards for participating, and build your Web3 identity through NFTs and reputation scores.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formHeader}>
                        <h2 className={styles.title}>Create Account</h2>
                        <p className={styles.description}>Your information is stored on-chain</p>
                    </div>

                    <div className={styles.fieldsContainer}>
                        <fieldset className={styles.fieldSet}>
                            <label htmlFor="wallet-address" className={styles.label}>
                                Wallet Address
                            </label>
                            <input
                                id="wallet-address"
                                type="text"
                                value={walletAddressInput}
                                onChange={(e) => setWalletAddressInput(e.target.value)}
                                placeholder="0x"
                                className={styles.input}
                            />
                        </fieldset>

                        <fieldset className={styles.fieldSet}>
                            <label htmlFor="username" className={styles.label}>
                                Username
                            </label>
                            <input
                                id="username"
                                type="text"
                                value={usernameInput}
                                onChange={(e) => setUsernameInput(e.target.value)}
                                placeholder="ex. Satoshi Buterin"
                                className={styles.input}
                            />
                        </fieldset>

                        <fieldset className={styles.fieldSet}>
                            <label htmlFor="bio" className={styles.label}>
                                Bio
                            </label>
                            <textarea
                                id="bio"
                                value={bioInput}
                                onChange={(e) => setBioInput(e.target.value)}
                                placeholder="Share your story"
                                className={styles.textarea}
                            />
                        </fieldset>
                    </div>

                    <button
                        type="submit"
                        className={`${styles.button} ${isTransitioning ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={isTransitioning}
                    >
                        {isTransitioning ? 'Creating Profile...' : 'Mint Your Profile'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default SSignUp;