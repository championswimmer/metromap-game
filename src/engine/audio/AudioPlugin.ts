import { ExtensionType } from "pixi.js";
import type { Application, ExtensionMetadata } from "pixi.js";

import { ProceduralAudio } from "./ProceduralAudio";

/**
 * Middleware for Application's audio functionality.
 */
export class CreationAudioPlugin {
  /** @ignore */
  public static extension: ExtensionMetadata = ExtensionType.Application;

  /**
   * Initialize the plugin with scope of application instance
   */
  public static init(): void {
    const app = this as unknown as Application;
    app.audio = new ProceduralAudio();
  }

  /**
   * Clean up the ticker, scoped to application
   */
  public static destroy(): void {
    const app = this as unknown as Application;
    if (app.audio) {
      app.audio.setVolume(0);
      app.audio = null as unknown as ProceduralAudio;
    }
  }
}
