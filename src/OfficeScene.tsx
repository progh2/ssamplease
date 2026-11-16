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
    // A stable tabletop under independent interactive objects; room art comes later.
    g.fillStyle(0xb88d60).fillRect(0, 0, width, height);
    for (let row = 0; row < 8; row++) {
      g.fillStyle(row % 2 ? 0xb48a5d : 0xbd9468).fillRect(0, row * 78, width, 76);
      g.lineStyle(1, 0xa77d52, .5).lineBetween(0, row * 78 + 38, width, row * 78 + 38);
    }
    g.fillStyle(0x805b3e).fillRect(0, height - 20, width, 20);
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
