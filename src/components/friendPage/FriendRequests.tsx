import React, { useState, useEffect, useCallback } from "react";
import styles from "./FriendRequests.module.css";
import accepted from "../../assets/accepted.png";
import denied from "../../assets/denied.png";
import back from "../../assets/back-button.png";
import { useWeb3 } from "../Web3/Web3";
// import confetti from 'canvas-confetti';

// Update the interface to match the actual response structure
interface FriendRequest {
    0: string;  // address
    1: string;  // name
    2: boolean;
    3: bigint;
    pending: boolean;
    requestersAddress: string;
    requestersName: string;
    timestamp: bigint;
}

interface FriendRequestsProps {
    onStateChange: () => void;
}


const FriendRequests: React.FC<FriendRequestsProps> = ({ onStateChange }) => {
    const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
    const { userAccount, peerLink } = useWeb3();
    const [setShowSuccess] = useState<any>(false);

    // const fireConfetti = () => {
    //     const count = 200;
    //     const defaults = {
    //         origin: { y: 0.7 },
    //         spread: 50,
    //     };

    //     function fire(particleRatio: any, opts: any) {
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
        }, 5000);
    };


    const handleAcceptFriendShip = async (fromAddress: any) => {
        if (peerLink && userAccount) {
            await peerLink.methods.handleFriendRequest(fromAddress, true).send({ from: userAccount.address }).on('receipt', (receipt: any) => {
                console.log("receipt from handling friend request", receipt);
                showSuccessState();
            })
        }
    }

    const getRequests = useCallback(async () => {
        if (peerLink && userAccount) {
            try {
                const response = await peerLink.methods.getIncomingRequests().call({ from: userAccount.address });
                console.log("Response from friend requests:", response);
                // Ensure we're handling the response as an array
                const requests = Array.isArray(response) ? response : [];
                setFriendRequests(requests);
            } catch (err) {
                console.error("Error getting friend requests:", err);
            }
        } else {
            console.log("Issue connecting to web3");
        }
    }, [peerLink, userAccount]);

    useEffect(() => {
        if (userAccount && peerLink) {
            getRequests();
        }
    }, [getRequests, peerLink, userAccount]);

    const formatDate = (time: bigint | null) => {
        if (!time) return '';

        const timeNumber = Number(time);
        const currentTime = new Date();
        const lastClaimedTime = new Date(timeNumber * 1000);

        // Get hours and minutes for time display
        const unModdedHour = lastClaimedTime.getHours();
        const hour = unModdedHour % 12 || 12;
        const minute = lastClaimedTime.getMinutes().toString().padStart(2, '0');
        const actualTime = `${hour}:${minute}${unModdedHour >= 12 ? "PM" : "AM"}`;

        // Check if same calendar day
        const isSameDay =
            currentTime.getFullYear() === lastClaimedTime.getFullYear() &&
            currentTime.getMonth() === lastClaimedTime.getMonth() &&
            currentTime.getDate() === lastClaimedTime.getDate();

        // Check if yesterday
        const isYesterday =
            new Date(currentTime.getTime() - 86400000).getDate() === lastClaimedTime.getDate() &&
            currentTime.getMonth() === lastClaimedTime.getMonth() &&
            currentTime.getFullYear() === lastClaimedTime.getFullYear();

        if (isSameDay) {
            return `Today at ${actualTime}`;
        } else if (isYesterday) {
            return `Yesterday at ${actualTime}`;
        } else if (currentTime.getFullYear() === lastClaimedTime.getFullYear()) {
            return `${lastClaimedTime.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            })} at ${actualTime}`;
        } else {
            return `${lastClaimedTime.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            })} at ${actualTime}`;
        }
    };

    return (
        <div className={styles.inboxContainer}>
            <h2>Friend Requests</h2>
            <div className={styles.backButton}>
                <img
                    onClick={() => onStateChange()}
                    className={styles.backButton}
                    src={back}
                    alt="back-button"
                />
            </div>

            {friendRequests.length > 0 ? friendRequests.map((request, index) => (
                <div key={`${request.requestersAddress}-${index}`} className={styles.requestItem}>
                    <div className={`${styles.decisionButton} ${styles.denied}`}>
                        <img
                            className={`${styles.buttons} ${styles.denyBtn}`}
                            src={denied}
                            alt="denied"
                        />
                    </div>
                    <div className={styles.requestDetails}>
                        <h3 className={styles.requesterName}>
                            {request.requestersName || request[1]}
                        </h3>
                        <p className={styles.requesterAddress}>
                            <a
                                target="_blank"
                                rel="noopener noreferrer"
                                href={`https://sepolia.etherscan.io/address/${request.requestersAddress || request[0]}`}
                            >
                                0x...{(request.requestersAddress || request[0]).slice(-5)}
                            </a>
                        </p>
                        <p className={`${styles.timestamp}`}>
                            {formatDate(request.timestamp || request[3])}
                        </p>
                    </div>
                    <div className={`${styles.decisionButton} ${styles.accepted}`}>
                        <img
                            onClick={() => handleAcceptFriendShip(request.requestersAddress)}
                            className={`${styles.buttons} ${styles.acceptBtn}`}
                            src={accepted}
                            alt="accepted"
                        />
                    </div>
                </div>
            )) : <h1>No Requests</h1>}
        </div>
    );
};

export default FriendRequests;