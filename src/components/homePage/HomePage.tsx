import { useEffect, useState } from "react";
import { useWeb3 } from "../Web3/Web3";
import styles from './HomePage.module.css';
import peerLinkLogo from "../../assets/peer-link-logo-nobg-big.png";
import credCoin from "../../assets/cred-erc.png";
// import addFriends from "../../assets/add-friend.png";
import increaseReputation from "../../assets/increase-reputation.png";
// import viewAll from "../../assets/view-all.png";
// import dailyReward from "../../assets/daily-rewards.png";
// import dailyReward_notReady from "../../assets/daily-rewards_not_ready.png";
import RewardPage from "./rewardPage/RewardPage";

const HomePage = () => {
    const [userInfo, setUserInfo] = useState<any>(null);
    const [rewardsInfo, setRewardsInfo] = useState<any>(null);
    const [credBalance, setCredBalance] = useState<any>(null);
    const [activeButton, setActiveButton] = useState<string>('home');
    const [activeSubScreen, setActiveSubScreen] = useState<any>('Home');
    const [countdown, setCountdown] = useState('');
    const { userAccount, peerLink, peerSystemContracts } = useWeb3();

    const getUserInfo = async () => {
        if (userAccount && peerLink) {
            const response = await peerLink.methods.getUserInfo(userAccount.address).call();
            setUserInfo(response);
        }
    };

    const getRewardsInfo = async () => {
        if (userAccount && peerSystemContracts.peerRewards) {
            const response = await peerSystemContracts.peerRewards.methods.getUserRewards(userAccount.address).call();
            console.log(response)
            setRewardsInfo(response);
        }
    };

    // const onDailyRewardClaim = async () => {
    //     if (userAccount && peerSystemContracts.peerRewards) {
    //         await peerSystemContracts.peerRewards.methods.claimDailyReward().send({ from: userAccount.address });
    //     }
    // };

    const getUserCredBalance = async () => {
        if (userAccount && peerLink) {
            const response = await peerLink.methods.credBalance(userAccount.address).call();
            setCredBalance(response);
        }
    };

    const onIncreaseReputation = async () => {
        let answer = prompt(`Are You Sure? Upgrading will cost You CRED! ANSWER: "yes" to upgrade!`);
        if (answer === 'yes' && userAccount && peerLink) {
            await peerLink.methods.increaseReputation().send({ from: userAccount.address });
        }
    };

    useEffect(() => {
        getUserInfo();
        getUserCredBalance();
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
                    console.log(countdown);
                }
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [rewardsInfo]);



    const handleButtonClick = (buttonName: string) => {
        setActiveButton(buttonName);
    };
    const handleSubScreenChange = (name: any) => {
        setActiveSubScreen(name);
    }

    return (
        <div className={styles.container}>
            <div className={styles.profileCard}>
                <div className={styles.profileHeader}>
                    <img src={peerLinkLogo} alt="Profile" className={styles.profileImg} />
                    <h1 className={styles.profileName}>{userInfo ? userInfo[0][0] : "Loading"}</h1>
                    <p className={styles.profileBio}>{userInfo ? userInfo[0][1] : "Loading"}</p>
                </div>
                {activeSubScreen == "Home" ?
                    <div className={styles.profileBody}>
                        <div className={styles.statsContainer}>
                            <div className={`${styles.statItem} ${styles.statItemFlex}`}>
                                <div className={styles.statItemRight}>
                                    <div className={styles.statValue}>{userInfo ? userInfo[1].toString() : "..."}</div>
                                    <div className={styles.statLabel}>Friends</div>
                                </div>
                                {/* <img className={styles.statButton} src={addFriends} alt="" /> */}
                            </div>

                            <div className={`${styles.statItem} ${styles.statItemFlex}`}>
                                <div className={styles.statItemRight}>
                                    <div className={styles.statValue}>{userInfo ? userInfo[2].toString() : "..."}</div>
                                    <div className={styles.statLabel}>Reputation</div>
                                </div>
                                <img className={styles.statButton} src={increaseReputation} onClick={onIncreaseReputation} />
                            </div>

                            <div className={`${styles.statItem} ${styles.statItemFlex}`}>
                                <div className={styles.statItemRight}>
                                    <div className={styles.statValue}>{userInfo ? userInfo[3].length : "..."}</div>
                                    <div className={styles.statLabel}>Milestone NFTs</div>
                                </div>
                                {/* <img className={styles.statButton} src={viewAll} alt="" /> */}
                            </div>
                        </div>
                        <div className={styles.credBalance}>
                            <div className={styles.credInfo}>
                                <strong>{credBalance ? credBalance.toString() : "Loading"}</strong> CRED
                                <img className={styles.credCoin} src={credCoin} alt="CRED coin" />
                            </div>
                            {/* {rewardsInfo && (
                                <>
                                    <strong>Next Reward In: </strong>
                                    <div className={styles.countdownContainer}>
                                        <div className={styles.countdownTimer}>{countdown}</div>


                                        {rewardsInfo[0] == 0 ? <img className={styles.claimRewardBtn} onClick={onDailyRewardClaim} src={dailyReward} alt="Claim daily reward" /> : <img className={`${styles.claimRewardBtn} ${styles.notReady}`} src={dailyReward_notReady} alt="disabled rewards" />}
                                    </div>
                                </>
                            )} */}
                            <button onClick={() => handleSubScreenChange("Rewards")}>View Rewards Stats</button>
                        </div>
                    </div>
                    : <RewardPage handleStateChange={setActiveSubScreen} />}
                <div className={styles.buttonContainer}>
                    <button
                        className={`${styles.firstOption} ${styles.optionsBtn} ${activeButton === 'home' ? styles.active : ''}`}
                        onClick={() => handleButtonClick('home')}
                    >
                        Home
                    </button>
                    <button
                        className={`${styles.optionsBtn} ${activeButton === 'friends' ? styles.active : ''}`}
                        onClick={() => handleButtonClick('friends')}
                    >
                        Friends
                    </button>
                    <button
                        className={`${styles.optionsBtn} ${activeButton === 'groups' ? styles.active : ''}`}
                        onClick={() => handleButtonClick('groups')}
                    >
                        Groups
                    </button>
                    <button
                        className={`${styles.lastOption} ${styles.optionsBtn} ${activeButton === 'tokens' ? styles.active : ''}`}
                        onClick={() => handleButtonClick('tokens')}
                    >
                        Tokens
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
