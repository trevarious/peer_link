import React from 'react';
import { useWeb3 } from "../Web3/Web3";
import styles from "./CredBalance.module.css";

const CredBalance = () => {
    const { credInfo, isLoading, error } = useWeb3();

    if (isLoading) {
        return <div className={styles.container}>Loading cred info...</div>;
    }

    if (error) {
        return <div className={styles.container}>Error: {error}</div>;
    }

    return (
        <div className={styles.container}>
            <h1>Cred Info</h1>
            {credInfo ? (
                <>
                    <h2>Name: {credInfo.name}</h2>
                    <h2>Symbol: {credInfo.symbol}</h2>
                    <h2>Total Supply: {credInfo.totalSupply}</h2>
                </>
            ) : (
                <p>No cred information available</p>
            )}
        </div>
    );
};

export default CredBalance;