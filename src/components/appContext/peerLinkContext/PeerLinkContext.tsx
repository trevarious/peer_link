// src/contexts/PeerLinkContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useWeb3 } from '../../Web3/Web3';

// interface BioType {
//     name: string;
//     aboutMe: string;
// }
// interface DepositsType {
//     tokenDeposits: string[]; //tokenDepositAddresses
//     polDeposits: number | bigint;
// }

// interface UserInfoType {
//     info: BioType;
//     friendCount: number | null;
//     reputation: number | null;
//     friends: string[]; // friends addresses
//     flexNFTs: number[] | null;
//     deposits: DepositsType;


// }

// interface RequestInfoType {
//     requesterAddress: string | null;
//     requesterName: string | null;
//     timestamp: string | number | bigint | null;
// }
interface PeerLinkContextType {
    userStatus: any;
    // userInfo: UserInfoType;
    // requests: RequestInfoType;
    peerLink: any;
    // checkAccountStatus: (userAddress: any) => boolean;
    mintUser: (userAddress: any, username: any, aboutMe: any) => Promise<void>;
    // getUserInfo: () => any;
    // tokenURI: () => any;
    // polBalance: () => any;
    // credBalance: () => any;
    // credAddress: () => any;
    // tokenBalances: () => any;
    // sendFriendRequest: (toAddress: any) => void;
    // isRequestSent: (toAddress: any) => boolean;
    // handleFriendRequest: (fromAddress: any, decision: any) => void;
    // isFriend: (fromAddress: any, toAddress: any) => boolean;
    // getIncomingRequests: () => any;
    // getFriends: () => any; // Returns friends addresses array
    // getFriendsInfo: () => any; // Returns two arrays, first their addresses, similar to previouos function, second is their bio: name and aboutme
    // updateName: () => void;
    // updateBio: () => void;
    // depositPol: () => void
    // withdrawPol: (amount: any) => void;
    // depositToken: (tokenAddress: any, tokenAmount: any) => void;
    // withdrawToken: (tokenAddress: any, tokenAmount: any) => void;
    // sendToken: (tokenAddress: any, toAddress: any, amount: any) => void;
    // removeToken: (tokenAddress: any) => void;
    // increaseReputation: () => void;
    // getNFT: (userAddress: any) => any;
}


const PeerLinkContext = createContext<PeerLinkContextType | undefined>(undefined);

export const PeerLinkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { userAccount, peerLink, web3 } = useWeb3();
    const [userStatus, setUserStatus] = useState<any>(false);
    // const [userInfo, setUserInfo] = useState<any>(null);
    // const [requests, setRequests] = useState<any>(null);
    const checkUserStatus = async () => {
        if (peerLink && web3 && userAccount) {
            try {
                const response = await peerLink.methods.checkAccountStatus(userAccount.address).call();
                setUserStatus(response);
                console.log(`This user ${response == true ? "Does " : "Does Not "}exist.`);

            } catch (err) {
                if (err) {
                    alert(err);
                }
            }
        }
    }
    useEffect(() => { checkUserStatus() }, []);
    const mintUser = async (userAddress: any, username: any, aboutMe: any) => {
        if (peerLink && userAccount && web3) {
            await peerLink.methods.mintUser(userAddress, username, aboutMe).send({ from: userAccount.address });
            console.log("sent");
        }

    }





    return (
        <PeerLinkContext.Provider value={{
            userStatus,
            // userInfo,
            // requests,
            peerLink,
            mintUser

        }}>
            {children}
        </PeerLinkContext.Provider>
    );
};

export const usePeerLinkContext = () => {
    const context = useContext(PeerLinkContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};