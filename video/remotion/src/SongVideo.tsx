import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Background, C, FadeUp, WordPop, fontFamily} from './ui';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/* 음악에 맞춰 움직이는 듯한 막대(장식용) */
const Bars: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <div style={{display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 14, height: 150}}>
      {Array.from({length: 15}).map((_, i) => {
        const h = 30 + 110 * Math.abs(Math.sin(f / (7 + (i % 5)) + i * 1.7)) * (0.55 + 0.45 * Math.abs(Math.sin(f / 40 + i)));
        return <div key={i} style={{width: 26, height: h, borderRadius: 13, background: i % 3 === 1 ? C.orange : C.lime, opacity: 0.85}} />;
      })}
    </div>
  );
};

const LINES = ['기본금융 기본금융', '신용과 상관없이', '따뜻한 우리 사회', '기본사회 충남에서', '서로 손을 잡아요'];

export const SongVideo: React.FC = () => {
  const f = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const logo = spring({frame: f - 4, fps, config: {damping: 11}});
  const beat = 1 + 0.04 * Math.max(0, Math.sin((f / fps) * Math.PI * (100 / 60)));
  // 후렴 문구를 4초마다 하나씩 강조
  const active = Math.floor(f / (fps * 4)) % LINES.length;
  const progress = f / durationInFrames;
  const fadeOut = interpolate(f, [durationInFrames - 30, durationInFrames], [1, 0], clamp);
  return (
    <AbsoluteFill style={{opacity: fadeOut}}>
      <Background />
      <div style={{position: 'absolute', left: 0, right: 0, top: 230, display: 'flex', justifyContent: 'center', transform: `scale(${(0.6 + 0.4 * logo) * beat})`, opacity: logo}}>
        <Img src={staticFile('logo-tiger.svg')} style={{width: 230, height: 230}} />
      </div>
      <FadeUp delay={10} style={{position: 'absolute', left: 0, right: 0, top: 500, textAlign: 'center', fontFamily, fontWeight: 700, fontSize: 44, letterSpacing: '0.2em', color: C.lime}}>
        충남 기본금융 노래
      </FadeUp>
      <div style={{position: 'absolute', left: 30, right: 30, top: 580}}>
        <WordPop text={'신용과 상관없이\n*따뜻한* 사회'} size={112} delay={16} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 900}}>
        <Bars />
      </div>
      <div style={{position: 'absolute', left: 120, right: 120, top: 1110, display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center'}}>
        {LINES.map((l, i) => {
          const on = i === active;
          return (
            <div key={l} style={{fontFamily, fontWeight: on ? 900 : 500, fontSize: on ? 60 : 44, color: on ? '#fff' : '#8fa3b1', transition: 'none', transform: `scale(${on ? 1 : 0.96})`}}>
              {l}
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', left: 140, right: 140, top: 1560, height: 10, borderRadius: 5, background: '#ffffff22'}}>
        <div style={{width: `${progress * 100}%`, height: '100%', borderRadius: 5, background: C.lime}} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1610, textAlign: 'center', fontFamily, fontWeight: 500, fontSize: 34, color: '#8fa3b1'}}>
        진성범 충남도의원 · jinsim1.kr · AI를 활용해 제작
      </div>
      <Audio src={staticFile('song-basic-finance.mp3')} volume={(fr) => interpolate(fr, [durationInFrames - 45, durationInFrames], [1, 0], clamp)} />
    </AbsoluteFill>
  );
};
