import { storage } from "../../engine/utils/storage";
import { engine } from "../getEngine";

// Keys for saved items in storage
const KEY_VOLUME_MASTER = "volume-master";
const KEY_VOLUME_BGM = "volume-bgm";
const KEY_VOLUME_SFX = "volume-sfx";

/**
 * Persistent user settings of volumes.
 */
class UserSettings {
  public init() {
    engine().audio.setVolume(this.getMasterVolume());
  }

  /** Get overall sound volume */
  public getMasterVolume() {
    return storage.getNumber(KEY_VOLUME_MASTER) ?? 0.5;
  }

  /** Set overall sound volume */
  public setMasterVolume(value: number) {
    engine().audio.setVolume(value);
    storage.setNumber(KEY_VOLUME_MASTER, value);
  }

  /** Get background music volume */
  public getBgmVolume() {
    return storage.getNumber(KEY_VOLUME_BGM) ?? 1;
  }

  /** Set background music volume (legacy compatibility) */
  public setBgmVolume(value: number) {
    storage.setNumber(KEY_VOLUME_BGM, value);
  }

  /** Get sound effects volume (legacy compatibility) */
  public getSfxVolume() {
    return storage.getNumber(KEY_VOLUME_SFX) ?? 1;
  }

  /** Set sound effects volume (legacy compatibility) */
  public setSfxVolume(value: number) {
    storage.setNumber(KEY_VOLUME_SFX, value);
  }
}

/** SHared user settings instance */
export const userSettings = new UserSettings();
