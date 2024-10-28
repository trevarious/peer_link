import { useWeb3 } from "../Web3/Web3";
import { useEffect, useState } from "react";
import styles from "./FriendPage.module.css";
import SendFriendRequest from "./SendFriendRequest";
import FriendRequests from "./FriendRequests";
import MessageFeed from "./MessageFeed";
import { Send } from "lucide-react";

interface Friend {
    address: string;
    name: string;
}

// Define the type for the filtered friends
interface FilteredFriend {
    address: string;
    name: string;
    aboutMe?: string; // Optional since it might not always be present
}

const FriendPage = () => {
    const { userAccount, peerLink } = useWeb3();
    const [friends, setFriends] = useState<any[]>([]); // Use a more specific type if known
    const [subSection, setSubSection] = useState('Rewards');
    const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const grabFriends = async () => {
        if (userAccount && peerLink) {
            try {
                const response = await peerLink.methods.getFriendsInfo().call({ from: userAccount.address });
                console.log("Your friends", response);
                setFriends(response);
            } catch (err) {
                console.log("Error grabbing your friends", err);
            }
        }
    };

    useEffect(() => {
        grabFriends();
    }, [peerLink, userAccount]);

    const handleMessageClick = (address: string, name: string) => {
        setSelectedFriend({ address, name });
        setSubSection('Messages');
    };

    const filteredFriends: FilteredFriend[] = friends[0]
        ? friends[0].map((address: string, index: number) => {
            const friendInfo = friends[1][index];
            const name = friendInfo.name || friendInfo[0];
            return name.toLowerCase().includes(searchTerm.toLowerCase())
                ? { address, name, aboutMe: friendInfo.aboutMe || friendInfo[1] }
                : null;
        }).filter((friend: any): friend is FilteredFriend => friend !== null) // Type guard to filter nulls
        : [];

    const renderFriendsList = () => {
        if (filteredFriends.length === 0) return <h1>No Friends Found</h1>;

        return filteredFriends.map(({ address, name, aboutMe }, index) => (
            <div key={`${address}-${index}`} className={styles.friendItem}>
                <div className={styles.friendDetails}>
                    <h3 className={styles.friendName}>{name}</h3>
                    <p className={styles.friendAddress}>
                        <a
                            target="_blank"
                            rel="noopener noreferrer"
                            href={`https://sepolia.etherscan.io/address/${address}`}
                        >
                            0x...{address.slice(-5)}
                        </a>
                    </p>
                    <p className={styles.aboutMe}>{aboutMe}</p>
                </div>
                <div className={styles.actionButtons}>
                    <Send
                        className={styles.icon}
                        onClick={() => handleMessageClick(address, name)}
                    />
                </div>
            </div>
        ));
    };

    return (
        <div className={styles.container}>
            {subSection === 'Messages' && selectedFriend ? (
                <MessageFeed
                    friendAddress={selectedFriend.address}
                    friendName={selectedFriend.name}
                    onBack={() => {
                        setSubSection('Rewards');
                        setSelectedFriend(null);
                    }}
                />
            ) : (
                <>
                    <h1 className={styles.title}>Friends</h1>
                    <input
                        type="text"
                        placeholder="Search friends..."
                        className={styles.searchBar}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className={styles.statsContainer}>
                        {/* Your stats items here */}
                    </div>

                    {/* Conditional rendering of subsections */}
                    {subSection === "Send Friend Request" ? (
                        <SendFriendRequest onStateChange={setSubSection} />
                    ) : subSection === "View Friend Request" ? (
                        <FriendRequests onStateChange={setSubSection} />
                    ) : null}

                    {subSection === "Rewards" && (
                        <>
                            <div className={styles.friendsList}>
                                {renderFriendsList()}
                            </div>
                            <div className={styles.buttonContainer}>
                                <button
                                    className={`${styles.buttons} ${styles.sendRequestBtn}`}
                                    onClick={() => setSubSection("Send Friend Request")}
                                >
                                    Send Friend Request
                                </button>
                                <button
                                    className={`${styles.buttons} ${styles.viewRequestBtn}`}
                                    onClick={() => setSubSection("View Friend Request")}
                                >
                                    View Requests
                                </button>
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    );
};

export default FriendPage;
