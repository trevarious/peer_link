import { useEffect, useState } from "react"
import styles from "../HomePage.module.css"
import increaseReputation from "../../../assets/increase-reputation.png"
import credCoin from '../../../assets/cred-erc.png'
import CredSvg from "../../svgs/CredSvg"

const HomeContent = ({ web3, userAccount, userInfo, credBalance, ethBalance, onIncreaseReputation, handleSubScreenChange, depositETH, widthdrawETH, costToIncreaseReputation }) => {
    const [showTooltip, setShowTooltip] = useState(false);

    const handleDepositClick = async () => {
        let amount = prompt("Enter an amount:");
        if (typeof (amount) != typeof ('number') || amount <= 0) {
            alert("Please enter a numerical value");
        } else {
            depositETH(amount);
        }
    }

    const handleWithdrawClick = async () => {
        let amount = prompt("Enter an amount: ");
        if (typeof (amount) != typeof ('number') || amount <= 0) {
            alert("Please enter numerical value");
        } else {
            widthdrawETH(amount);
        }
    }

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
                        onClick={onIncreaseReputation}
                    />
                    <p className={`${styles.tooltip} ${showTooltip ? styles.visible : ''}`}>
                        price: {costToIncreaseReputation} CRED
                    </p>
                </div>

                <div className={`${styles.statItem} ${styles.statItemFlex}`}>
                    <div className={styles.statItemRight}>
                        <div className={styles.statValue}>{userInfo ? userInfo[3].length : "..."}</div>
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
                                <p className={styles.symbol}>{credBalance ? credBalance.toString() : "Loading"}</p>
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
                    disabled={userInfo ? false : true}
                    className={`${styles.rewardsBtn} ${userInfo ? "" : styles.disabled}`}
                    onClick={() => handleSubScreenChange("Rewards")}
                >
                    Rewards Stats
                </button>
            </div>
        </div>
    )
}

export default HomeContent;