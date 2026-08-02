import type { BoardThemeId } from "@/shared/theme/boardThemes";
import { useSoundStore } from "./sound-store";

/**
 * Move sounds are synthesized with the Web Audio API rather than
 * shipped as audio files — there was no way to source/license real
 * wood-knock/glass-clink/metal-ting samples in this environment, and
 * guessing at royalty-free assets isn't something to ship blind. This
 * gets three genuinely distinct-sounding cues with zero asset weight
 * and no licensing question at all. Swap in real recordings later by
 * replacing the bodies of these three functions — the call site
 * (playMoveSound) doesn't need to change.
 */

let ctx: AudioContext | null = null;

function getContext(): AudioContext {

    if (!ctx) {
        ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    // Browsers suspend a freshly-created context until a user gesture;
    // this resume() is a no-op once it's already running.
    if (ctx.state === "suspended") {
        ctx.resume();
    }

    return ctx;
}

function playTone(
    audioCtx: AudioContext,
    {
        frequency,
        type,
        duration,
        startGain,
        detune = 0,
        startTime = 0,
    }: {
        frequency: number;
        type: OscillatorType;
        duration: number;
        startGain: number;
        detune?: number;
        startTime?: number;
    },
) {

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = type;
    osc.frequency.value = frequency;
    osc.detune.value = detune;

    const now = audioCtx.currentTime + startTime;

    gain.gain.setValueAtTime(startGain, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(now);
    osc.stop(now + duration);
}

function playWood(audioCtx: AudioContext) {

    // A short, low, quickly-decaying thump — closer to a knock than a
    // musical note.
    playTone(audioCtx, { frequency: 180, type: "triangle", duration: 0.09, startGain: 0.35 });
    playTone(audioCtx, { frequency: 90, type: "sine", duration: 0.12, startGain: 0.25 });
}

function playGlass(audioCtx: AudioContext) {

    // Bright and ringing — higher frequency, longer decay, a second
    // higher partial for the "clink" shimmer.
    playTone(audioCtx, { frequency: 1600, type: "sine", duration: 0.4, startGain: 0.18 });
    playTone(audioCtx, { frequency: 2400, type: "sine", duration: 0.25, startGain: 0.08, startTime: 0.02 });
}

function playMetal(audioCtx: AudioContext) {

    // Two close, detuned oscillators beating against each other reads
    // as metallic much more than a single clean tone does.
    playTone(audioCtx, { frequency: 900, type: "square", duration: 0.2, startGain: 0.06, detune: 0 });
    playTone(audioCtx, { frequency: 905, type: "square", duration: 0.2, startGain: 0.06, detune: 8 });
    playTone(audioCtx, { frequency: 450, type: "triangle", duration: 0.15, startGain: 0.15 });
}

export function playMoveSound(theme: BoardThemeId) {

    if (!useSoundStore.getState().enabled) {
        return;
    }

    try {
        const audioCtx = getContext();

        if (theme === "wood") playWood(audioCtx);
        else if (theme === "glass") playGlass(audioCtx);
        else if (theme === "metal") playMetal(audioCtx);

    } catch {
        // Audio is a nice-to-have — a browser blocking it (autoplay
        // policy, no Web Audio support) should never break gameplay.
    }
}
