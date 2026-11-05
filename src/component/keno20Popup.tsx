import React, { useEffect, useState } from "react";
import CoinsEffect from "./CoinsEffect.tsx";

/* ============================================
   Keno20 — Premium Win/Lose Popup
   ============================================ */

interface KenoPopupProps {
    showPopup: boolean;
    winningNumbers: number[];
    payout: number;
}

interface ConfettiPiece {
    id: number;
    color: 'gold' | 'emerald' | 'diamond';
    tx: number;
    ty: number;
    rot: number;
    left: number;
    top: number;
    delay: number;
    size: number;
}

const KenoPopup: React.FC<KenoPopupProps> = ({ showPopup, winningNumbers, payout }) => {
    const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
    const isWin = payout > 0;

    useEffect(() => {
        if (!showPopup) return;

        if (isWin) {
            // Generate confetti burst
            const pieces: ConfettiPiece[] = Array.from({ length: 36 }, (_, i) => {
                const angle = (i / 36) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
                const distance = 80 + Math.random() * 160;
                const colors: ('gold' | 'emerald' | 'diamond')[] = ['gold', 'emerald', 'diamond'];
                return {
                    id: i,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    tx: Math.cos(angle) * distance,
                    ty: Math.sin(angle) * distance - 40,
                    rot: (Math.random() - 0.5) * 720,
                    left: 50 + (Math.random() - 0.5) * 10,
                    top: 50 + (Math.random() - 0.5) * 10,
                    delay: Math.random() * 0.15,
                    size: 5 + Math.random() * 8,
                };
            });
            setConfetti(pieces);
        }

        return () => setConfetti([]);
    }, [showPopup, isWin]);

    if (!showPopup) return null;

    return (
        <div className="keno20-popup-overlay">
            {isWin && <CoinsEffect />}

            {/* Confetti burst */}
            {confetti.map((piece) => (
                <div
                    key={piece.id}
                    className={`confetti-piece ${piece.color}`}
                    style={{
                        left: `${piece.left}%`,
                        top: `${piece.top}%`,
                        width: `${piece.size}px`,
                        height: `${piece.size * 1.4}px`,
                        '--tx': `${piece.tx}px`,
                        '--ty': `${piece.ty}px`,
                        '--rot': `${piece.rot}deg`,
                        animationDelay: `${piece.delay}s`,
                    } as React.CSSProperties}
                />
            ))}

            <div className={`keno20-popup-content ${isWin ? 'win' : 'lose'}`}>
                <div className="keno20-popup-header">
                    {isWin ? (
                        <h3 className="win-title">🎉 Congratulations 🎉</h3>
                    ) : (
                        <h3 className="lose-title">Better Luck Next Time</h3>
                    )}
                </div>

                <div className="keno20-popup-body">
                    {isWin && winningNumbers.length > 0 && (
                        <>
                            <span className="keno20-highlight">Matching Numbers</span>
                            <div className="keno20-winning-pills">
                                {winningNumbers.map((num, i) => (
                                    <div key={i} className="keno20-number-pill">
                                        {num}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    <span className="keno20-highlight">Amount Won</span>
                    <div className="keno20-payout-display">
                        <span className="currency">Ksh</span>
                        {payout.toFixed(2)}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KenoPopup;
