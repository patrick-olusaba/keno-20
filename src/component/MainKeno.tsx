import {useEffect, useState} from "react";
import MultiplierDisplay from "./MultiplierDisplay";
import Keno20BetControl from "./Keno20BetControls";
import {useSound} from "../Util/useSound.ts";
import {getPayout, payoutTable} from "../Util/payout.ts";
import {NormalizedHistory} from "../Util/wsTypes.ts";
import Keno20History from "./Keno20History.tsx";
import {CanvasNumberGrid} from "./CanvasNumberGrid.tsx";
import Keno20Popup from "./keno20Popup.tsx";
import {TopBar} from "./TopBar.tsx";

const DEMO_BALANCE = 10000;
const DRAW_COUNT = 10;
const MAX_NUMBER = 20;

export const MainKeno = () => {
    const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
    const [betAmount, setBetAmount] = useState<number>(20);
    const [drawnNumbers, setDrawnNumbers] = useState<number[]>([]);
    const [winningNumbers, setWinningNumbers] = useState<number[]>([]);
    const [payout, setPayout] = useState<number>(0);
    const [showPopup, setShowPopup] = useState<boolean>(false);
    const [isDrawing, setIsDrawing] = useState(false);
    const [revealedNumbers, setRevealedNumbers] = useState<number[]>([]);
    const [revealedWinningNumbers, setRevealedWinningNumbers] = useState<number[]>([]);
    const [payTable] = useState<Record<number, number[]>>(payoutTable);
    const [resetMultiplier, setResetMultiplier] = useState(false);
    const [balance, setBalance] = useState<number>(DEMO_BALANCE);
    const [history, setHistory] = useState<NormalizedHistory[]>([]);

    const [isMuted, setIsMuted] = useState(false);

    const {playSound} = useSound(isMuted, true);

    const handleToggleMute = () => {
        setIsMuted(prev => !prev);
        if (isMuted) {
            playSound("click")
        }
    };

    const generateRandomNumbers = (count: number, max: number): number[] => {
        const numbers = new Set<number>();
        while (numbers.size < count) {
            numbers.add(Math.floor(Math.random() * max) + 1);
        }
        return Array.from(numbers);
    };

    /* === Auto-hide popup === */
    useEffect(() => {
        if (showPopup) {
            const timer = setTimeout(() => {
                setShowPopup(false);
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [showPopup]);

    const handleClear = () => {
        if (isDrawing) return;
        setSelectedNumbers([]);
        setDrawnNumbers([]);
        setWinningNumbers([]);
        setRevealedNumbers([]);
        setRevealedWinningNumbers([]);
        setResetMultiplier(true);
        playSound("clear");
    };

    const autoPickNumbers = () => {
        if (isDrawing) return;
        setSelectedNumbers([]);
        setDrawnNumbers([]);
        setRevealedNumbers([]);
        setRevealedWinningNumbers([]);
        setResetMultiplier(true);

        const numbers = generateRandomNumbers(7, MAX_NUMBER);

        numbers.forEach((number, index) => {
            setTimeout(() => {
                setSelectedNumbers((prev) => [...prev, number]);
                playSound("click");

                if (index === numbers.length - 1) {
                    setTimeout(() => {
                        setResetMultiplier(false);
                    }, 100);
                }
            }, index * 400);
        });
    };

    const handleBet = () => {
        if (isDrawing || selectedNumbers.length === 0 || betAmount > balance) return;

        // Deduct bet
        setBalance(prev => prev - betAmount);
        setIsDrawing(true);
        playSound("bet");

        setRevealedNumbers([]);
        setRevealedWinningNumbers([]);

        // Generate local draw
        const drawn = generateRandomNumbers(DRAW_COUNT, MAX_NUMBER);

        // Calculate matches
        const matched = selectedNumbers.filter(n => drawn.includes(n));
        const numSelected = selectedNumbers.length;
        const numMatched = matched.length;

        // Calculate winnings using payout table
        const winAmount = getPayout(numSelected, numMatched, betAmount);

        // Trigger draw animation sequence (staggered reveal)
        setTimeout(() => {
            setDrawnNumbers(drawn);
        }, 200);

        setWinningNumbers(matched);
        setPayout(winAmount);

        drawn.forEach((number, index) => {
            setTimeout(() => {
                setRevealedNumbers((prev) => [...prev, number]);
                playSound("draw");

                if (matched.includes(number)) {
                    setRevealedWinningNumbers((prev) => [...prev, number]);
                    playSound("match");
                }

                if (index === drawn.length - 1) {
                    setTimeout(() => {
                        // Add winnings
                        setBalance(prev => prev + winAmount);

                        // Push to history
                        setHistory(prev => [{
                            MatchedNumbers: `${numMatched}/${numSelected}`,
                            multiplier: numMatched > 0
                                ? (payoutTable[numSelected]?.[numMatched] ?? 0)
                                : 0,
                            win: winAmount,
                        }, ...prev].slice(0, 50)); // keep last 50 entries

                        if (winAmount > 0) {
                            playSound("win");
                            setShowPopup(true);
                        } else {
                            playSound("lose");
                        }
                        setIsDrawing(false);
                    }, 500);
                }
            }, index * 400);
        });
    };

    return (
        <div className="keno20-game-container">
            <TopBar
                balance={balance}
                isMuted={isMuted}
                onToggleMute={handleToggleMute}
            />
            <div className="keno20-game-area">
                <div className="keno20-grid-canvas-container">
                    <CanvasNumberGrid
                        selectedNumbers={selectedNumbers}
                        revealedNumbers={revealedNumbers}
                        onSelectedNumber={setSelectedNumbers}
                        drawnNumbers={drawnNumbers}
                    />

                    <MultiplierDisplay
                        selectedNumbers={selectedNumbers}
                        revealedWinningNumbers={revealedWinningNumbers}
                        resetMultiplier={resetMultiplier}
                        payTable={payTable}
                    />
                </div>
                <div className='game-hist-controls'>
                    <Keno20BetControl
                        betAmount={betAmount}
                        setBetAmount={setBetAmount}
                        handleBet={handleBet}
                        selectedNumbers={selectedNumbers}
                        isDrawing={isDrawing}
                        autoPickNumbers={autoPickNumbers}
                        handleClear={handleClear}
                        balance={balance}
                    />

                    <Keno20History history={history} />
                </div>

                <Keno20Popup
                    showPopup={showPopup}
                    winningNumbers={winningNumbers}
                    payout={payout}
                />
            </div>
        </div>
    );
};
