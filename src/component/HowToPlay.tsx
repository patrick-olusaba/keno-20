import React from 'react';
import { payoutTable } from '../Util/payout.ts';

/* ============================================
   Keno20 — How To Play / Payout Table Modal
   ============================================ */

interface HowToPlayModalProps {
    onClose: () => void;
    mode: 'howto' | 'payout';
}

const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose, mode }) => {
    const isPayout = mode === 'payout';

    return (
        <div className="modal">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>{isPayout ? 'Payout Table' : 'How to Play'}</h2>
                    <button className="close-btn" onClick={onClose}>✖</button>
                </div>

                {!isPayout && (
                    <ul className="how-to-list">
                        <li><strong>Select Your Numbers</strong>: Choose 1 to 7 numbers from the grid (1 to 20).</li>
                        <li><strong>Set Your Bet</strong>: Use quick select or type your stake. Minimum bet is 20.</li>
                        <li><strong>Place Your Bet</strong>: Click the "Bet" button to lock in your bet. The game will draw 10 numbers.</li>
                        <li><strong>Win by Matching</strong>: Match numbers to win! Winnings use multipliers based on how many numbers you picked + matched.</li>
                        <li><strong>History</strong>: See past games, matches, multipliers, and total wins.</li>
                        <li><strong>Tips</strong>: More numbers = higher multipliers but lower odds. Fewer numbers = lower multipliers but higher odds.</li>
                    </ul>
                )}

                {!isPayout && <h3>Example Payouts</h3>}

                <table className="payout-table">
                    <thead>
                    <tr>
                        <th>Picks</th>
                        {Array.from({ length: 8 }, (_, i) => (
                            <th key={i}>{i}M</th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {Object.entries(payoutTable)
                        .filter(([picks]) => parseInt(picks) <= 7)
                        .map(([picks, multipliers]) => (
                        <tr key={picks}>
                            <td style={{ fontWeight: 700, color: 'var(--text-gold)' }}>{picks}</td>
                            {Array.from({ length: 8 }, (_, idx) => (
                                <td key={idx} style={multipliers[idx] > 0 ? { color: 'var(--text-emerald)', fontWeight: 600 } : { color: 'var(--text-muted)' }}>
                                    {multipliers[idx] > 0 ? `${multipliers[idx]}x` : '-'}
                                </td>
                            ))}
                        </tr>
                    ))}
                    </tbody>
                </table>

                <button className="primary-btn" onClick={onClose}>
                    {isPayout ? 'Close' : 'Got it'}
                </button>
            </div>
        </div>
    );
};

export default HowToPlayModal;
