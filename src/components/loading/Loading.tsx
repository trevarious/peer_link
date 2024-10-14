import { useState, useEffect } from 'react';
import styles from './Loading.module.css';

const Loading = () => {
    const [currentColor, setCurrentColor] = useState({ r: 172, g: 244, b: 246 });

    useEffect(() => {
        const intervalId = setInterval(() => {
            const r = Math.floor(Math.random() * 256);
            const g = Math.floor(Math.random() * 256);
            const b = Math.floor(Math.random() * 256);
            setCurrentColor({ r, g, b });
        }, 10000);

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className={styles.container}>
            <div className={styles.ball}>
                <div
                    style={{ background: `rgb(${currentColor.r}, ${currentColor.g}, ${currentColor.b})` }}
                    className={styles.innerBall}
                />
            </div>
            <h1
                style={{ color: `rgb(${currentColor.r}, ${currentColor.g}, ${currentColor.b})` }}
                className={styles.h1}
            >
                No Internet Connection
            </h1>
        </div>
    );
}

export default Loading;