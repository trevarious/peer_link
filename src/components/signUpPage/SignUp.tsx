import { useWeb3 } from "../Web3/Web3"
import Loading from "../loading/Loading";
import styles from "./SignUp.module.css"

const SignUp = () => {
    const { userAccount, isLoading, peerLink, connectionStatus, credAddress } = useWeb3();



    return (
        <>
            {!connectionStatus && (
                <Loading />
            )}
            <div className={styles.container}>
                <div className={styles.accountContainer}>
                    <h3 className={styles.h1}>{userAccount && !isLoading ? "Connected" : "Offline"}</h3>
                    <p className={styles.p}>{userAccount && !isLoading ? userAccount.address : "No User Found"}</p>
                </div>
                <div>
                    <h3>cred</h3>
                    <p>{connectionStatus && credAddress ? credAddress : "offfline"}</p>

                </div>
            </div>

        </>
    )
}

export default SignUp;