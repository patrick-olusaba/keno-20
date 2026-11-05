import {Dispatch, FC, SetStateAction, useCallback, useEffect, useRef} from "react";

/* ============================================
   Keno20 — Premium Canvas Number Grid
   Dark Luxury Casino Theme
   ============================================ */

interface CanvasNumberGridProps {
    selectedNumbers: number[];
    drawnNumbers: number[];
    revealedNumbers: number[];
    onSelectedNumber: Dispatch<SetStateAction<number[]>>;
}

/* === Design System Colors (Canvas-compatible) === */
const COLORS = {
    bgDeep: '#08080c',
    bgSurface: '#141829',
    bgCell: '#1e2440',
    bgCellBottom: '#13172d',
    cellBorder: 'rgba(212,168,67,0.2)',
    cellGlow: 'rgba(212,168,67,0.25)',

    selectedTop: '#4b2d78',
    selectedBottom: '#2d184d',
    selectedGlow: 'rgba(107,79,187,0.6)',
    selectedBorder: 'rgba(155,127,232,0.5)',
    selectedNumber: '#f0d078',

    matchedTop: '#0a5a28',
    matchedBottom: '#063615',
    matchedGlow: 'rgba(15,190,90,0.8)',
    matchedBorder: 'rgba(15,190,90,0.5)',

    revealedTop: '#5c2d0a',
    revealedBottom: '#3d1d05',
    revealedGlow: 'rgba(230,126,34,0.5)',
    revealedNumber: '#ffe4c4',

    diamondCenter: '#fff8dc',
    diamondMid: '#f0d078',
    diamondEdge: 'rgba(212,168,67,0.3)',

    textPrimary: '#f5f0e8',
    goldPrimary: '#d4a843',
    white: '#ffffff',
    black: '#000000',
    glassHighlight: 'rgba(255,255,255,0.06)',
};

/* === Animation timings === */
const REVEAL_DURATION = 500; // ms per cell reveal pop animation

