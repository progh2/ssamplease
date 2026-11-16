import { useEffect, useRef } from 'react';
import Phaser from 'phaser';

class Office extends Phaser.Scene {
  constructor(private classroom?: string) { super('office'); }
  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor('#d7bb8a');
    const g = this.add.graphics();
    if (this.classroom) {
      g.fillStyle(0xe8dab9).fillRect(0, 0, width, height);
      g.fillStyle(0x365e50).fillRect(width * .12, height * .1, width * .76, height * .25);
      this.add.text(width / 2, height * .2, this.classroom, { fontSize: '28px', color: '#fff9e2' }).setOrigin(.5);
      for (let row = 0; row < 3; row++) for (let col = 0; col < 3; col++) {
        g.fillStyle(0xa47750).fillRect(width * (.15 + col * .25), height * (.43 + row * .16), width * .18, height * .09);
      }
      return;
    }
    g.fillStyle(0x8d6850).fillRect(0, height * .58, width, height * .42);
    g.fillStyle(0xf0dfb7).fillRect(0, 0, width, height * .58);
    g.fillStyle(0x67504a).fillRect(width * .06, height * .16, width * .25, height * .3);
    g.fillStyle(0x9fc5b5).fillRect(width * .075, height * .18, width * .22, height * .23);
    g.fillStyle(0x654536).fillRect(width * .5, height * .51, width * .44, height * .27);
    g.fillStyle(0xb17a4f).fillRect(width * .48, height * .49, width * .48, height * .08);
    g.fillStyle(0x34363a).fillRect(width * .6, height * .28, width * .22, height * .2);
    g.fillStyle(0xa7d5d2).fillRect(width * .62, height * .3, width * .18, height * .15);
    g.fillStyle(0xe8dfce).fillRect(width * .52, height * .54, width * .18, height * .12);
    g.lineStyle(3, 0xcb4b45).strokeRect(width * .52, height * .54, width * .18, height * .12);
    this.add.text(width * .63, height * .37, 'HOT\nMESSENGER', { fontFamily: 'monospace', fontSize: Math.max(10, width / 50), color: '#294846', align: 'center' }).setOrigin(.5);
  }
}

export function OfficeScene({ classroom }: { classroom?: string }) {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!host.current) return;
    const game = new Phaser.Game({ type: Phaser.AUTO, parent: host.current, backgroundColor: '#d7bb8a', pixelArt: true, render: { antialias: false }, scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH, width: 640, height: 610 }, scene: new Office(classroom) });
    return () => game.destroy(true);
  }, [classroom]);
  return <div ref={host} className="office-canvas" aria-label="픽셀아트 교무실" />;
}
