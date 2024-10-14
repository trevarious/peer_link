; import { useState } from "react";
// import { usePeerLinkContext } from "../appContext/peerLinkContext/PeerLinkContext";
import { useWeb3 } from "../Web3/Web3";
import styles from "./SSignUp.module.css"
// import Web3 from "web3";
// const squareContainer = document.getElementById('squareContainer');
const SSignUp = () => {
    const [bioInput, setBioInput] = useState('');
    const [usernameInput, setUsernameInput] = useState('');
    const [walletAddressInput, setWalletAddressInput] = useState('');
    const { userAccount, peerLink } = useWeb3();
    // const { userStatus } = usePeerLinkContext();
    // const [doesAccountExist, setDoesAccountExist] = useState<any>(null);

    // const checkUserStatus = async () => {
    //     if (userAccount && peerLink) {
    //         const response = await peerLink.methods.checkAccountStatus(userAccount.address).call();
    //         setDoesAccountExist(response);
    //         console.log(response);

    //     }
    // }
    const handleTestMint = async () => {
        if (userAccount && peerLink) {
            try {
                const response = await peerLink.methods.mintUser(userAccount.address, "bob", "Trader").send({ from: userAccount.address });
                if (response) {
                    console.log("Successful");
                } else {
                    console.log("Unsuccessful");
                }


            } catch (err) {
                console.log("error in test mint funciton");
                console.log(err);
            }
        } else {
            console.log("Issues connecting to provider");
        }
    }


    const handleSubmit = async (e: any) => {
        if (userAccount) {
            e.preventDefault();

            if (usernameInput.length < 1 || bioInput.length < 1) {
                alert("You must fill out all fields.");
                return;
            }
            console.log("WalletAddressInput");
            console.log(walletAddressInput);
            console.log("UserAccount.Address");
            console.log(userAccount.address);
            if (walletAddressInput.toLowerCase() != userAccount.address.toLowerCase()) {
                alert("Address field does not match the connected acount");
                return;
            }
            if (userAccount && peerLink) {
                // ...existing validation...
                try {
                    await peerLink.methods.mintUser(userAccount.address, usernameInput.toString(), bioInput.toString()).send({ from: userAccount.address });
                } catch (err) {
                    console.log("errrrrr", err);
                }
            }
        }

    }

    const handleUsernameInputChange = (e: any) => {
        setUsernameInput(e.target.value);
    }
    const handleBioInputChange = (e: any) => {
        setBioInput(e.target.value);
    }
    const handleWalletAddressChange = (e: any) => {
        setWalletAddressInput(e.target.value);
    }
    // useEffect(() => {
    //     checkUserStatus();
    // }, [peerLink, userAccount]);

    return (
        <>
            <div className={styles.decorativeSquare1}></div>
            <div className={styles.decorativeSquare2}></div>
            <div className={styles.decorativeSquare3}></div>
            <div className={styles.decorativeSquare4}></div>
            <div className={styles.decorativeSquare5}></div>
            <div className={styles.decorativeSquare6}></div>
            <div className={styles.decorativeSquare7}></div>
            <div className={styles.decorativeSquare8}></div>
            <div className={styles.container}>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <fieldset className={styles.fieldSet}>
                        <legend className={styles.title}>Create Account</legend>
                        <label htmlFor="wallet-address" className={styles.label}>
                            Wallet Address:
                        </label>
                        <input
                            id="wallet-address"
                            name="wallet-address"
                            type="text"
                            value={walletAddressInput}
                            onChange={handleWalletAddressChange}
                            placeholder="0x"
                            className={styles.input}
                        />
                        {/* <p className={styles.helpText} id="usernameHelp">
                        Must match connect wallet address
                    </p> */}
                    </fieldset>

                    <fieldset className={styles.fieldSet}>
                        <legend >Create A Name</legend>
                        <label htmlFor="username" className={styles.label}>
                            Username:
                        </label>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            value={usernameInput}
                            onChange={handleUsernameInputChange}
                            placeholder="ex. Satoshi Buterin"
                            className={styles.input}
                        />
                        {/* <p className={styles.helpText} id="usernameHelp">
                        Choose a unique name
                    </p> */}
                    </fieldset>

                    <fieldset className={styles.fieldSet}>
                        <legend>About You</legend>
                        <label htmlFor="bio" className={styles.label}>
                            Bio:
                        </label>
                        <textarea
                            id="bio"
                            name="bio"
                            value={bioInput}
                            onChange={handleBioInputChange}
                            placeholder="Share your story"
                            className={styles.textarea}
                        ></textarea>
                        {/* <p className={styles.helpText} id="bioHelp">
                        Share a bit about yourself!
                    </p> */}
                    </fieldset>

                    <button type="submit" className={styles.button}>
                        Mint Your Profile
                    </button>
                </form>
                <button onClick={handleTestMint}>Test Mint Function</button>
            </div>
        </>
    )
}
export default SSignUp;