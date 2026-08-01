import type { GameSummary } from "@/features/game/winCard-service";

const WIDTH = 1080;
const HEIGHT = 1920;

const REASON_LABEL: Record<string, string> = {
    checkmate: "Checkmate",
    resignation: "Resignation",
    timeout: "Timeout",
    game_over: "Game Over",
};

function formatDuration(ms: number): string {

    const totalSeconds = Math.max(0, Math.round(ms / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    if (minutes === 0) {
        return `${seconds}s`;
    }

    return `${minutes}m ${seconds}s`;
}

function escapeXml(value: string): string {

    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

/**
 * Builds the win card as raw SVG markup — deliberately not a canvas
 * drawing API or an external image library, so this stays simple,
 * inspectable, and dependency-free. `winCardToPngBlob` below rasters
 * it to a PNG for sharing.
 */
export function buildWinCardSvg(summary: GameSummary, viewerUsername: string | null): string {

    const isWinner = summary.winner_username === viewerUsername;
    const opponent = isWinner ? summary.loser_username : summary.winner_username;

    const headline = summary.result === "DRAW"
        ? "DRAW"
        : (isWinner ? "VICTORY" : "DEFEAT");

    const accent = summary.result === "DRAW"
        ? "#9AA1AC"
        : (isWinner ? "#22C55E" : "#F23645");

    const reasonLabel = summary.end_reason
        ? (REASON_LABEL[summary.end_reason] ?? summary.end_reason)
        : "";

    const timeLine = summary.winner_time_used_ms != null
        ? formatDuration(summary.winner_time_used_ms)
        : "-";

    const opponentLine = opponent ? `vs @${escapeXml(opponent)}` : "vs opponent";

    return `
<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0F1113"/>
      <stop offset="100%" stop-color="#050607"/>
    </linearGradient>
  </defs>

  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>

  <rect x="40" y="40" width="${WIDTH - 80}" height="${HEIGHT - 80}"
        rx="32" fill="none" stroke="${accent}" stroke-opacity="0.35" stroke-width="3"/>

  <text x="${WIDTH / 2}" y="220" text-anchor="middle"
        font-family="Inter, sans-serif" font-size="42" fill="#5B6169" letter-spacing="6">
    ROYAL64
  </text>

  <text x="${WIDTH / 2}" y="420" text-anchor="middle"
        font-family="Inter, sans-serif" font-weight="800" font-size="140" fill="${accent}">
    ${headline}
  </text>

  <text x="${WIDTH / 2}" y="500" text-anchor="middle"
        font-family="Inter, sans-serif" font-size="40" fill="#9AA1AC">
    ${escapeXml(opponentLine)}
  </text>

  <g font-family="'JetBrains Mono', monospace" fill="#F5F6F7">

    <text x="${WIDTH / 2}" y="900" text-anchor="middle" font-size="34" fill="#5B6169">HOW</text>
    <text x="${WIDTH / 2}" y="960" text-anchor="middle" font-size="52">${escapeXml(reasonLabel)}</text>

    <text x="${WIDTH / 2}" y="1080" text-anchor="middle" font-size="34" fill="#5B6169">MOVES</text>
    <text x="${WIDTH / 2}" y="1140" text-anchor="middle" font-size="52">${summary.total_moves}</text>

    <text x="${WIDTH / 2}" y="1260" text-anchor="middle" font-size="34" fill="#5B6169">TIME USED</text>
    <text x="${WIDTH / 2}" y="1320" text-anchor="middle" font-size="52">${escapeXml(timeLine)}</text>

    <text x="${WIDTH / 2}" y="1440" text-anchor="middle" font-size="34" fill="#5B6169">STAKE</text>
    <text x="${WIDTH / 2}" y="1500" text-anchor="middle" font-size="52">${summary.stake} ${escapeXml(summary.currency)}</text>

  </g>

  <text x="${WIDTH / 2}" y="${HEIGHT - 100}" text-anchor="middle"
        font-family="Inter, sans-serif" font-size="30" fill="#33383F">
    play on Telegram @ Royal64
  </text>

</svg>`.trim();
}

export async function winCardToPngBlob(svgMarkup: string): Promise<Blob> {

    const svgBlob = new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    try {
        const image = await new Promise<HTMLImageElement>((resolve, reject) => {

            const img = new Image();

            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error("failed to rasterize win card"));

            img.src = url;
        });

        const canvas = document.createElement("canvas");

        canvas.width = WIDTH;
        canvas.height = HEIGHT;

        const ctx = canvas.getContext("2d");

        if (!ctx) {
            throw new Error("canvas 2d context unavailable");
        }

        ctx.drawImage(image, 0, 0, WIDTH, HEIGHT);

        const blob = await new Promise<Blob | null>((resolve) => {
            canvas.toBlob(resolve, "image/png");
        });

        if (!blob) {
            throw new Error("failed to encode win card as PNG");
        }

        return blob;

    } finally {
        URL.revokeObjectURL(url);
    }
}
