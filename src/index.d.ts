export type WaitUntil =
    | "load"
    | "domcontentloaded"
    | "networkidle"
    | "commit";

export type AnimationMode =
    | "allow"
    | "disabled";

export interface Viewport {
    width: number;
    height: number;
}

export interface ScreenshotConfig {
    target: string;

    outputDirectory?: string;

    outputs?: string[];

    delay?: number;

    viewport?: Partial<Viewport>;

    fullPage?: boolean;

    waitUntil?: WaitUntil;

    waitFor?: string | null;

    timeout?: number;

    animations?: AnimationMode;
}

export function defineConfig(
    config: ScreenshotConfig
): ScreenshotConfig;