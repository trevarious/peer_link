import { useEffect, useState } from "react";
import { useWeb3 } from "../Web3/Web3";
import styles from "./FriendInfo.module.css"; // Assuming you're using CSS Modules
import back from "../../assets/back-button.png"

// Define the structure of friendInfo
interface FriendInfoType {
    info: {
        name: string;
        aboutMe: string;
    };
    reputation: number;
    friendsCount: number;
    flexNFTs: any[]; // Replace `any` with a more specific type if possible
}

interface FriendInfoProps {
    friendAddress: string;
    onStateChange: any;
}

const FriendInfo: React.FC<FriendInfoProps> = ({ friendAddress, onStateChange }) => {
    const { userAccount, peerLink } = useWeb3();
    const [friendInfo, setFriendInfo] = useState<FriendInfoType | null>(null);

    const getFriendInfo = async () => {
        if (userAccount && peerLink && friendAddress) {
            try {
                const response: FriendInfoType = await peerLink.methods.getUserInfo(friendAddress).call();
                setFriendInfo(response);
            } catch (err) {
                console.log("Error getting user info", err);
            }
        }
    };

    useEffect(() => {
        getFriendInfo();
    }, [friendAddress, userAccount, peerLink]);

    return (
        <div className={styles.container}>
            <div className={styles.backButton}>
                <img
                    onClick={() => onStateChange("Rewards")}
                    className={styles.backButton}
                    src={back}
                    alt="back-button"
                />
            </div>
            {friendInfo ? (
                <>
                    <div className={styles.header}>
                        <h3 className={styles.friendName}>{friendInfo.info.name}</h3>
                        <p className={styles.friendReputation}>Reputation: {friendInfo.reputation.toString()}</p>
                    </div>
                    <div className={styles.bioSection}>
                        <h4>About Me:</h4>
                        <p className={styles.aboutMe}>{friendInfo.info.aboutMe}</p>
                    </div>
                    <div className={styles.detailsSection}>
                        <p>Friends Count: {friendInfo.friendsCount.toString()}</p>
                        <p>Flex NFTs: {friendInfo.flexNFTs.length}</p>
                        <p className={styles.friendAddress}>
                            <a
                                target="_blank"
                                rel="noopener noreferrer"
                                href={`https://sepolia.etherscan.io/address/${friendAddress}`}
                            >
                                0x...{friendAddress.slice(-5)}
                            </a>
                        </p>
                    </div>
                </>
            ) : (
                <p>Loading friend information...</p>
            )}
        </div>
    );
};

export default FriendInfo;
