import React, { createContext, useState, ReactNode, useEffect, useCallback, useMemo } from 'react';
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
    cred: any;
    peerLink: any;
    peerChat: any;
    peerGroup: any;
    peerFlexNFT: any;
    peerRewards: any
    credAddress: string | null;
    credInfo: any;
    userAccountStatus: any;
    peerSystemContracts: any;
    chainId: any;
    reinitWeb3: (chain: string) => any;
}

const Web3Context = createContext<Web3ContextProps | undefined>(undefined);

export const Web3Provider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [chainId, setChainId] = useState<string | null>(null);
    const [userAccount, setUserAccount] = useState<UserAccountState | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [web3, setWeb3] = useState<Web3 | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [connectionStatus, setConnectionStatus] = useState<boolean>(false);
    const [credAddress, setCredAddress] = useState<string | null>(null);
    const [userAccountStatus, setUserAccountStatus] = useState<any>(null);
    const [credInfo, setCredInfo] = useState<any>({});
    const [peerSystemContracts, setPeerSystemContracts] = useState<any>({});

    const initializeContracts = useCallback(async (web3Instance: Web3, chainId: string) => {
        if (chainId === ARBITRUM_SEPOLIA_CHAIN_ID) {
            try {
                const contracts = {
                    peerLink: new web3Instance.eth.Contract(peerSystemAbi.peerLinkAbi, peerSystemAddress.peerLinkAddress),
                    cred: new web3Instance.eth.Contract(peerSystemAbi.credAbi, peerSystemAddress.credAddress),
                    peerChat: new web3Instance.eth.Contract(peerSystemAbi.peerChatAbi, peerSystemAddress.peerChatAddress),
                    peerGroups: new web3Instance.eth.Contract(peerSystemAbi.peerGroupAbi, peerSystemAddress.peerGroupAddress),
                    peerRewards: new web3Instance.eth.Contract(peerSystemAbi.peerRewardsAbi, peerSystemAddress.peerRewardsAddress),
                    peerFlexNFTs: new web3Instance.eth.Contract(peerSystemAbi.peerFlexNFTAbi, peerSystemAddress.peerFlexNFTAddress),
                };

                // Await all contract creations
                await Promise.all(Object.values(contracts));
                console.log("Contracts Initialized");

                setPeerSystemContracts(contracts);
            } catch (error) {
                console.error("Error initializing contracts:", error);
                setPeerSystemContracts({});
            }
        } else {
            setPeerSystemContracts({});
        }
    }, []);

    const initWeb3 = useCallback(async () => {
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
                console.log("ChainId Set: ", chainId);
                setChainId(chainId);
                initializeContracts(web3Instance, chainId);
            } else {
                setError('Ethereum provider not found. Please install MetaMask.');
            }
        } catch (err: any) {
            setError(`Error: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [initializeContracts]);
    const reinitWeb3 = useCallback(async (_chainid: string) => {
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
                console.log("ChainId Set: ", chainId);
                setChainId(chainId);
                initializeContracts(web3Instance, chainId);
            } else {
                setError('Ethereum provider not found. Please install MetaMask.');
            }
        } catch (err: any) {
            setError(`Error: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [initializeContracts]);

    const handleAccountChange = useCallback(async (accounts: string[]) => {
        if (accounts.length > 0) {
            setUserAccount({ address: accounts[0] });
        } else {
            setUserAccount(null);
            setPeerSystemContracts({});
        }
    }, [initializeContracts]);

    const handleChainChange = useCallback((newChainId: string) => {
        console.log("ChainId Changed. New ChainId: ", newChainId);
        setChainId(newChainId);
        if (web3) {
            initializeContracts(web3, newChainId);
        }
    }, [initializeContracts, handleAccountChange,]);

    useEffect(() => {
        initWeb3();

        if (window.ethereum) {
            window.ethereum.on('accountsChanged', handleAccountChange);
            window.ethereum.on('chainChanged', handleChainChange);

            return () => {
                window.ethereum.removeListener('accountsChanged', handleAccountChange);
                window.ethereum.removeListener('chainChanged', handleChainChange);
            };
        }
    }, [initWeb3, handleAccountChange, handleChainChange]);

    const getCredInfo = useCallback(async () => {
        if (peerSystemContracts.cred && !isLoading && userAccount) {
            try {
                const [name, symbol, totalSupply, _userAccountStatus] = await Promise.all([
                    peerSystemContracts.cred.methods.name().call(),
                    peerSystemContracts.cred.methods.symbol().call(),
                    peerSystemContracts.cred.methods.totalSupply().call(),
                    peerSystemContracts.peerLink.methods.checkAccountStatus(userAccount.address).call()
                ]);
                setCredInfo({ name, symbol, totalSupply: totalSupply.toString() });
                setUserAccountStatus(_userAccountStatus);
            } catch (error) {
                console.error("Error fetching cred info:", error);
                setError("Failed to fetch cred information");
            }
        }
    }, [peerSystemContracts, isLoading, userAccount]);

    const getCredAddress = useCallback(async () => {
        if (peerSystemContracts.peerLink && !isLoading && userAccount) {
            try {
                const credAddress = await peerSystemContracts.peerLink.methods.credAddress().call();
                if (credAddress) {
                    setConnectionStatus(true);
                    setCredAddress(credAddress);
                }
            } catch (error) {
                console.error("Error fetching cred address:", error);
                setConnectionStatus(false);
            }
        } else {
            setConnectionStatus(false);
        }
    }, [peerSystemContracts, isLoading, userAccount]);

    useEffect(() => {
        getCredAddress();
        getCredInfo();
    }, [getCredAddress, getCredInfo]);

    const value = useMemo(() => ({
        userAccount,
        error,
        connectionStatus,
        isLoading,
        web3,
        peerLink: peerSystemContracts.peerLink,
        credAddress,
        credInfo,
        userAccountStatus,
        peerSystemContracts,
        chainId,
        reinitWeb3
    }), [userAccount, error, connectionStatus, isLoading, web3, peerSystemContracts, credAddress, credInfo, userAccountStatus, chainId]);

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