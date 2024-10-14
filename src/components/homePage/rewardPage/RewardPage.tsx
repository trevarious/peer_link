import { useEffect, useState } from "react";
import { useWeb3 } from "../../Web3/Web3";
import styles from '../HomePage.module.css';
import dailyReward from "../../../assets/daily-rewards.png";
import dailyReward_notReady from "../../../assets/daily-rewards_not_ready.png";
import backButton from "../../../assets/back-button.png"

interface RewardPageProps {
    handleStateChange: (state: string) => void; // Define the expected type for handleStateChange
}

const RewardPage: React.FC<RewardPageProps> = ({ handleStateChange }) => {
    const [rewardsInfo, setRewardsInfo] = useState<any>(null);
    const [countdown, setCountdown] = useState('');
    const { userAccount, peerLink, peerSystemContracts } = useWeb3();

    const getRewardsInfo = async () => {
        if (userAccount && peerSystemContracts.peerRewards) {
            const response = await peerSystemContracts.peerRewards.methods.getUserRewards(userAccount.address).call();
            console.log(response);
            setRewardsInfo(response);
        }
    };

    const onDailyRewardClaim = async () => {
        if (userAccount && peerSystemContracts.peerRewards) {
            await peerSystemContracts.peerRewards.methods.claimDailyReward().send({ from: userAccount.address });
        }
    };

    useEffect(() => {
        getRewardsInfo();
    }, [peerLink, userAccount]);

    useEffect(() => {
        const timer = setInterval(() => {
            if (rewardsInfo) {
                const claimInterval = 24 * 60 * 60 * 1000; // Adjust this based on your claim frequency
                const nextClaimTime = Number(rewardsInfo[0]) * 1000 + claimInterval; // Add interval to last claim time
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
                        <strong>Last Claimed:</strong> {new Date(Number(rewardsInfo[0]) * 1000).toLocaleString()}
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
                        {rewardsInfo[0] == 0 ? (
                            <img className={styles.claimRewardBtn} onClick={onDailyRewardClaim} src={dailyReward} alt="Claim daily reward" />
                        ) : (
                            <img className={`${styles.claimRewardBtn} ${styles.notReady}`} src={dailyReward_notReady} alt="disabled rewards" />
                        )}
                    </div>
                </div>
            ) : (
                <>
                    <h1>OFFLINE</h1>
                    <img className={styles.backButton} onClick={() => handleStateChange("Home")} src={backButton} alt="" />
                </>
            )}
        </>
    );
};

export default RewardPage;
