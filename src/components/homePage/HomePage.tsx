import { useEffect, useState } from "react";
import { useWeb3 } from "../Web3/Web3";
import styles from './HomePage.module.css';
import FriendPage from "../friendPage/FriendPage"
import peerLinkLogo from "../../assets/peer-link-logo-nobg-big.png";
// import { CredToken } from "../svgs/CredSvg"
// import credCoin from "../../assets/cred-erc.png";
// import addFriends from "../../assets/add-friend.png";
// import increaseReputation from "../../assets/increase-reputation.png";
// import viewAll from "../../assets/view-all.png";
// import dailyReward from "../../assets/daily-rewards.png";
// import dailyReward_notReady from "../../assets/daily-rewards_not_ready.png";
import RewardPage from "./rewardPage/RewardPage";
import SwitchNetworks from "../switchNetworks/SwitchNetworks";
import HomeContent from "./subScreen/HomeContent"
const ARBITRUM_SEPOLIA_CHAIN_ID = 0x66eee;

const HomePage = () => {
    const [userInfo, setUserInfo] = useState<any>(null); // 
    const [rewardsInfo, setRewardsInfo] = useState<any>(null);
    const [credBalance, setCredBalance] = useState<any>(null);
    const [ethBalance, setEthBalance] = useState<any>(null);
    const [activeButton, setActiveButton] = useState<string>('home');
    const [activeSubScreen, setActiveSubScreen] = useState<any>('Home');
    const [countdown, setCountdown] = useState('');
    const { web3, userAccount, peerLink, peerSystemContracts, chainId } = useWeb3();
    // const [content, setContent] = useState<any>(null);
    const [isLoading, setIsLoading] = useState<any>(false);
    const [costToIncreaseReputation, setCostToIncreaseReputation] = useState<any>(0);

    const getUserInfo = async () => {
        if (userAccount && peerLink) {
            try {
                const response = await peerLink.methods.getUserInfo(userAccount.address).call();
                setUserInfo(response);
            } catch (err) {
                console.log("Error getting user info");
                console.log(err);
            }
        }
    };

    const getRewardsInfo = async () => {
        if (userAccount && peerSystemContracts) {
            if (peerSystemContracts.peerRewards) {
                const response = await peerSystemContracts.peerRewards.methods.getUserRewards(userAccount.address).call();
                console.log("Reponse from getRewardsInfo() ", response)
                setRewardsInfo(response);
            }
        }
    };
    const getCostToIncreaseReputation = async () => {
        if (userAccount && peerSystemContracts) {
            if (peerSystemContracts.peerRewards) {
                const response = await peerSystemContracts.peerRewards.methods.calculateRewardAmount(userAccount.address).call();
                console.log("Cost to increase reputation: ", response);
                setCostToIncreaseReputation(response.toString());
            }
        }
    }

    // const onDailyRewardClaim = async () => {
    //     if (userAccount && peerSystemContracts.peerRewards) {
    //         await peerSystemContracts.peerRewards.methods.claimDailyReward().send({ from: userAccount.address });
    //     }
    // };

    const getUserCredBalance = async () => {
        console.log(
            "Starting Request for cred balance"
        )
        if (userAccount && peerSystemContracts) {
            if (peerSystemContracts.cred) {
                try {
                    const response = await peerSystemContracts.cred.methods.balanceOf(userAccount.address).call();
                    setCredBalance(response);
                } catch (err) {
                    console.log("Error getting cred balance");
                    console.log(err);
                }
            }
        }
    };
    const getEthBalance = async () => {
        if (userAccount && peerLink) {
            try {
                const response = await peerLink.methods.ethBalances().call({ from: userAccount.address });
                console.log("Respones from polBalancs");
                console.log(response);
                setEthBalance(response.toString());
            } catch (err) {
                console.log("Error gettting eth balances");
                console.log(err);
            }
        }
    }

    const onIncreaseReputation = async () => {
        let answer = prompt(`Are You Sure? Upgrading will cost You CRED! ANSWER: "yes" to upgrade!`);
        if (answer === 'yes' && userAccount && peerLink) {
            await peerLink.methods.increaseReputation().send({ from: userAccount.address });
        }
    };
    const depositETH = async (amount: any) => {
        if (userAccount && peerLink && web3) {
            try {
                await peerLink.methods.depositETH().send({ from: userAccount.address, value: web3.utils.toWei(amount, "ether") });

            } catch (err) {
                console.log("Error Buying Eth.");
                console.log(err);
            }
        }
    }
    const withdrawETH = async (amount: any) => {
        if (userAccount && peerLink && web3) {
            try {
                await peerLink.methods.withdrawETH(web3.utils.toWei(amount, "ether")).send({ from: userAccount.address });

            } catch (err) {
                console.log("Error Buying Eth.");
                console.log(err);
            }
        }
    }
    // const handleStateChange = (newState: any) => {
    //     setIsLoading(true);
    //     setActiveSubScreen(newState);
    // }
    // const getContent = () => {
    //     switch (activeSubScreen) {
    //         case "Home":
    //             return < HomeContent />;
    //         case "Rewards":
    //             return < RewardsContent />;
    //         case "Friends":
    //             return < Friends />
    //         default:
    //             return null;
    //     }
    // }
    useEffect(() => {
        if (isLoading) {
            const timer = setTimeout(() => {
                // setContent(getContent());
                setIsLoading(false);

            }, 500); // Adjust this delay as needed
            return () => clearTimeout(timer);
        }
    }, [isLoading, activeSubScreen]);


    useEffect(() => {
        if (peerSystemContracts) {
            getUserInfo();
            getUserCredBalance();
            getEthBalance();
            getRewardsInfo();
            getCostToIncreaseReputation();
        }
    }, [peerLink, userAccount, peerSystemContracts]);

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
                    console.log("Countdown until next daily claim: ", countdown);
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

    return (<>
        {chainId == ARBITRUM_SEPOLIA_CHAIN_ID ?

            (< div className={styles.container} >
                <div className={styles.profileCard}>
                    <div className={styles.profileHeader}>
                        {userInfo ?
                            <>
                                <img src={peerLinkLogo} alt="Profile" className={styles.profileImg} />
                                <h1 className={styles.profileName}>{userInfo ? userInfo[0][0] : "Loading"}</h1>
                                <p className={styles.profileBio}>{userInfo ? userInfo[0][1] : "Loading"}</p>

                            </>
                            : <h1>No Connection...</h1>}
                    </div>
                    <div className={styles.subSectionContainer}>
                        {activeSubScreen == "Home" ?
                            <HomeContent web3={web3} userAccount={userAccount} userInfo={userInfo} credBalance={credBalance ? credBalance : "..."} ethBalance={ethBalance} onIncreaseReputation={onIncreaseReputation} handleSubScreenChange={handleSubScreenChange} depositETH={depositETH} widthdrawETH={withdrawETH} costToIncreaseReputation={costToIncreaseReputation} />
                            : activeSubScreen === "Rewards" ? <RewardPage handleStateChange={setActiveSubScreen} /> : activeSubScreen === "Friends" ? <FriendPage /> : ""}
                    </div>
                    <div className={styles.buttonContainer}>
                        <button
                            className={`${styles.firstOption} ${styles.optionsBtn} ${activeButton === 'home' ? styles.active : ''}`}
                            onClick={() => {
                                handleButtonClick('home');
                                setActiveSubScreen("Home");

                            }}
                        >
                            Home
                        </button>
                        <button
                            className={`${styles.optionsBtn} ${activeButton === 'friends' ? styles.active : ''}`}
                            onClick={() => {
                                handleButtonClick('friends');
                                setActiveSubScreen("Friends");

                            }}

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
            </div >) : <SwitchNetworks chainId={chainId} />
        }
    </>
    );
};

export default HomePage;
