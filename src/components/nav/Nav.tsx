import React, { useRef, useState, useEffect } from "react";
import eth from '../../assets/eth.png';
import sepoliaEth from '../../assets/sepolia-eth.png';
import logo from "../../assets/logo.png";
import { contractAddress } from "../web3/contractAddress";
import { useAppContext } from "../app-context/AppContext";
import { useWeb3 } from '../web3/Web3';
import styles from "./Nav.module.css";
import { FaBars, FaTimes } from 'react-icons/fa'; // Add this import for the hamburger icons
import { Link } from 'react-router-dom';
import { BiArrowFromRight, BiArrowToRight } from "react-icons/bi";



const Nav: React.FC = () => {

    const { userAccount, initializeWeb3 } = useWeb3();
    const {
        lotteryState,
        roundStartTimestamp,
        lastDrawTimestamp,
        numberOfPlayers,
        jackpotAmount,
        intervalForDraw,
        // drawHistory,
        // withdrawContractBalance,
    } = useAppContext();
    const [isMenuOpenSmallScreen, setIsMenuOpenSmallScreens] = useState<boolean | null>(false); // State to manage menu visibility
    const [isMenuOpenLargeScreen, setIsMenuOpenLargeScreens] = useState<boolean | null>(false);

    const rightNavRef = useRef<HTMLDivElement>(null);

    const formatAddress = (address: string) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };
    const monthMapping: any = {
        'Jan': '1',
        'Feb': '2',
        'Mar': '3',
        'Apr': '4',
        'May': '5',
        'Jun': '6',
        'Jul': '7',
        'Aug': '8',
        'Sep': '9',
        'Oct': '10',
        'Nov': '11',
        'Dec': '12'
    };

    function formatTime(timestamp: any) {
        const date = new Date(timestamp * 1000);
        console.log("Interval for draw: ", parseInt(intervalForDraw));
        const dateOfDraw = new Date((timestamp + parseInt(intervalForDraw)) * 1000);
        const formattedDateTime: any = date.toTimeString().split(' ')[0].slice(0, 5);
        const formattedDateTimeForDraw: any = dateOfDraw.toTimeString().split(' ')[0].slice(0, 5);
        console.log("Formatted date time: ", formattedDateTime);
        console.log("Formatted date time with interval increase:", formattedDateTimeForDraw);
        const formattedMonth: any = date.toDateString().split(' ')[1];
        console.log("Formatted month: ", formattedMonth);
        const monthNumber = monthMapping[formattedMonth];
        const formatDay: any = date.toDateString().split(' ')[2];
        const formatYear: any = date.toDateString().split(' ')[3].slice(2, 4);
        const dateFormat = (`${monthNumber}/${formatDay}/${formatYear}`);
        const formattedTime = `${dateFormat} ${formattedDateTime}`

        console.log(formattedTime);
        return formattedTime;
    }
    const calculateTimeLeft = (timestamp: any) => {
        const now = Math.floor(Date.now() / 1000); // Current time in seconds
        const drawTime = timestamp + parseInt(intervalForDraw);
        const timeLeft = drawTime - now;

        if (timeLeft <= 0) return { hours: 0, minutes: 0, seconds: 0 };

        const hours = Math.floor(timeLeft / 3600);
        const minutes = Math.floor((timeLeft % 3600) / 60);
        const seconds = timeLeft % 60;

        return { hours, minutes, seconds };
    };
    // State to hold the remaining time
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(roundStartTimestamp));

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft(roundStartTimestamp));
        }, 1000);

        // Cleanup interval on component unmount
        return () => clearInterval(timer);
    }, [roundStartTimestamp, intervalForDraw]);


    const toggleMenuSmallScreen = () => setIsMenuOpenSmallScreens(prev => !prev);
    const toggleMenuLargeScreen = () => setIsMenuOpenLargeScreens(prev => !prev);


    return (
        <>
            <nav className={styles.nav}>
                <div className={styles.leftNav}>
                    {/* <button onClick={withdrawContractBalance}>eject</button> */}
                    <img className={`${styles.title} ${styles.link}`} src={logo}></img>
                    {!userAccount ? (
                        <button onClick={initializeWeb3} className={`${styles.connectButton}`}>
                            Connect Wallet
                        </button>
                    ) : (
                        <div className={styles.addressContainer}>
                            <a
                                className={styles.address}
                                href={`https://sepolia.etherscan.io/address/${contractAddress}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <span className={styles.truncatedAddress}>
                                    {formatAddress(contractAddress)}
                                </span>
                            </a>
                            <img src={sepoliaEth} alt="Sepolia ETH" className={styles.sepoliaImg} />
                        </div>
                    )}
                </div>
                <button className={styles.menuButtonSmallScreen} onClick={toggleMenuSmallScreen}>
                    {isMenuOpenSmallScreen ? <FaTimes size={22} /> : <FaBars size={22} />}
                </button>
                <button className={`${styles.menuButtonLargeScreen} ${isMenuOpenLargeScreen ? styles.show : ''}`} onClick={toggleMenuLargeScreen}>
                    {isMenuOpenLargeScreen ? <BiArrowToRight size={32} /> : <BiArrowFromRight size={32} />}
                </button>

                <div className={`${styles.rightNav} ${isMenuOpenLargeScreen ? styles.show : ''}`} ref={rightNavRef}>
                    <Link to="/">Home</Link>
                    <Link to="/Play">Play</Link>
                    <Link to="/instructions">Instructions</Link>
                    {/* <div className={`${styles.draw}`}>
                        <ul className={styles.previousDraw}>
                            Last Win:
                            {drawHistory && drawHistory[drawHistory.length - 1].map((number: any, index: any) => (
                                <>
                                    <li className={styles.previousWinningNumbers} key={index}>{` ${number}`}</li>
                                    <br></br>
                                </>
                            ))}
                        </ul>
                    </div> */}
                    <div className={`${styles.last}`}>
                        <div className={styles.rightNavItem}>
                            <div className={styles.numberOfPlayers}>
                                {numberOfPlayers !== null ? `Players: ${numberOfPlayers}` : 'Players: 0'}
                            </div>
                        </div>
                        <div className={styles.rightNavItem}>
                            <div className={styles.jackpot}>
                                {jackpotAmount ? `Jackpot: ${jackpotAmount}` : 'Offline'}
                            </div>
                            <img src={eth} className={styles.ethImg} alt="ETH" />
                        </div>
                    </div>
                    <div className={styles.last}>
                        <div className={`${styles.rightNavItem} ${styles.rightNavItemLeft}`}>
                            <span className={styles.lastText} >Lotto:</span>
                            <div className={`${styles.lotteryState} ${lotteryState == 0 ? styles.lotteryStateOpen : lotteryState === 1 ? styles.lotteryStateClosed : styles.lotteryStateCalculating}`}>
                                {lotteryState == 0 ? "open" : lotteryState == 1 ? "calculating" : 'closed'}
                            </div>
                        </div>
                        <div className={`${styles.rightNavItem} ${styles.rightNavItemRight}`}>
                            <span className={styles.lastText} >Draw in:</span>
                            <div className={styles.nextDrawTimestamp}>
                                {roundStartTimestamp == null ? (
                                    <div>
                                        {"Loading..."}
                                    </div>
                                ) : roundStartTimestamp == 0 ?
                                    <div>
                                        {"No entries"}
                                    </div>
                                    : <p>
                                        {String(timeLeft.hours).padStart(2, '0')}:
                                        {String(timeLeft.minutes).padStart(2, '0')}:
                                        {String(timeLeft.seconds).padStart(2, '0')}
                                    </p>}
                            </div>
                        </div>
                        <div className={`${styles.rightNavItem} ${styles.rightNavItemRight}`}>
                            <span className={styles.lastText} >Last Draw:</span>
                            <div className={styles.nextDrawTimestamp}>
                                {lastDrawTimestamp !== null ? (
                                    <div>
                                        {lastDrawTimestamp == 0 ? "Not initialized" : formatTime(lastDrawTimestamp)}
                                    </div>
                                ) : 'Loading...'}
                            </div>
                        </div>
                    </div>
                </div>
            </nav >
            <div className={`${styles.rightNavSmallScreen} ${isMenuOpenSmallScreen ? styles.show : ''}`}>
                <h1 className={styles.smallScreenTitle}>
                    STATS
                </h1>
                {/* <div className={styles.rightNavItem}>
                    <ul className={styles.previousDraw}>
                        Last Win:
                        {previousDraw && previousDraw.map((number: any, index: any) => (
                            <>
                                <li className={styles.previousWinningNumbers} key={index}>{` ${number}`}</li>
                                <br></br>
                            </>
                        ))}
                    </ul>
                </div> */}
                <div className={styles.rightNavItem}>
                    <div className={styles.numberOfPlayers}>
                        {numberOfPlayers !== null ? `Players: ${numberOfPlayers}` : 'Players: 0'}
                    </div>
                </div>
                <div className={styles.rightNavItem}>
                    <div className={styles.jackpot}>
                        {jackpotAmount ? `Jackpot: ${jackpotAmount}` : 'Offline'}
                    </div>
                    <img src={eth} className={styles.ethImg} alt="ETH" />
                </div>
                <div className={styles.last}>
                    <div className={`${styles.rightNavItem} ${styles.rightNavItemLeft}`}>
                        <span className={styles.lastText} >Lotto:</span>
                        <div className={`${styles.lotteryState} ${lotteryState == 0 ? styles.lotteryStateOpen : lotteryState === 1 ? styles.lotteryStateClosed : styles.lotteryStateCalculating}`}>
                            {lotteryState == 0 ? "open" : lotteryState == 1 ? "calculating" : 'closed'}
                        </div>
                    </div>
                    <div className={`${styles.rightNavItem} ${styles.rightNavItemRight}`}>
                        <span className={styles.lastText} >Draw in:</span>
                        <div className={styles.nextDrawTimestamp}>
                            {roundStartTimestamp == null ? (
                                <div>
                                    {"Loading..."}
                                </div>
                            ) : roundStartTimestamp == 0 ?
                                <div>
                                    {"No entries"}
                                </div>
                                : <p>
                                    {String(timeLeft.hours).padStart(2, '0')}:
                                    {String(timeLeft.minutes).padStart(2, '0')}:
                                    {String(timeLeft.seconds).padStart(2, '0')}
                                </p>}
                        </div>
                    </div>
                    <div className={`${styles.rightNavItem} ${styles.rightNavItemRight}`}>
                        <span className={styles.lastText} >Last Draw:</span>
                        <div className={styles.nextDrawTimestamp}>
                            {lastDrawTimestamp !== null ? (
                                <div>
                                    {lastDrawTimestamp == 0 ? "Not initialized" : formatTime(lastDrawTimestamp)}
                                </div>
                            ) : 'Loading...'}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Nav;
