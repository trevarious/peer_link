import { useEffect, useState } from "react";
import SSignUp from "../actualSignUp/SSignUp";
import HomePage from "../homePage/HomePage";
import { useWeb3 } from "../Web3/Web3";
const Dashboard = () => {
    const [hasAccount, setHasAccount] = useState<any>(null);
    const { userAccount, peerLink } = useWeb3();

    const checkUserStatus = async () => {
        if (userAccount && peerLink) {
            const response = await peerLink.methods.checkAccountStatus(userAccount.address).call();
            setHasAccount(response);
            console.log("Response from checkUserStatus(): ", response);

        }
    }
    useEffect(() => {
        checkUserStatus();
    }, [peerLink, userAccount])
    return (
        <>
            {hasAccount == null ? <HomePage /> : hasAccount == false ? <SSignUp /> : hasAccount == true ? <HomePage /> : "Not Connected"}

        </>
    )
}

export default Dashboard;