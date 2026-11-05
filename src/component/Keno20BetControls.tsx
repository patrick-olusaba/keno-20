import React, {} from "react";

interface Keno20BetControlsProps {
    betAmount: number,
    setBetAmount: (amount: number) => void,
    handleBet: () => void,
    selectedNumbers: number[],
    isDrawing: boolean,
    autoPickNumbers: () => void,
    handleClear?: () => void,
    balance: number,
}

const Keno20BetControl: React.FC<Keno20BetControlsProps> = (
    {
        betAmount,
        setBetAmount,
        handleBet,
        selectedNumbers,
        isDrawing,
        autoPickNumbers,
        handleClear,
        balance,
    }) => {

    return (
        <div className="keno20-controls-main-container">
            <span className="keno20-bet-title">Bet amount</span>
            <div className="keno20-controls-shortcuts-container">

                <div className="keno20-controls-shortcuts">
                    {[20, 50, 100, 500, 1000].map((value, index) => (
                        <div
                            className={`keno20-controls-shortcuts-btn ${betAmount === value ? "keno20-shortcuts-select" : ""}`}
                            key={index}
                            onClick={() => setBetAmount(value)}
                        >
                            {value}
                        </div>
                    ))}
                </div>

                <div className="keno20-controls-input-container">
                    <div
                        className="keno20-controls-plus-minus"
                        onClick={() => setBetAmount(Math.max(betAmount - 10, 20))}
                    >
                        -
                    </div>
                    <input
                        className="keno20-controls-input"
                        type="text"
                        value={betAmount}
                        onChange={(e) => setBetAmount(parseInt(e.target.value, 10) || 0)}
                    />
                    <div
                        className="keno20-controls-plus-minus"
                        onClick={() => setBetAmount(Math.min(betAmount + 10, balance))}
                    >
                        +
                    </div>
                </div>
            </div>

<div className="keno20-controls-btn">

    <div className="keno20-controls-btn-container">

        <div className="clear-button" onClick={handleClear}
             style={{opacity: isDrawing ? 0.7 : 1}}>
            Clear
        </div>

        <div
            className={`auto-picker-button ${isDrawing ? 'disabled' : ''}`}
            onClick={() => {
                if (isDrawing) return;
                autoPickNumbers();
            }}
        >
            Auto Pick
        </div>
    </div>


</div>

            <div
                className={`keno-bet-button ${betAmount === 0 || selectedNumbers.length === 0 || isDrawing || betAmount > balance ? 'disabled' : ''}`}
                onClick={() => {
                    if (betAmount === 0 || selectedNumbers.length === 0 || isDrawing || betAmount > balance) return;
                    handleBet();
                }}
            >
                Bet
            </div>
        </div>
    );
};

export default Keno20BetControl;
