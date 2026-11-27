import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Img, staticFile, delayRender, continueRender} from 'remotion';

// 글꼴: 홈페이지와 같은 Noto Sans KR (SIL OFL). materials/fonts 에 넣어 둔 파일을 씁니다.
export const fontFamily = 'NotoSansKR-local';
if (typeof document !== 'undefined') {
  const handle = delayRender('Noto Sans KR 글꼴 불러오기');
  Promise.all(
    (['500', '700', '900'] as const).map((w) =>
      new FontFace(fontFamily, `url(${staticFile(`fonts/NotoSansKR-${w}.ttf`)}) format('truetype')`, {weight: w})
        .load()
        .then((ff) => document.fonts.add(ff))
    )
  )
    .then(() => continueRender(handle))
    .catch((e) => {
      console.error(e);
      continueRender(handle);
    });
}

// 홈페이지(index.html)와 같은 색
export const C = {
  navy: '#102b42',
  navyDeep: '#0a1d2e',
  teal: '#167c79',
  lime: '#d8ed77',
  orange: '#f28c28',
  paper: '#f6f5f0',
  mist: '#c8d5dd',
  card: 'rgba(255,255,255,0.07)',
};

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/* 은은한 그라데이션 + 천천히 움직이는 도형 */
export const Background: React.FC<{hue?: 'navy' | 'teal'}> = ({hue = 'navy'}) => {
  const f = useCurrentFrame();
  const top = hue === 'teal' ? '#0f3f4d' : C.navy;
  return (
    <AbsoluteFill style={{background: `linear-gradient(160deg, ${top} 0%, ${C.navyDeep} 55%, #0c2a3a 100%)`, overflow: 'hidden'}}>
      <div style={{position: 'absolute', width: 900, height: 900, borderRadius: '50%', left: -380 + Math.sin(f / 70) * 40, top: -260 + Math.cos(f / 80) * 30, background: `radial-gradient(circle, ${C.teal}55 0%, transparent 65%)`}} />
      <div style={{position: 'absolute', width: 760, height: 760, borderRadius: '50%', right: -300 + Math.cos(f / 65) * 40, bottom: -200 + Math.sin(f / 75) * 40, background: `radial-gradient(circle, ${C.lime}22 0%, transparent 65%)`}} />
      <div style={{position: 'absolute', width: 620, height: 620, borderRadius: '50%', border: `2px solid ${C.lime}26`, right: -220, top: 300, transform: `rotate(${f / 3}deg) scale(${1 + Math.sin(f / 50) * 0.03})`}} />
      <div style={{position: 'absolute', width: 420, height: 420, borderRadius: '50%', border: `2px solid ${C.mist}1f`, left: -160, bottom: 380, transform: `scale(${1 + Math.cos(f / 45) * 0.04})`}} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div key={i} style={{position: 'absolute', width: 10, height: 10, borderRadius: 5, background: i % 2 ? C.lime : C.mist, opacity: 0.25, left: 120 + i * 160, top: ((i * 330 + f * (1.2 + i * 0.15)) % 2100) - 100}} />
      ))}
    </AbsoluteFill>
  );
};

