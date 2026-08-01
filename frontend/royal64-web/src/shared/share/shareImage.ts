/**
 * Web apps can't post directly to a specific platform's story feed —
 * Instagram/WhatsApp/Telegram don't expose a public API for that from
 * a browser. What IS realistic and what this does: hand the image to
 * the OS-level share sheet via the Web Share API, so the person picks
 * Telegram/Instagram/WhatsApp/etc. themselves, same as sharing a photo
 * from their own camera roll. Falls back to a plain download if the
 * browser doesn't support sharing files (desktop browsers mostly
 * don't; phones mostly do).
 */
export async function shareOrDownloadImage(
    blob: Blob,
    filename: string,
    shareText: string
): Promise<"shared" | "downloaded" | "cancelled"> {

    const file = new File([blob], filename, { type: "image/png" });

    const nav = navigator as Navigator & {
        share?: (data: { files?: File[]; text?: string }) => Promise<void>;
        canShare?: (data: { files?: File[] }) => boolean;
    };

    const canShareFiles =
        typeof nav.share === "function" &&
        typeof nav.canShare === "function" &&
        nav.canShare({ files: [file] });

    if (canShareFiles) {

        try {
            await nav.share!({
                files: [file],
                text: shareText,
            });

            return "shared";

        } catch (err) {

            if (err instanceof DOMException && err.name === "AbortError") {
                return "cancelled";
            }

            // Fall through to download on any other share failure.
        }
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;
    link.click();

    URL.revokeObjectURL(url);

    return "downloaded";
}
