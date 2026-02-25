import { animate } from "motion";
import { BlurFilter, Container, Sprite, Texture, Text, Assets } from "pixi.js";

import { engine } from "@app/getEngine";
import { FlatButton } from "@rendering/components/FlatButton";
import { RoundedBox } from "@rendering/components/RoundedBox";

let currentShareText: string = "";
let currentBase64Image: string = "";

export function setShareDataForPopup(
  base64Image: string,
  statsMessage: string,
) {
  currentBase64Image = base64Image;
  currentShareText = statsMessage;
}

/** Popup that shows up to share the gameplay stats */
export class SharePopup extends Container {
  private bg: Sprite;
  private panel: Container;
  private panelBase: RoundedBox;
  private doneButton: FlatButton;
  private titleLabell: Text;
  private statsText: Text;
  private mapSprite: Sprite;
  private twitterBtn: FlatButton;
  private threadsBtn: FlatButton;
  private linkedinBtn: FlatButton;
  private nativeShareBtn: FlatButton;

  private shareText: string = "";
  private base64Image: string = "";

  constructor() {
    super();

    this.bg = new Sprite(Texture.WHITE);
    this.bg.tint = 0x0;
    this.bg.interactive = true;
    this.addChild(this.bg);

    this.panel = new Container();
    this.addChild(this.panel);

    this.panelBase = new RoundedBox({ width: 600, height: 550 });
    this.panel.addChild(this.panelBase);

    this.titleLabell = new Text({
      text: "Share Your City",
      style: { fill: 0xec1561, fontSize: 36, fontWeight: "bold" },
    });
    this.titleLabell.anchor.set(0.5);
    this.titleLabell.y = -220;
    this.panel.addChild(this.titleLabell);

    this.statsText = new Text({
      text: "",
      style: {
        fill: 0xffffff,
        fontSize: 18,
        align: "center",
        wordWrap: true,
        wordWrapWidth: 500,
      },
    });
    this.statsText.anchor.set(0.5);
    this.statsText.y = -150;
    this.panel.addChild(this.statsText);

    this.mapSprite = new Sprite();
    this.mapSprite.anchor.set(0.5);
    this.mapSprite.y = 20; // Will be scaled properly later
    this.panel.addChild(this.mapSprite);

    // Social buttons
    // Social buttons
    this.twitterBtn = new FlatButton({
      text: "Twitter",
      width: 120,
      height: 40,
      fontSize: 16,
      backgroundColor: 0x1da1f2,
    });
    this.twitterBtn.x = -200;
    this.twitterBtn.y = 190;
    this.twitterBtn.onPress.connect(() => this.shareToTwitter());
    this.panel.addChild(this.twitterBtn);

    this.threadsBtn = new FlatButton({
      text: "Threads",
      width: 120,
      height: 40,
      fontSize: 16,
      backgroundColor: 0x000000,
    });
    this.threadsBtn.x = -66;
    this.threadsBtn.y = 190;
    this.threadsBtn.onPress.connect(() => this.shareToThreads());
    this.panel.addChild(this.threadsBtn);

    this.linkedinBtn = new FlatButton({
      text: "LinkedIn",
      width: 120,
      height: 40,
      fontSize: 16,
      backgroundColor: 0x0a66c2,
    });
    this.linkedinBtn.x = 66;
    this.linkedinBtn.y = 190;
    this.linkedinBtn.onPress.connect(() => this.shareToLinkedIn());
    this.panel.addChild(this.linkedinBtn);

    this.nativeShareBtn = new FlatButton({
      text: "Image",
      width: 120,
      height: 40,
      fontSize: 16,
      backgroundColor: 0x27ae60,
    });
    this.nativeShareBtn.x = 200;
    this.nativeShareBtn.y = 190;
    this.nativeShareBtn.onPress.connect(() => this.shareNative());
    this.panel.addChild(this.nativeShareBtn);

    this.doneButton = new FlatButton({
      text: "Close",
      width: 120,
      height: 45,
      fontSize: 18,
      backgroundColor: 0x3498db,
    });
    this.doneButton.y = 260;
    this.doneButton.onPress.connect(() => engine().navigation.dismissPopup());
    this.panel.addChild(this.doneButton);

    if (currentBase64Image) {
      this.setData(currentBase64Image, currentShareText);
    }
  }

  public setData(base64Image: string, statsMessage: string) {
    this.shareText = statsMessage;
    this.base64Image = base64Image;

    this.statsText.text = statsMessage;

    // Load texture
    Assets.load(base64Image).then((texture: Texture) => {
      this.mapSprite.texture = texture;
      // Scale down image to fit in 500x250 area
      const scaleX = 500 / texture.width;
      const scaleY = 250 / texture.height;
      const scale = Math.min(scaleX, scaleY, 1);
      this.mapSprite.scale.set(scale);
    });

    // Check if Web Share API with files is supported
    if (!navigator.canShare) {
      this.nativeShareBtn.text = "Download Image";
    }
  }

  private shareToTwitter() {
    const url = `https://x.com/intent/tweet?text=${encodeURIComponent(this.shareText)}`;
    window.open(url, "_blank");
  }

  private shareToThreads() {
    const url = `https://www.threads.net/intent/post?text=${encodeURIComponent(this.shareText)}`;
    window.open(url, "_blank");
  }

  private shareToLinkedIn() {
    // LinkedIn doesn't support prefilling text via URL params anymore, but we can open intent
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`;
    window.open(url, "_blank");
  }

  private async shareNative() {
    try {
      if (this.base64Image) {
        // convert base64 to blob
        const res = await fetch(this.base64Image);
        const blob = await res.blob();
        const file = new File([blob], "metromap-city.png", {
          type: "image/png",
        });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: "MetroMap.io City",
            text: this.shareText,
            files: [file],
          });
        } else {
          // Download fallback
          const link = document.createElement("a");
          link.href = this.base64Image;
          link.download = "metromap-city.png";
          link.click();
        }
      }
    } catch (e) {
      console.error("Failed to share", e);
    }
  }

  public resize(width: number, height: number) {
    this.bg.width = width;
    this.bg.height = height;
    this.panel.x = width * 0.5;
    this.panel.y = height * 0.5;
  }

  public async show() {
    const currentEngine = engine();
    if (currentEngine.navigation.currentScreen) {
      currentEngine.navigation.currentScreen.filters = [
        new BlurFilter({ strength: 5 }),
      ];
    }
    this.bg.alpha = 0;
    this.panel.pivot.y = -600;
    animate(this.bg, { alpha: 0.8 }, { duration: 0.2, ease: "linear" });
    await animate(
      this.panel.pivot,
      { y: 0 },
      { duration: 0.3, ease: "backOut" },
    );
  }

  public async hide() {
    const currentEngine = engine();
    if (currentEngine.navigation.currentScreen) {
      currentEngine.navigation.currentScreen.filters = [];
    }
    animate(this.bg, { alpha: 0 }, { duration: 0.2, ease: "linear" });
    await animate(
      this.panel.pivot,
      { y: -800 },
      { duration: 0.3, ease: "backIn" },
    );
  }
}
