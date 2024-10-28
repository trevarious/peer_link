import { useEffect, useState } from "react";
import { useWeb3 } from "../../Web3/Web3";
import styles from '../HomePage.module.css';
import dailyReward from "../../../assets/daily-rewards.png";
import dailyReward_notReady from "../../../assets/daily-rewards_not_ready.png";
import backButton from "../../../assets/back-button.png";

interface RewardPageProps {
    handleStateChange: (state: string) => void;
}

const RewardPage: React.FC<RewardPageProps> = ({ handleStateChange }) => {
    const [rewardsInfo, setRewardsInfo] = useState<any>(null);
    const [countdown, setCountdown] = useState('');
    const { userAccount, peerLink, peerSystemContracts } = useWeb3();
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const getRewardsInfo = async () => {
        if (userAccount && peerSystemContracts) {
            if (peerSystemContracts.peerRewards) {
                try {
                    console.log("Attempting to get rewards")
                    const response = await peerSystemContracts.peerRewards.methods.getUserRewards(userAccount.address).call();
                    console.log("Response from getUserRewards(): ", response);
                    setRewardsInfo(response);
                } catch (err) {
                    console.log("Error getting reward info");
                    console.log(err);
                }
            }
        }
    };

    const getTimeUntilNextClaim = async () => {
        if (userAccount && peerSystemContracts) {
            if (peerSystemContracts.peerRewards) {
                try {
                    const response = await peerSystemContracts.peerRewards.methods.getTimeUntilNextClaim(userAccount.address).call();
                    console.log("response from getTimeUntilNextClaim");
                    console.log(response);
                } catch (err) {
                    console.log("Error getting time until next calim");
                    console.log(err);
                }
            }
        }
    }
    const onDailyRewardClaim = async () => {
        if (!userAccount || !peerSystemContracts?.peerRewards) {
            console.log("Missing requirements:", {
                userAccount: !!userAccount,
                peerRewards: !!peerSystemContracts?.peerRewards
            });
            return;
        }

        setLoading(true);
        setSuccessMessage('');

        try {
            // Debug: Check account status first
            console.log("Checking with account:", userAccount.address);

            // Debug: Get current rewards state
            const currentRewards = await peerSystemContracts.peerRewards.methods
                .getUserRewards(userAccount.address)
                .call();
            console.log("Current rewards state:", currentRewards);

            // Debug: Check time until next claim
            const timeUntilNext = await peerSystemContracts.peerRewards.methods
                .getTimeUntilNextClaim(userAccount.address)
                .call();
            console.log("Time until next claim:", timeUntilNext);

            // Debug: Try to estimate gas for the transaction
            try {
                const gasEstimate = await peerSystemContracts.peerRewards.methods
                    .claimDailyReward()
                    .estimateGas({ from: userAccount.address });
                console.log("Gas estimate:", gasEstimate);
            } catch (gasError) {
                console.error("Gas estimation failed:", gasError);
                // Still continue with the actual call
            }

            // Attempt the actual claim
            console.log("Attempting to claim reward...");
            const tx = await peerSystemContracts.peerRewards.methods
                .claimDailyReward()
                .send({
                    from: userAccount.address,
                    // Optionally add gas limit if needed
                    // gas: 200000,
                });

            console.log("Claim transaction result:", tx);
            setSuccessMessage('Reward claimed successfully!');
            await getRewardsInfo(); // Refresh the rewards info

        } catch (error: any) {
            console.error('Detailed error:', {
                message: error.message,
                code: error.code,
                data: error.data,
                receipt: error.receipt,
            });

            // Attempt to get a more specific error message
            let errorMessage = 'Failed to claim reward. ';
            if (error.message.includes("Too soon to claim")) {
                errorMessage = "Please wait for the cooldown period to end before claiming again.";
            } else if (error.message.includes("NoAccountFoundToDistributeRewards")) {
                errorMessage = "Your account is not eligible for rewards.";
            } else if (error.message.includes("NotInitialized")) {
                errorMessage = "The reward system is not properly initialized.";
            }

            setSuccessMessage(''); // Clear any existing success message
            console.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };


    const formatDate = (time: any) => {
        if (!time) return '';

        const currentTime = new Date();
        const lastClaimedTime = new Date(Number(time) * 1000);

        // Get hours and minutes for time display
        const unModdedHour = lastClaimedTime.getHours();
        const hour = unModdedHour % 12 || 12; // Convert 0 to 12 for 12 AM
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
            // Same year - show Month Day at Time
            return `${lastClaimedTime.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            })} at ${actualTime}`;
        } else {
            // Different year - show Month Day, Year at Time
            return `${lastClaimedTime.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            })} at ${actualTime}`;
        }
    };
    useEffect(() => {
        if (peerSystemContracts) {
            if (peerSystemContracts.peerRewards) {
                getTimeUntilNextClaim();
            }
        }
    }, [peerLink, userAccount, peerSystemContracts]);


    useEffect(() => {
        if (peerSystemContracts) {
            if (peerSystemContracts.peerRewards) {
                getRewardsInfo();
                formatDate(rewardsInfo);
                getTimeUntilNextClaim();
            }
        }
    }, [peerLink, userAccount,]);



    useEffect(() => {
        const timer = setInterval(() => {
            if (rewardsInfo) {
                const claimInterval = 24 * 60 * 60 * 1000; // Claim frequency
                const nextClaimTime = Number(rewardsInfo[0]) * 1000 + claimInterval;
                const now = new Date().getTime();
                const timeLeft = nextClaimTime - now;

                if (timeLeft >= 0) {
                    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
                    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
                    setCountdown(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
                } else {
                    setCountdown('Claim available!');
                }
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [rewardsInfo]);

    return (
        <>
            {rewardsInfo ? (
                <div className={styles.rewardsContainer}>
                    <img className={styles.backButton} onClick={() => handleStateChange("Home")} src={backButton} alt="" />
                    <h2 className={styles.rewardsTitle}>Rewards Information</h2>
                    <div className={styles.rewardDetail}>
                        <strong>Last Claimed:</strong> {formatDate(rewardsInfo[0])}
                    </div>
                    <div className={styles.rewardDetail}>
                        <strong>Daily Streak:</strong> {rewardsInfo.dailyStreak.toString()}
                    </div>
                    <div className={styles.rewardDetail}>
                        <strong>Longest Streak:</strong> {rewardsInfo.longestStreak.toString()}
                    </div>
                    <div className={styles.rewardDetail}>
                        <strong>Total Rewards Earned:</strong> {rewardsInfo.totalRewards.toString()} CRED
                    </div>
                    <div className={styles.rewardDetail}>
                        <strong>Multiplier:</strong> {(parseFloat(rewardsInfo.multiplier) / 100).toString()}x
                    </div>
                    <div className={styles.countdownContainer}>
                        <strong>Next Reward In: </strong>
                        <div className={styles.countdownTimer}>{countdown}</div>
                        {countdown === 'Claim available!' ? (
                            <>
                                <img className={styles.claimRewardBtn} onClick={onDailyRewardClaim} src={dailyReward} alt="Claim daily reward" />
                                {loading && <p>Claiming reward...</p>}
                                {successMessage && <p className={styles.successMessage}>{successMessage}</p>}
                            </>
                        ) : (
                            <img className={`${styles.claimRewardBtn} ${styles.notReady}`} src={dailyReward_notReady} alt="disabled rewards" />
                        )}
                    </div>
                </div>
            ) : (
                <div className={styles.rewardsContainer}>
                    <h1></h1>
                    <img className={styles.backButton} onClick={() => handleStateChange("Home")} src={backButton} alt="" />
                </div>
            )}
        </>
    );
};

export default RewardPage;
