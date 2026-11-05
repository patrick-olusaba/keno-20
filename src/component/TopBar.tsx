import React, { useState } from 'react';
import HowToPlay from "./HowToPlay.tsx";
import kenoLogo from '../assets/logologo.svg';

/* ============================================
   Keno20 — Top Bar (Premium)
   ============================================ */

type ModalMode = 'howto' | 'payout' | null;

interface TopBarProps {
    balance: number | null;
    isMuted: boolean;
    onToggleMute: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
    balance,
    isMuted,
    onToggleMute
}) => {
    const [modalMode, setModalMode] = useState<ModalMode>(null);

    return (
        <div className="top-bar">
            <div className="top-left">
                <div className="settings">
                    <button onClick={() => setModalMode('payout')} title="Payout Table">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="1" x2="12" y2="23"/>
                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                        </svg>
                    </button>
                    <button onClick={() => setModalMode('howto')} title="How to Play">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M10 8.5a2.5 2.5 0 0 1 4 2c0 3-4 3-4 4"/>
                            <line x1="12" y1="18" x2="12.01" y2="18"/>
                        </svg>
                    </button>
                    <button onClick={onToggleMute} title={isMuted ? 'Unmute' : 'Mute'}>
                        {isMuted ? (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" stroke="none"/>
                                <line x1="23" y1="9" x2="17" y2="15"/>
                                <line x1="17" y1="9" x2="23" y2="15"/>
                            </svg>
                        ) : (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" stroke="none"/>
                                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
                            </svg>
                        )}
                    </button>
                </div>
            </div>

            <div className="top-center">
                <img src={kenoLogo} alt="Keno Logo" className="keno-logo" />
            </div>

            <div className="top-right">
                <div className="keno20-balance-chip">
                    <span className="currency">Ksh</span>
                    {balance != null ? balance.toFixed(2) : "---"}
                </div>
            </div>

            {modalMode && (
                <HowToPlay mode={modalMode} onClose={() => setModalMode(null)} />
            )}
        </div>
    );
};
