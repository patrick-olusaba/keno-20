import {FC, useEffect, useState} from "react";

interface MultiplierDisplayProps {
    selectedNumbers: number[];
    revealedWinningNumbers: number[];
    resetMultiplier: boolean;
    payTable: Record<number, number[]>
}

const MultiplierDisplay: FC<MultiplierDisplayProps> = (
    {selectedNumbers, revealedWinningNumbers, resetMultiplier, payTable}
) => {
    const [currentMatchedCount, setCurrentMatchedCount] = useState(0);
    const multipliers = (selectedNumbers.length) > 0 && payTable[(selectedNumbers.length)] ? payTable[(selectedNumbers.length)] : [];

    useEffect(() => {
        if (resetMultiplier) {
            setCurrentMatchedCount(0);
        }
    }, [resetMultiplier]);

    useEffect(() => {


        if (revealedWinningNumbers.length > currentMatchedCount) {
            setTimeout(() => {
                setCurrentMatchedCount(revealedWinningNumbers.length);
            }, 500);
        }
    }, [revealedWinningNumbers, currentMatchedCount, payTable, selectedNumbers]);

    return (


        <div className="keno20-multiplier-display">
            <span>Multiplier Chances</span>

            {(selectedNumbers.length) === 0 ? (
                <span className="keno-no-selection">Select numbers to see multipliers</span>
            ) : (
                <div className="keno-multiplier-grid">
                    {multipliers.map((multiplier, index) => (
                        <div
                            key={index}
                            className={`keno-multiplier-box ${index === currentMatchedCount ? "highlight-multiplier pulse-glow" : "fade-in"}`}
                        >
                                <span className="keno-match-count">
                                    {index} <span className="keno-matches">Match{index !== 1 ? "es" : ""}</span>
                                </span>
                            <span className="keno-multiplier-value">{multiplier}x</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
        // </div>
    );
};

export default MultiplierDisplay;
