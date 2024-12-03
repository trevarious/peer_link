import { useEffect, useState } from "react";
import { useWeb3 } from "../Web3/Web3";
import styles from "./GroupPage.module.css";
import { Users, Plus } from "lucide-react";
import CreateGroupPage from "./CreateGroupPage";

interface Group {
    id: string;
    name: string;
    about: string;
    createdAt: string;
    creator: string;
    memberCount: number;
    isActive: boolean;
    allowDonations: boolean;
    minDonationAmount: number;
    totalDonations: number;
    balance: number;
    treasuryConfig: {
        autoDistribute: boolean;
        adminShare: number;
        memberShare: number;
        minHoldPeriod: number;
        lastDistribution: string;
    };
}

// interface UserAccount {
//     address: string;
// }

const GroupCard = ({ group }: { group: Group }) => {
    return (
        <div className={styles.card}>
            <div className={styles.cardHeader}>
                <div className={styles.titleContainer}>
                    <Users className={styles.icon} />
                    <h2 className={styles.title}>{group.name}</h2>
                </div>
                <p className={styles.description}>{group.about}</p>
            </div>
            <div className={styles.cardContent}>
                <div className={styles.infoGrid}>
                    <div className={styles.infoItem}>
                        <span className={styles.label}>Members</span>
                        <span className={styles.value}>{group.memberCount.toString()}</span>
                    </div>
                    <div className={styles.infoItem}>
                        <span className={styles.label}>Total Donations</span>
                        <span className={styles.value}>{group.totalDonations.toString()} CRED</span>
                    </div>
                    <div className={styles.infoItem}>
                        <span className={styles.label}>Treasury Balance</span>
                        <span className={styles.value}>{group.balance.toString()} CRED</span>
                    </div>
                    {group.allowDonations && (
                        <div className={styles.infoItem}>
                            <span className={styles.label}>Min Donation</span>
                            <span className={styles.value}>{group.minDonationAmount.toString()} CRED</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const GroupPage = () => {
    const { userAccount, peerSystemContracts } = useWeb3();
    const [priceToCreateGroup, setPriceToCreateGroup] = useState<string | null>(null);
    const [userGroups, setUserGroups] = useState<Group[]>([]);
    const [showCreateGroup, setShowCreateGroup] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const fetchUserGroups = async () => {
        if (!userAccount || !peerSystemContracts?.peerGroups) return;

        try {
            setIsLoading(true);
            const groupIds = await peerSystemContracts.peerGroups.methods
                .getUserGroupIds(userAccount.address)
                .call({ from: userAccount.address });
            console.log("Group Id's: ", groupIds);

            const groupPromises = groupIds.map(async (groupId: string) => {
                const groupInfo = await peerSystemContracts.peerGroups.methods
                    .getGroupInfo(groupId)
                    .call({ from: userAccount.address });
                console.log("Group Info: ", groupInfo);

                return {
                    id: groupId,
                    name: groupInfo.name,
                    about: groupInfo.about,
                    createdAt: groupInfo.createdAt,
                    creator: groupInfo.creator,
                    memberCount: groupInfo.memberCount,
                    isActive: groupInfo.isActive,
                    allowDonations: groupInfo.allowDonations,
                    minDonationAmount: groupInfo.minDonationAmount,
                    totalDonations: groupInfo.totalDonations,
                    balance: groupInfo.balance,
                    treasuryConfig: {
                        autoDistribute: groupInfo.treasuryConfig.autoDistribute,
                        adminShare: groupInfo.treasuryConfig.adminShare,
                        memberShare: groupInfo.treasuryConfig.memberShare,
                        minHoldPeriod: groupInfo.treasuryConfig.minHoldPeriod,
                        lastDistribution: groupInfo.treasuryConfig.lastDistribution
                    }
                };
            });

            const groups = await Promise.all(groupPromises);
            setUserGroups(groups);
        } catch (error) {
            console.error("Error fetching user groups:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const getCostToCreateGroup = async () => {
        if (!userAccount || !peerSystemContracts?.peerGroups) return;

        try {
            const response = await peerSystemContracts.peerGroups.methods
                .GROUP_CREATION_FEE()
                .call();
            setPriceToCreateGroup(response.toString());
        } catch (error) {
            console.error("Error fetching group creation fee:", error);
        }
    };

    useEffect(() => {
        getCostToCreateGroup();
        fetchUserGroups();
    }, [userAccount, peerSystemContracts]);

    if (!userAccount) {
        return (
            <div className={styles.container}>
                <p className="text-center text-gray-500">Please connect your wallet to view your groups</p>
            </div>
        );
    }

    return (
        <>
            {!showCreateGroup ? (
                <div className={styles.container}>
                    <div className={styles.header}>
                        <h1 className={styles.pageTitle}>My Groups</h1>
                        <button onClick={() => setShowCreateGroup(true)} className={styles.createButton}>
                            <Plus className={styles.buttonIcon} />
                            Create Group
                            <span className={styles.price}>
                                {priceToCreateGroup ? `${priceToCreateGroup} CRED` : ''}
                            </span>
                        </button>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center items-center h-32">
                            <p>Loading groups...</p>
                        </div>
                    ) : userGroups.length > 0 ? (
                        <div className={styles.groupGrid}>
                            {userGroups.map((group) => (
                                <GroupCard key={group.id} group={group} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 mt-8">
                            <p>You haven't joined any groups yet.</p>
                        </div>
                    )}
                </div>
            ) : (
                <CreateGroupPage
                    onBack={setShowCreateGroup}
                    userAccount={userAccount}
                    peerSystemContracts={peerSystemContracts}
                />
            )}
        </>
    );
};

export default GroupPage;