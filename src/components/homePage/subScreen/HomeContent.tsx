import React, { useState } from "react";
import styles from "../HomePage.module.css";
import increaseReputation from "../../../assets/increase-reputation.png";
import CredSvg from "../../svgs/CredSvg";

interface HomeContentProps {
    web3: any; // Ideally, replace `any` with the specific type for web3
    userAccount: any;
    userInfo: any[] | null; // Adjust according to the structure of userInfo
    credBalance: number | null;
    ethBalance: string | null;
    onIncreaseReputation: () => void;
    handleSubScreenChange: (screen: string) => void;
    depositETH: (amount: string) => Promise<void>;
    widthdrawETH: (amount: string) => Promise<void>;
    costToIncreaseReputation: number | string;
}

const HomeContent: React.FC<HomeContentProps> = ({
    web3,
    userInfo,
    credBalance,
    ethBalance,
    onIncreaseReputation,
    handleSubScreenChange,
    depositETH,
    widthdrawETH,
    costToIncreaseReputation,
}) => {
    const [showTooltip, setShowTooltip] = useState(false);

    const handleDepositClick = async () => {
        const amount = prompt("Enter an amount:");
        if (amount && !isNaN(Number(amount)) && Number(amount) > 0) {
            await depositETH(amount);
        } else {
            alert("Please enter a valid numerical value.");
        }
    };

    const handleWithdrawClick = async () => {
        const amount = prompt("Enter an amount:");
        if (amount && !isNaN(Number(amount)) && Number(amount) > 0) {
            await widthdrawETH(amount);
        } else {
            alert("Please enter a valid numerical value.");
        }
    };

    return (
        <div className={styles.profileBody}>
            <div className={styles.statsContainer}>
                <div className={`${styles.statItem} ${styles.statItemFlex}`}>
                    <div className={styles.statItemRight}>
                        <div className={styles.statValue}>{userInfo ? userInfo[1].toString() : "..."}</div>
                        <div className={styles.statLabel}>Friends</div>
                    </div>
                </div>

                <div
                    className={`${styles.statItem} ${styles.statItemFlex}`}
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                >
                    <div className={styles.statItemRight}>
                        <div className={styles.statValue}>{userInfo ? userInfo[2].toString() : "..."}</div>
                        <div className={styles.statLabel}>Reputation</div>
                    </div>

                    <img
                        className={`${styles.statButton} ${userInfo ? "" : styles.disabled}`}
                        src={increaseReputation}
                        alt="Increase Reputation"
                        onClick={onIncreaseReputation}
                    />
                    <p className={`${styles.tooltip} ${showTooltip ? styles.visible : ''}`}>
                        price: {costToIncreaseReputation} CRED
                    </p>
                </div>

                <div className={`${styles.statItem} ${styles.statItemFlex}`}>
                    <div className={styles.statItemRight}>
                        <div className={styles.statValue}>{userInfo ? userInfo[3]?.length : "..."}</div>
                        <div className={styles.statLabel}>Milestone NFTs</div>
                    </div>
                </div>
            </div>
            <div className={styles.credBalance}>
                <div className={styles.credInfo}>
                    <div className={styles.leftSection}>
                        <div className={styles.credSvgContainer}>
                            <CredSvg />
                        </div>

                        <div className={styles.leftSectionSub}>
                            <h3 className={styles.symbolTitle}>Cred</h3>
                            <div className={styles.leftSectionSubSub}>
                                <p className={styles.symbol}>{credBalance !== null ? credBalance.toString() : "Loading"}</p>
                                <p className={styles.symbol}>CRED</p>
                            </div>
                        </div>
                    </div>
                    <div className={styles.rightSection}>
                        <h3 className={styles.ethBalance}>{ethBalance && web3 ? web3.utils.fromWei(ethBalance, "ether") : "..."}</h3>
                        <p className={`${styles.symbol} ${styles.eth}`}>ETH</p>
                        <div onClick={handleDepositClick} className={styles.depositPOL}>+</div>
                        <div onClick={handleWithdrawClick} className={styles.withdrawPOL}>-</div>
                    </div>
                </div>
                <button
                    disabled={!userInfo}
                    className={`${styles.rewardsBtn} ${userInfo ? "" : styles.disabled}`}
                    onClick={() => handleSubScreenChange("Rewards")}
                >
                    Rewards Stats
                </button>
            </div>
        </div>
    );
};

export default HomeContent;