/* 단어 단위로 튀어 오르는 자막. 줄은 '\n'으로, 강조 단어는 *단어* 로 */
export const WordPop: React.FC<{text: string; delay?: number; size?: number; color?: string; accent?: string; lineHeight?: number; stagger?: number}> = ({text, delay = 0, size = 110, color = '#fff', accent = C.lime, lineHeight = 1.22, stagger = 4}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  let idx = 0;
  return (
    <div style={{fontFamily, fontWeight: 900, fontSize: size, lineHeight, letterSpacing: '-0.04em', color, textAlign: 'center'}}>
      {text.split('\n').map((line, li) => (
        <div key={li}>
          {line.split(' ').map((w, wi) => {
            const i = idx++;
            const s = spring({frame: f - delay - i * stagger, fps, config: {damping: 11, stiffness: 180, mass: 0.6}});
            const hot = w.startsWith('*');
            const word = w.replace(/\*/g, '');
            return (
              <span key={wi} style={{display: 'inline-block', margin: `0 ${size * 0.13}px`, transform: `translateY(${(1 - s) * 70}px) scale(${0.6 + 0.4 * s})`, opacity: interpolate(s, [0, 0.4], [0, 1], clamp), color: hot ? accent : color}}>
                {word}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export const FadeUp: React.FC<{delay?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({delay = 0, children, style}) => {
  const f = useCurrentFrame();
  const p = interpolate(f - delay, [0, 14], [0, 1], clamp);
  return <div style={{opacity: p, transform: `translateY(${(1 - p) * 30}px)`, ...style}}>{children}</div>;
};

export const Small: React.FC<{children: React.ReactNode; delay?: number; top: number; color?: string; size?: number}> = ({children, delay = 10, top, color = C.mist, size = 44}) => (
  <FadeUp delay={delay} style={{position: 'absolute', left: 90, right: 90, top, textAlign: 'center', fontFamily, fontWeight: 500, fontSize: size, lineHeight: 1.55, color}}>
    {children}
  </FadeUp>
);

/* 0부터 올라가는 숫자 */
export const CountUp: React.FC<{to: number; delay?: number; duration?: number; suffix?: string; style?: React.CSSProperties}> = ({to, delay = 0, duration = 36, suffix = '', style}) => {
  const f = useCurrentFrame();
  const p = interpolate(f - delay, [0, duration], [0, 1], clamp);
  const eased = 1 - Math.pow(1 - p, 3);
  return <span style={style}>{Math.round(to * eased).toLocaleString('ko-KR')}{suffix}</span>;
};

/* 천천히 확대되는 사진 */
export const KenBurns: React.FC<{src: string; style?: React.CSSProperties; from?: number; to?: number; frames: number; position?: string}> = ({src, style, from = 1.04, to = 1.16, frames, position = 'center'}) => {
  const f = useCurrentFrame();
  const s = interpolate(f, [0, frames], [from, to], clamp);
  return (
    <div style={{overflow: 'hidden', ...style}}>
      <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: position, transform: `scale(${s})`}} />
    </div>
  );
};

/* 장면 전환: 밀기(slide) · 확대(zoom) */
export const Enter: React.FC<{type: 'slide' | 'zoom' | 'none'; children: React.ReactNode}> = ({type, children}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: f, fps, config: {damping: 200}, durationInFrames: 18});
  const style: React.CSSProperties =
    type === 'slide'
      ? {transform: `translateX(${(1 - s) * 100}%)`}
      : type === 'zoom'
      ? {transform: `scale(${1.18 - 0.18 * s})`, opacity: s}
      : {};
  return <AbsoluteFill style={style}>{children}</AbsoluteFill>;
};

export const Brand: React.FC = () => (
  <div style={{position: 'absolute', top: 120, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 18, fontFamily, fontWeight: 700, fontSize: 38, color: C.mist}}>
    <Img src={staticFile('logo-tiger.svg')} style={{width: 62, height: 62}} />
    진성범 충남도의원
  </div>
);

/* ---------- 아이콘(SVG) ---------- */
type IP = {size?: number; color?: string; stroke?: number};
const Svg: React.FC<IP & {children: React.ReactNode}> = ({size = 120, color = C.lime, stroke = 8, children}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);
export const IconCap: React.FC<IP> = (p) => (
  <Svg {...p}><path d="M50 18 L92 36 L50 54 L8 36 Z" /><path d="M26 46 V64 Q50 78 74 64 V46" /><path d="M92 36 V60" /></Svg>
);
export const IconUniv: React.FC<IP> = (p) => (
  <Svg {...p}><path d="M12 38 L50 16 L88 38 Z" /><path d="M22 44 V76 M40 44 V76 M60 44 V76 M78 44 V76" /><path d="M10 84 H90" /></Svg>
);
export const IconTown: React.FC<IP> = (p) => (
  <Svg {...p}><path d="M50 88 S20 58 20 40 a30 30 0 0 1 60 0 C80 58 50 88 50 88 Z" /><circle cx="50" cy="40" r="11" /></Svg>
);
export const IconPerson: React.FC<IP> = (p) => (
  <Svg {...p}><circle cx="50" cy="32" r="16" /><path d="M18 88 Q20 58 50 58 Q80 58 82 88" /></Svg>
);
export const IconBriefcase: React.FC<IP> = (p) => (
  <Svg {...p}><rect x="12" y="32" width="76" height="52" rx="8" /><path d="M36 32 V22 H64 V32" /><path d="M12 54 H88" /></Svg>
);
export const IconChart: React.FC<IP> = (p) => (
  <Svg {...p}><path d="M14 86 H88" /><path d="M24 74 L44 54 L60 64 L84 34" /><path d="M70 34 H84 V48" /></Svg>
);
export const IconHome: React.FC<IP> = (p) => (
  <Svg {...p}><path d="M12 48 L50 16 L88 48" /><path d="M22 42 V86 H78 V42" /><path d="M42 86 V62 H58 V86" /></Svg>
);
export const IconCheck: React.FC<IP> = (p) => (
  <Svg {...p}><path d="M22 52 L42 72 L80 30" /></Svg>
);
export const IconAnchor: React.FC<IP> = (p) => (
  <Svg {...p}><circle cx="50" cy="16" r="8" /><path d="M50 24 V88" /><path d="M32 40 H68" /><path d="M16 62 Q20 88 50 88 Q80 88 84 62" /><path d="M10 68 L16 60 L24 66 M90 68 L84 60 L76 66" /></Svg>
);
export const IconPhone: React.FC<IP> = (p) => (
  <Svg {...p}><path d="M30 12 L42 34 L32 42 Q40 60 58 68 L66 58 L88 70 L82 86 Q40 88 14 30 Z" /></Svg>
);
export const IconGlobe: React.FC<IP> = (p) => (
  <Svg {...p}><circle cx="50" cy="50" r="38" /><path d="M12 50 H88" /><path d="M50 12 Q30 50 50 88 Q70 50 50 12" /></Svg>
);
