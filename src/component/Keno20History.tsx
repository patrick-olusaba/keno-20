import {FC} from "react";
import {NormalizedHistory} from "../Util/wsTypes.ts";

/* ============================================
   Keno20 — Local Game History
   ============================================ */

interface HistoryProps {
    history: NormalizedHistory[];
}

const Keno20History: FC<HistoryProps> = ({ history }) => {
    return (
        <div className="keno20-history">
            <span className="keno20-history-title">Game History</span>
            <div className="history-container">
                {history.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '20px',
                        color: 'var(--text-muted)',
                        fontSize: '13px',
                    }}>
                        No games played yet. Place a bet to get started!
                    </div>
                ) : (
                    <table>
                        <thead>
                        <tr>
                            <th>Matches</th>
                            <th>Multiplier</th>
                            <th>Win</th>
                        </tr>
                        </thead>
                        <tbody>
                        {history.map((entry, index) => (
                            <tr key={index}>
                                <td>{entry.MatchedNumbers}</td>
                                <td>{entry.multiplier.toFixed(1)}x</td>
                                <td className={entry.win > 0 ? "win-amount" : "lose-amount"}>
                                    {entry.win.toFixed(2)}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default Keno20History;
