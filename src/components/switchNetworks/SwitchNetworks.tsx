import styles from "./SwitchNetworks.module.css";
import { useWeb3 } from '../../components/Web3/Web3';

const SwitchNetworks: React.FC<{ chainId: string }> = ({ chainId }) => {
    const { reinitWeb3 } = useWeb3();

    const Networks: { [key: string]: string } = {
        "0x1": "Ethereum Mainnet",
        "0xe708": "Linea Mainnet",
        "0x13882": "Polygon Amoy Testnet",
        "0xa4b1": "Arbitrum One",
        "0x66eee": "Arbitrum Sepolia Testnet",
        "0xaa36a7": "Sepolia Testnet",
        "0xe705": "Linea Testnet"
    };

    const handleChainDisplay = () => {
        return Networks[chainId] || "Unknown Network, You May need to switch to a Web3 browser";
    };

    const switchToArbitrumSepolia = async () => {
        const ARBITRUM_SEPOLIA_CHAIN_ID = '0x66eee';
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: ARBITRUM_SEPOLIA_CHAIN_ID }],
            });
            await reinitWeb3(ARBITRUM_SEPOLIA_CHAIN_ID);
        } catch (error) {
            console.error('Failed to switch network:', error);
            // Handle errors (e.g., notify user)
        }
    };

    return (
        <div className={styles.container}>
            <section className={styles.alertSection}>
                <h1 className={styles.title}>Network Mismatch</h1>
                <h3 className={styles.subTitle}>Current Network:</h3>
                <p className={styles.text}>{handleChainDisplay()}</p>
            </section>
            <section className={styles.netWorkChangeSection}>
                <h1 className={styles.title}>Please Switch to Arbitrum Sepolia</h1>
                <button
                    className={styles.switchButton}
                    onClick={switchToArbitrumSepolia}
                >
                    SWITCH NOW
                </button>
            </section>
        </div>
    );
};

export default SwitchNetworks;
