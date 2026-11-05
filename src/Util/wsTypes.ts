/* ============================================
   Keno20 — Types
   ============================================ */

export type NormalizedHistory = {
    MatchedNumbers: string;
    multiplier: number;
    win: number;
};

export type RawHistoryItem = {
    MatchedNumbers: string;
    WinAmount: string;
    Multiplier: string;
    OutCome: string;
    Prediction: string;
    createdAt: string;
    msisdn: string;
};

export type RawHistoryResponse = {
    data: RawHistoryItem[];
};
