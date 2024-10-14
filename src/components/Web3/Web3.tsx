import React, { createContext, useState, ReactNode, useEffect } from 'react';
import peerSystemAbi from './peerLinkSystem/peerSystemAbi';
import peerSystemAddress from './peerLinkSystem/peerSystemAddress';
import Web3 from 'web3';

const ARBITRUM_SEPOLIA_CHAIN_ID = '0x66eee';

interface UserAccountState {
    address: string;
}

interface Web3ContextProps {
    userAccount: UserAccountState | null;
    error: string | null;
    connectionStatus: boolean;
    isLoading: boolean;
    web3: Web3 | null;
    peerLink: any;
    credAddress: string | null;
    credInfo: any;
    userAccountStatus: any;
    peerSystemContracts: any;
}

const Web3Context = createContext<Web3ContextProps | undefined>(undefined);

export const Web3Provider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [userAccount, setUserAccount] = useState<UserAccountState | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [web3, setWeb3] = useState<Web3 | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [connectionStatus, setConnectionStatus] = useState<boolean>(false);
    const [credAddress, setCredAddress] = useState<string | null>(null);
    const [userAccountStatus, setUserAccountStatus] = useState<any>(null);
    const [credInfo, setCredInfo] = useState<any>({});
    const [peerLink, setPeerLink] = useState<any>(null);
    const [cred, setCred] = useState<any>(null);
    const [peerSystemContracts, setPeerSystemContracts] = useState<any>({});

    useEffect(() => {
        const initWeb3 = async () => {
            setIsLoading(true);
            try {
                if (window.ethereum) {
                    const web3Instance = new Web3(window.ethereum);
                    setWeb3(web3Instance);
                    await window.ethereum.request({ method: 'eth_requestAccounts' });
                    const accounts = await web3Instance.eth.getAccounts();
                    if (accounts.length > 0) {
                        setUserAccount({ address: accounts[0] });
                    }
                    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
                    if (chainId !== ARBITRUM_SEPOLIA_CHAIN_ID) {
                        alert("Wrong Network, Please switch to Arbitrum Sepolia Chain!");
                    } else {
                        const contracts = {
                            peerLink: new web3Instance.eth.Contract(peerSystemAbi.peerLinkAbi, peerSystemAddress.peerLinkAddress),
                            cred: new web3Instance.eth.Contract(peerSystemAbi.credAbi, peerSystemAddress.credAddress),
                            peerChat: new web3Instance.eth.Contract(peerSystemAbi.peerChatAbi, peerSystemAddress.peerChatAddress),
                            peerGroups: new web3Instance.eth.Contract(peerSystemAbi.peerGroupAbi, peerSystemAddress.peerGroupAddress),
                            peerRewards: new web3Instance.eth.Contract(peerSystemAbi.peerRewardsAbi, peerSystemAddress.peerRewardsAddress),
                            peerFlexNFTs: new web3Instance.eth.Contract(peerSystemAbi.peerFlexNFTAbi, peerSystemAddress.peerFlexNFTAddress),
                        };
                        setPeerLink(contracts.peerLink);
                        setCred(contracts.cred);
                        setPeerSystemContracts(contracts);
                    }
                } else {
                    setError('Ethereum provider not found. Please install MetaMask.');
                }
            } catch (err: any) {
                setError(`Error: ${err.message}`);
            } finally {
                setIsLoading(false);
            }
        };

        initWeb3();
    }, []);

    const initializeAllContracts = async () => {
        if (cred && peerLink && userAccount) {
            try {
                // await peerSystemContracts.peerGroups.methods.initialize(peerSystemContracts.peerLink.options.address, peerSystemContracts.cred.options.address).send({ from: userAccount.address });
                // await peerSystemContracts.peerChat.methods.initialize(peerSystemContracts.peerLink.options.address, peerSystemContracts.cred.options.address).send({ from: userAccount.address });
                // await peerLink.methods.setCred(peerSystemContracts.cred.options.address).send({ from: userAccount.address });
                // await peerLink.methods.setNFTAddress(peerSystemContracts.peerFlexNFTs.options.address).send({ from: userAccount.address });
                // await peerSystemContracts.peerRewards.methods.initialize(peerSystemContracts.peerLink.options.address, peerSystemContracts.cred.options.address).send({ from: userAccount.address });

            } catch (err) {
                console.log(err);
            }
        }
    };

    const getCredInfo = async () => {
        if (cred && !isLoading && userAccount) {
            try {
                const [name, symbol, totalSupply, _userAccountStatus] = await Promise.all([
                    cred.methods.name().call(),
                    cred.methods.symbol().call(),
                    cred.methods.totalSupply().call(),
                    peerLink.methods.checkAccountStatus(userAccount.address)
                ]);
                setCredInfo({ name, symbol, totalSupply: totalSupply.toString() });
                setUserAccountStatus(_userAccountStatus);
            } catch (error) {
                console.error("Error fetching cred info:", error);
                setError("Failed to fetch cred information");
            }
        }
    };

    const getCredAddress = async () => {
        if (peerLink && !isLoading && userAccount) {
            const credAddress = await peerLink.methods.credAddress().call();
            if (credAddress) {
                setConnectionStatus(true);
                setCredAddress(credAddress);
                return credAddress;
            }
        } else {
            setConnectionStatus(false);
        }
    };

    useEffect(() => {
        getCredAddress();
        getCredInfo();
        initializeAllContracts();
    }, [peerLink, cred, userAccount]);

    const value = {
        userAccount,
        error,
        connectionStatus,
        isLoading,
        web3,
        peerLink,
        credAddress,
        credInfo,
        userAccountStatus,
        peerSystemContracts
    };

    return (
        <Web3Context.Provider value={value}>
            {children}
        </Web3Context.Provider>
    );
};

export const useWeb3 = () => {
    const context = React.useContext(Web3Context);
    if (context === undefined) {
        throw new Error('useWeb3 must be used within a Web3Provider');
    }
    return context;
};
