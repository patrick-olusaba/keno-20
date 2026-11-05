export const payoutTable: Record<number, number[]> = {
    1: [0, 2],
    2: [0, 1, 5],
    3: [0, 0.5, 2, 10],
    4: [0, 0.5, 2, 6, 25],
    5: [0, 0.5, 1, 3, 15, 50],
    6: [0, 0.5, 1, 2, 5, 30, 75],
    7: [0, 0.5, 0.5, 2, 5, 20, 50, 100],
    8: [0, 0, 0.5, 1, 4, 10, 30, 75, 150],
    9: [0, 0, 0.5, 1, 2, 8, 20, 50, 100, 200],
    10: [0, 0, 0.5, 1, 2, 5, 15, 40, 100, 300, 500]
};

export const getPayout = (numSelected: number, numMatched: number, betAmount: number): number => {
    const multipliers = payoutTable[numSelected] || [];
    const multiplier = multipliers[numMatched] || 0;
    return betAmount * multiplier;
};
