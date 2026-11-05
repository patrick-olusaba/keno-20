import React, { useEffect, useState } from "react";

/* ============================================
   Keno20 — Enhanced Coins Effect
   ============================================ */

interface Coin {
    id: number;
    left: number;
    duration: number;
    delay: number;
    size: number;
    type: 'gold' | 'emerald';
    wobble: number;
}

const COIN_COUNT = 40;

const CoinsEffect: React.FC = () => {
    const [coins, setCoins] = useState<Coin[]>([]);

    useEffect(() => {
        const generateCoins = () => {
            const newCoins: Coin[] = Array.from({ length: COIN_COUNT }, (_, index) => ({
                id: Date.now() + index,
                left: Math.random() * 100,
                duration: 2.5 + Math.random() * 3,
                delay: Math.random() * 1.5,
                size: 20 + Math.random() * 16,
                type: Math.random() > 0.4 ? 'gold' as const : 'emerald' as const,
                wobble: (Math.random() - 0.5) * 80,
            }));
            setCoins(newCoins);
        };

        generateCoins();
        const interval = setInterval(generateCoins, 3500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="coins-container">
            {coins.map((coin) => (
                <div
                    key={coin.id}
                    className={`coin ${coin.type === 'emerald' ? 'emerald-coin' : ''}`}
                    style={{
                        left: `${coin.left}%`,
                        width: `${coin.size}px`,
                        height: `${coin.size}px`,
                        animationDuration: `${coin.duration}s`,
                        animationDelay: `${coin.delay}s`,
                        '--wobble': `${coin.wobble}px`,
                    } as React.CSSProperties}
                />
            ))}
        </div>
    );
};

export default CoinsEffect;
