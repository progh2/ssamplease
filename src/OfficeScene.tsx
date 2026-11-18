import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import deskBackground from './assets/backgrounds/teacher-desk.png';
import classroomBackground from './assets/backgrounds/classroom.png';

class Office extends Phaser.Scene {
  constructor(private classroom?: string) { super('office'); }
  preload() {
    this.load.image('background', this.classroom ? classroomBackground : deskBackground);
  }
  create() {
    const background = this.add.image(0, 0, 'background');
    const fit = () => {
      const { width, height } = this.scale;
      background.setPosition(width / 2, height / 2);
      background.setScale(Math.max(width / background.width, height / background.height));
    };
    fit();
    this.scale.on('resize', fit);
    this.events.once('shutdown', () => this.scale.off('resize', fit));
  }
}

export function OfficeScene({ classroom }: { classroom?: string }) {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!host.current) return;
    const game = new Phaser.Game({ type: Phaser.AUTO, parent: host.current, backgroundColor: '#d7bb8a', pixelArt: true, render: { antialias: false }, scale: { mode: Phaser.Scale.RESIZE, width: host.current.clientWidth, height: host.current.clientHeight }, scene: new Office(classroom) });
    return () => game.destroy(true);
  }, [classroom]);
  return <div ref={host} className="office-canvas" role="img" aria-label={classroom ? `${classroom} 픽셀아트 교실` : '픽셀아트 교사 책상'} />;
}