export const CanvasNumberGrid: FC<CanvasNumberGridProps> = (
    {drawnNumbers, onSelectedNumber, selectedNumbers, revealedNumbers}
) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animFrameRef = useRef<number>(0);
    const revealStartTimes = useRef<Map<number, number>>(new Map());
    const hoveredCell = useRef<number | null>(null);
    const isAnimating = useRef(false);

    const canvasWidth = 580;
    const canvasHeight = 480;
    const rows = 4;
    const cols = 5;
    const gap = 16;
    const borderRadius = 14;
    const padding = 10;

    // Calculate cell size
    const availableWidth = canvasWidth - gap * (cols - 1) - padding * 2;
    const availableHeight = canvasHeight - gap * (rows - 1) - padding * 2;
    const cellWidth = Math.floor(availableWidth / cols);
    const cellHeight = Math.floor(availableHeight / rows);

    /* === Drawing Helpers === */

    const drawGridBackground = useCallback((ctx: CanvasRenderingContext2D) => {
        // Vignette radial gradient
        const cx = canvasWidth / 2;
        const cy = canvasHeight / 2;
        const grad = ctx.createRadialGradient(cx, cy, canvasWidth * 0.2, cx, cy, canvasWidth * 0.7);
        grad.addColorStop(0, '#161a38');
        grad.addColorStop(1, COLORS.bgDeep);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }, [canvasWidth, canvasHeight]);

    const drawDiamond = useCallback((ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, alpha: number) => {
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(cx, cy);
        ctx.beginPath();
        ctx.moveTo(0, -size);
        ctx.lineTo(size * 0.8, 0);
        ctx.lineTo(0, size);
        ctx.lineTo(-size * 0.8, 0);
        ctx.closePath();

        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
        grad.addColorStop(0, COLORS.diamondCenter);
        grad.addColorStop(0.4, COLORS.diamondMid);
        grad.addColorStop(1, COLORS.diamondEdge);
        ctx.fillStyle = grad;
        ctx.fill();

        // Diamond outline
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.restore();
    }, []);

    const drawCellBody = useCallback((
        ctx: CanvasRenderingContext2D,
        x: number, y: number,
        w: number, h: number,
        radius: number,
        state: 'default' | 'selected' | 'matched' | 'revealed',
        glowIntensity: number
    ) => {
        let topColor: string, bottomColor: string, glowColor: string, borderColor: string;

        switch (state) {
            case 'selected':
                topColor = COLORS.selectedTop;
                bottomColor = COLORS.selectedBottom;
                glowColor = COLORS.selectedGlow;
                borderColor = COLORS.selectedBorder;
                break;
            case 'matched':
                topColor = COLORS.matchedTop;
                bottomColor = COLORS.matchedBottom;
                glowColor = COLORS.matchedGlow;
                borderColor = COLORS.matchedBorder;
                break;
            case 'revealed':
                topColor = COLORS.revealedTop;
                bottomColor = COLORS.revealedBottom;
                glowColor = COLORS.revealedGlow;
                borderColor = 'rgba(230,126,34,0.4)';
                break;
            default:
                topColor = COLORS.bgCell;
                bottomColor = COLORS.bgCellBottom;
                glowColor = COLORS.cellGlow;
                borderColor = COLORS.cellBorder;
        }

        // Outer glow
        if (glowIntensity > 0) {
            ctx.shadowColor = glowColor;
            ctx.shadowBlur = 8 + glowIntensity * 18;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
        }

        // Cell gradient
        const grad = ctx.createLinearGradient(x, y, x, y + h);
        grad.addColorStop(0, topColor);
        grad.addColorStop(1, bottomColor);
        ctx.fillStyle = grad;

        // Rounded rect
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + w - radius, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
        ctx.lineTo(x + w, y + h - radius);
        ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
        ctx.lineTo(x + radius, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.fill();

        // Reset shadow for border
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;

        // Border
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Glass highlight line (top 30% of cell, subtle white)
        if (state !== 'matched') {
            ctx.strokeStyle = COLORS.glassHighlight;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x + borderRadius + 4, y + h * 0.22);
            ctx.lineTo(x + w - borderRadius - 4, y + h * 0.22);
            ctx.stroke();
        }
    }, []);

    const drawCellNumber = useCallback((
        ctx: CanvasRenderingContext2D,
        x: number, y: number,
        w: number, h: number,
        number: number,
        state: 'default' | 'selected' | 'matched' | 'revealed',
        scale: number
    ) => {
        let color: string;

        switch (state) {
            case 'selected':
                color = COLORS.selectedNumber;
                break;
            case 'matched':
                color = COLORS.black;
                break;
            case 'revealed':
                color = COLORS.revealedNumber;
                break;
            default:
                color = COLORS.goldPrimary;
        }

        ctx.save();
        ctx.translate(x + w / 2, y + h / 2);
        ctx.scale(scale, scale);
        ctx.fillStyle = color;
        ctx.font = "bold 28px 'Playfair Display', serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(number.toString(), 0, 0);
        ctx.restore();
    }, []);

    /* === Main Draw === */
    const drawGrid = useCallback((timestamp: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.canvas.width = canvasWidth;
        ctx.canvas.height = canvasHeight;

        // Background
        drawGridBackground(ctx);

        let number = 1;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const x = col * (cellWidth + gap) + padding;
                const y = row * (cellHeight + gap) + padding;

                // Determine cell state
                const isSelected = selectedNumbers.includes(number);
                const isRevealed = revealedNumbers.includes(number);
                const isHovered = hoveredCell.current === number;

                let state: 'default' | 'selected' | 'matched' | 'revealed' = 'default';
                if (isSelected && isRevealed) state = 'matched';
                else if (isRevealed) state = 'revealed';
                else if (isSelected) state = 'selected';

                // Calculate reveal animation progress
                let animProgress = 0;
                let glowIntensity = 0;
                const startTime = revealStartTimes.current.get(number) ?? undefined;

                if (startTime !== undefined && isRevealed) {
                    const elapsed = timestamp - startTime;
                    if (elapsed < REVEAL_DURATION) {
                        animProgress = elapsed / REVEAL_DURATION;
                        isAnimating.current = true;
                    } else {
                        animProgress = 1;
                    }
                } else if (isRevealed) {
                    animProgress = 1;
                }

                // Scale pop effect (0→1.12→1.0)
                let scale = 1;
                if (animProgress > 0 && animProgress < 1) {
                    // Peak at 40% of animation
                    if (animProgress < 0.4) {
                        scale = 1 + animProgress * 0.3; // 1 → 1.12
                    } else {
                        scale = 1.12 - (animProgress - 0.4) * 0.2; // 1.12 → 1.0
                    }
                    glowIntensity = animProgress < 0.4
                        ? animProgress / 0.4
                        : 1 - (animProgress - 0.4) / 0.6;
                } else if (animProgress >= 1 && (state === 'matched' || state === 'revealed')) {
                    glowIntensity = 1;
                }

                // Hover glow boost
                if (isHovered && !isRevealed && !isSelected) {
                    glowIntensity = 0.3;
                }

                // Draw cell
                drawCellBody(ctx, x, y, cellWidth, cellHeight, borderRadius, state, glowIntensity);

                // Draw diamond emblem on matched cells
                if (state === 'matched') {
                    const diamondAlpha = animProgress < 0.5 ? 0 : (animProgress - 0.5) * 2;
                    if (diamondAlpha > 0) {
                        drawDiamond(ctx, x + cellWidth / 2, y + cellHeight / 2, cellHeight * 0.32, Math.min(diamondAlpha, 1));
                    }
                }

                // Draw number
                drawCellNumber(ctx, x, y, cellWidth, cellHeight, number, state, scale);

                // Hover border highlight
                if (isHovered && !isRevealed && !isSelected) {
                    ctx.strokeStyle = 'rgba(212,168,67,0.5)';
                    ctx.lineWidth = 2;
                    ctx.shadowColor = 'rgba(212,168,67,0.3)';
                    ctx.shadowBlur = 8;
                    ctx.beginPath();
                    ctx.moveTo(x + borderRadius, y);
                    ctx.lineTo(x + cellWidth - borderRadius, y);
                    ctx.quadraticCurveTo(x + cellWidth, y, x + cellWidth, y + borderRadius);
                    ctx.lineTo(x + cellWidth, y + cellHeight - borderRadius);
                    ctx.quadraticCurveTo(x + cellWidth, y + cellHeight, x + cellWidth - borderRadius, y + cellHeight);
                    ctx.lineTo(x + borderRadius, y + cellHeight);
                    ctx.quadraticCurveTo(x, y + cellHeight, x, y + cellHeight - borderRadius);
                    ctx.lineTo(x, y + borderRadius);
                    ctx.quadraticCurveTo(x, y, x + borderRadius, y);
                    ctx.closePath();
                    ctx.stroke();
                    ctx.shadowColor = 'transparent';
                    ctx.shadowBlur = 0;
                }

                number++;
            }
        }
    }, [rows, cols, cellWidth, cellHeight, gap, padding, borderRadius, canvasWidth, canvasHeight,
        selectedNumbers, revealedNumbers, drawGridBackground, drawCellBody, drawDiamond, drawCellNumber]);

    /* === Animation Loop === */
    const animationLoop = useCallback((timestamp: number) => {
        drawGrid(timestamp);
        if (isAnimating.current) {
            isAnimating.current = false; // reset, will be set to true during draw if needed
            animFrameRef.current = requestAnimationFrame(animationLoop);
        }
    }, [drawGrid]);

    /* === Track previous revealedNumbers to detect new reveals === */
    const prevRevealedRef = useRef<Set<number>>(new Set());

    /* === Watch revealedNumbers for new additions, start animation for each === */
    useEffect(() => {
        const currentSet = new Set(revealedNumbers);
        const prevSet = prevRevealedRef.current;

        // Find newly revealed numbers
        currentSet.forEach((num) => {
            if (!prevSet.has(num)) {
                // Newly revealed — record start time and kick off animation
                revealStartTimes.current.set(num, performance.now());
                isAnimating.current = true;
            }
        });

        // Find cleared (reset) — if revealedNumbers was emptied, clear everything
        if (revealedNumbers.length === 0 && prevSet.size > 0) {
            revealStartTimes.current.clear();
        }

        prevRevealedRef.current = currentSet;

        // Start animation loop if needed
        if (isAnimating.current) {
            if (animFrameRef.current) {
                cancelAnimationFrame(animFrameRef.current);
            }
            animFrameRef.current = requestAnimationFrame(animationLoop);
        }
    }, [revealedNumbers, animationLoop]);

    /* === Click Handling === */
    const handleClick = useCallback((event: MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const scaleX = (canvasWidth) / rect.width;
        const scaleY = (canvasHeight) / rect.height;
        const mouseX = (event.clientX - rect.left) * scaleX;
        const mouseY = (event.clientY - rect.top) * scaleY;

        const col = Math.floor((mouseX - padding - gap / 2) / (cellWidth + gap));
        const row = Math.floor((mouseY - padding - gap / 2) / (cellHeight + gap));
        const number = row * cols + col + 1;

        if (number >= 1 && number <= rows * cols) {
            onSelectedNumber((prev) => {
                if (prev.includes(number) && prev.length === 1) return prev;
                if (!prev.includes(number) && prev.length >= 7) return prev;
                return prev.includes(number) ? prev.filter((n) => n !== number) : [...prev, number];
            });
        }
    }, [cellWidth, cellHeight, gap, padding, rows, cols, canvasWidth, canvasHeight, onSelectedNumber]);

    /* === Hover Tracking === */
    const handleMouseMove = useCallback((event: MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const scaleX = (canvasWidth) / rect.width;
        const scaleY = (canvasHeight) / rect.height;
        const mouseX = (event.clientX - rect.left) * scaleX;
        const mouseY = (event.clientY - rect.top) * scaleY;

        const col = Math.floor((mouseX - padding - gap / 2) / (cellWidth + gap));
        const row = Math.floor((mouseY - padding - gap / 2) / (cellHeight + gap));
        const number = row * cols + col + 1;

        const prev = hoveredCell.current;
        if (number >= 1 && number <= rows * cols) {
            hoveredCell.current = number;
        } else {
            hoveredCell.current = null;
        }

        // Only redraw if hover changed
        if (prev !== hoveredCell.current) {
            if (animFrameRef.current) {
                cancelAnimationFrame(animFrameRef.current);
            }
            animFrameRef.current = requestAnimationFrame((ts) => drawGrid(ts));
        }
    }, [cellWidth, cellHeight, gap, padding, rows, cols, canvasWidth, canvasHeight, drawGrid]);

    const handleMouseLeave = useCallback(() => {
        hoveredCell.current = null;
        if (animFrameRef.current) {
            cancelAnimationFrame(animFrameRef.current);
        }
        animFrameRef.current = requestAnimationFrame((ts) => drawGrid(ts));
    }, [drawGrid]);

    /* === Initial Draw & Event Listeners === */
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Initial draw
        animFrameRef.current = requestAnimationFrame((ts) => drawGrid(ts));

        canvas.addEventListener("click", handleClick);
        canvas.addEventListener("mousemove", handleMouseMove);
        canvas.addEventListener("mouseleave", handleMouseLeave);

        return () => {
            canvas.removeEventListener("click", handleClick);
            canvas.removeEventListener("mousemove", handleMouseMove);
            canvas.removeEventListener("mouseleave", handleMouseLeave);
            if (animFrameRef.current) {
                cancelAnimationFrame(animFrameRef.current);
            }
        };
    }, [drawGrid, handleClick, handleMouseMove, handleMouseLeave]);

    // Also redraw when selection or reveals change (for non-animated updates)
    useEffect(() => {
        if (drawnNumbers.length === 0) {
            if (animFrameRef.current) {
                cancelAnimationFrame(animFrameRef.current);
            }
            animFrameRef.current = requestAnimationFrame((ts) => drawGrid(ts));
        }
    }, [selectedNumbers, revealedNumbers, drawnNumbers.length, drawGrid]);

    return <canvas ref={canvasRef} className="keno20-canvas"/>;
};
