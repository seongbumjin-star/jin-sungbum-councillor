import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {
  Background, Brand, C, CountUp, Enter, FadeUp, KenBurns, Small, WordPop, fontFamily,
  IconAnchor, IconBriefcase, IconCap, IconChart, IconCheck, IconGlobe, IconHome, IconPhone, IconPerson, IconTown, IconUniv,
} from './ui';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const T = 15; // 장면 전환 겹침(프레임)

/* 1. 0~3초 — 시선을 끄는 질문 */
const S1: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pop = spring({frame: f, fps, config: {damping: 10, stiffness: 160}});
  return (
    <AbsoluteFill>
      <Background />
      <Brand />
      <div style={{position: 'absolute', left: 0, right: 0, top: 540, display: 'flex', justifyContent: 'center', transform: `scale(${0.5 + 0.5 * pop}) rotate(${(1 - pop) * -12}deg)`}}>
        <div style={{width: 300, height: 300, borderRadius: '50%', background: `${C.lime}1f`, border: `4px solid ${C.lime}66`, display: 'grid', placeItems: 'center'}}>
          <IconCap size={190} />
        </div>
      </div>
      <div style={{position: 'absolute', left: 40, right: 40, top: 930}}>
        <WordPop text={'졸업하면\n충남을 *떠나나요?*'} size={124} delay={1} stagger={5} />
      </div>
      <Small top={1290} delay={34} size={46}>충남 청년의 고민</Small>
    </AbsoluteFill>
  );
};

/* 2. 3~8초 — 앵커(닻)의 뜻: 대학·지역·청년을 잇다 */
const S2: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const drop = spring({frame: f - 6, fps, config: {damping: 12, stiffness: 90}});
  const line = interpolate(f, [40, 75], [0, 1], clamp);
  const nodes = [
    {x: 190, label: '대학', Icon: IconUniv},
    {x: 540, label: '지역', Icon: IconTown},
    {x: 890, label: '청년', Icon: IconPerson},
  ];
  return (
    <AbsoluteFill>
      <Background hue="teal" />
      <Brand />
      <div style={{position: 'absolute', left: 0, right: 0, top: 350 + (1 - drop) * -320, display: 'flex', justifyContent: 'center'}}>
        <IconAnchor size={260} color={C.orange} stroke={7} />
      </div>
      <svg style={{position: 'absolute', left: 0, top: 750}} width={1080} height={300}>
        <path d="M190 130 Q365 40 540 130 Q715 40 890 130" fill="none" stroke={C.lime} strokeWidth={6} strokeDasharray={1000} strokeDashoffset={1000 * (1 - line)} strokeLinecap="round" />
      </svg>
      {nodes.map(({x, label, Icon}, i) => {
        const s = spring({frame: f - 24 - i * 8, fps, config: {damping: 12}});
        return (
          <div key={label} style={{position: 'absolute', left: x - 120, top: 770, width: 240, textAlign: 'center', transform: `scale(${s})`, opacity: s}}>
            <div style={{width: 200, height: 200, margin: '0 auto', borderRadius: 36, background: C.card, border: `3px solid ${C.mist}33`, display: 'grid', placeItems: 'center'}}>
              <Icon size={120} />
            </div>
            <div style={{fontFamily, fontWeight: 700, fontSize: 50, marginTop: 18, color: '#fff'}}>{label}</div>
          </div>
        );
      })}
      <div style={{position: 'absolute', left: 40, right: 40, top: 1150}}>
        <WordPop text={'청년을 붙잡는 *닻*'} size={112} delay={30} accent={C.orange} />
      </div>
      <Small top={1340} delay={60} size={44}>
        앵커사업: 대학과 지역을 이어<br />청년이 충남에 취업·정착하도록 돕는 사업
      </Small>
    </AbsoluteFill>
  );
};

/* 3. 8~14초 — 국비 699억 → 461억 */
const S3: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const H = 520;
  const g1 = spring({frame: f - 8, fps, config: {damping: 200}, durationInFrames: 40});
  const g2 = spring({frame: f - 44, fps, config: {damping: 200}, durationInFrames: 40});
  const bar = (x: number, h: number, color: string, glow: boolean) => (
    <div style={{position: 'absolute', left: x, bottom: 0, width: 230, height: h, borderRadius: '18px 18px 6px 6px', background: color, boxShadow: glow ? `0 0 60px ${C.lime}55` : 'none'}} />
  );
  return (
    <AbsoluteFill>
      <Background />
      <Brand />
      <FadeUp delay={2} style={{position: 'absolute', left: 0, right: 0, top: 400, textAlign: 'center', fontFamily, fontWeight: 700, fontSize: 52, color: '#fff'}}>
        앵커사업 국비 기본지원액
      </FadeUp>
      <div style={{position: 'absolute', left: 190, width: 700, top: 530, height: H + 140}}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 140, height: H}}>
          {bar(60, H * g1, '#5fb3ad', false)}
          {bar(410, H * (461 / 699) * g2, C.lime, true)}
          <div style={{position: 'absolute', left: 0, right: 0, bottom: -4, height: 4, background: '#5c7385'}} />
        </div>
        <div style={{position: 'absolute', left: 60, width: 230, top: 140 + H - H * g1 - 96, textAlign: 'center', fontFamily, fontWeight: 900, fontSize: 70, color: '#fff'}}>
          <CountUp to={699} delay={8} duration={40} suffix="억" />
        </div>
        <div style={{position: 'absolute', left: 410, width: 230, top: 140 + H - H * (461 / 699) * g2 - 96, textAlign: 'center', fontFamily, fontWeight: 900, fontSize: 70, color: C.lime, opacity: g2 > 0.02 ? 1 : 0}}>
          <CountUp to={461} delay={44} duration={40} suffix="억" />
        </div>
        <div style={{position: 'absolute', left: 60, width: 230, top: H + 160, textAlign: 'center', fontFamily, fontWeight: 500, fontSize: 44, color: C.mist}}>2026년</div>
        <div style={{position: 'absolute', left: 410, width: 230, top: H + 160, textAlign: 'center', fontFamily, fontWeight: 500, fontSize: 44, color: C.mist}}>2027년</div>
      </div>
      <div style={{position: 'absolute', left: 30, right: 30, top: 1320}}>
        <WordPop text={'국비 *699억* → *461억*'} size={104} delay={86} stagger={6} />
      </div>
      <Small top={1480} delay={110} size={42}>2026년 → 2027년 기본지원액 비교</Small>
    </AbsoluteFill>
  );
};

/* 4. 14~19초 — 34% 감소, 도정질문 */
const S4: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pop = spring({frame: f - 14, fps, config: {damping: 9, stiffness: 150}});
  return (
    <AbsoluteFill>
      <Background />
      <Brand />
      <div style={{position: 'absolute', left: 80, right: 80, top: 360, height: 640, borderRadius: 36, overflow: 'hidden', border: `6px solid ${C.lime}`, boxShadow: '0 30px 80px rgba(0,0,0,.45)'}}>
        <KenBurns src="dojeong.jpg" frames={165} position="center 22%" style={{width: '100%', height: '100%'}} />
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, padding: '60px 32px 24px', background: 'linear-gradient(transparent, rgba(10,29,46,.85))', fontFamily, fontWeight: 700, fontSize: 36, color: '#fff'}}>
          2026.11.24 · 도정질문
        </div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1010, textAlign: 'center', fontFamily, fontWeight: 900, fontSize: 250, lineHeight: 1, letterSpacing: '-0.05em', color: C.orange, transform: `scale(${0.6 + 0.4 * pop})`, textShadow: `0 0 70px ${C.orange}55`}}>
        <CountUp to={34} delay={10} duration={30} suffix="%" />
      </div>
      <div style={{position: 'absolute', left: 40, right: 40, top: 1280}}>
        <WordPop text="줄었습니다" size={104} delay={40} />
      </div>
      <Small top={1440} delay={60} size={42}>
        감소 원인 확인과<br />추가 재원 마련을 요구했습니다
      </Small>
    </AbsoluteFill>
  );
};

/* 5. 19~25초 — 취업·정착까지 추적 */
const S5: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const items = [
    {label: '도내 취업률', Icon: IconChart},
    {label: '취업 유지율', Icon: IconBriefcase},
    {label: '지역 정착', Icon: IconHome},
  ];
  return (
    <AbsoluteFill>
      <Background hue="teal" />
      <Brand />
      <div style={{position: 'absolute', left: 30, right: 30, top: 360}}>
        <WordPop text={'취업·정착까지 *추적*'} size={100} delay={4} />
      </div>
      <FadeUp delay={8} style={{position: 'absolute', left: 90, right: 90, top: 530, height: 380, borderRadius: 30, overflow: 'hidden', border: `3px solid ${C.mist}44`}}>
        <KenBurns src="festa.jpg" frames={180} from={1.02} to={1.14} style={{width: '100%', height: '100%'}} />
      </FadeUp>
      <div style={{position: 'absolute', left: 110, right: 110, top: 960, display: 'flex', flexDirection: 'column', gap: 30}}>
        {items.map(({label, Icon}, i) => {
          const at = 30 + i * 30;
          const s = spring({frame: f - at, fps, config: {damping: 11, stiffness: 170}});
          const inS = spring({frame: f - 10 - i * 6, fps, config: {damping: 200}});
          return (
            <div key={label} style={{display: 'flex', alignItems: 'center', gap: 30, padding: '26px 34px', borderRadius: 28, background: s > 0.5 ? `${C.lime}1c` : C.card, border: `3px solid ${s > 0.5 ? C.lime : '#ffffff22'}`, transform: `translateX(${(1 - inS) * 120}px)`, opacity: inS}}>
              <Icon size={84} color={s > 0.5 ? C.lime : C.mist} stroke={8} />
              <div style={{flex: 1, fontFamily, fontWeight: 700, fontSize: 58, color: '#fff'}}>{label}</div>
              <div style={{width: 88, height: 88, borderRadius: '50%', background: C.lime, display: 'grid', placeItems: 'center', transform: `scale(${s})`}}>
                <IconCheck size={62} color={C.navy} stroke={12} />
              </div>
            </div>
          );
        })}
      </div>
      <Small top={1550} delay={110} size={42}>
        졸업생의 도내 취업·유지·정착으로<br />성과를 평가하자고 제안했습니다
      </Small>
    </AbsoluteFill>
  );
};

/* 6. 25~30초 — 슬로건 + 문의처 + AI 제작 표기 */
const S6: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const lk = spring({frame: f - 4, fps, config: {damping: 10, stiffness: 120}});
  const beat = f > 40 && f < 58 ? 1 + 0.07 * Math.sin(((f - 40) / 18) * Math.PI) : 1;
  return (
    <AbsoluteFill>
      <Background />
      <div style={{position: 'absolute', left: 0, right: 0, top: 340, display: 'flex', justifyContent: 'center', transform: `scale(${(0.6 + 0.4 * lk) * beat})`, opacity: lk}}>
        <Img src={staticFile('logo-tiger.svg')} style={{width: 250, height: 250}} />
      </div>
      <div style={{position: 'absolute', left: 30, right: 30, top: 650}}>
        <WordPop text={'청년이 남는\n*충남*'} size={124} delay={10} />
      </div>
      <FadeUp delay={34} style={{position: 'absolute', left: 80, right: 80, top: 990, textAlign: 'center', fontFamily, fontWeight: 700, fontSize: 50, lineHeight: 1.5, color: '#fff'}}>
        진심으로 듣고,<br /><span style={{color: C.lime}}>정책으로</span> 답하겠습니다
      </FadeUp>
      <FadeUp delay={46} style={{position: 'absolute', left: 0, right: 0, top: 1190, textAlign: 'center', fontFamily, fontWeight: 500, fontSize: 40, color: C.mist}}>
        진성범 충남도의원 · 기획경제위원회
      </FadeUp>
      <FadeUp delay={54} style={{position: 'absolute', left: 130, right: 130, top: 1280, padding: '30px 0', borderRadius: 28, background: C.lime, color: C.navy, fontFamily, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 18, fontWeight: 900, fontSize: 60}}><IconPhone size={56} color={C.navy} stroke={9} />041-635-5224</div>
        <div style={{display: 'flex', alignItems: 'center', gap: 16, fontWeight: 700, fontSize: 46}}><IconGlobe size={46} color={C.navy} stroke={8} />jinsim1.kr</div>
      </FadeUp>
      <FadeUp delay={64} style={{position: 'absolute', left: 0, right: 0, top: 1580, textAlign: 'center', fontFamily, fontWeight: 500, fontSize: 32, color: '#8fa3b1'}}>
        AI를 활용해 제작
      </FadeUp>
    </AbsoluteFill>
  );
};

const SCENES: {from: number; dur: number; C: React.FC; enter: 'slide' | 'zoom' | 'none'}[] = [
  {from: 0, dur: 90, C: S1, enter: 'none'},
  {from: 90, dur: 150, C: S2, enter: 'slide'},
  {from: 240, dur: 180, C: S3, enter: 'zoom'},
  {from: 420, dur: 150, C: S4, enter: 'slide'},
  {from: 570, dur: 180, C: S5, enter: 'zoom'},
  {from: 750, dur: 150, C: S6, enter: 'slide'},
];

export const AnchorShort: React.FC = () => {
  const {durationInFrames} = useVideoConfig();
  return (
    <AbsoluteFill style={{background: C.navy}}>
      {SCENES.map(({from, dur, C: Scene, enter}, i) => {
        const start = i === 0 ? 0 : from - T;
        const length = dur + (i === 0 ? 0 : T);
        return (
          <Sequence key={i} from={start} durationInFrames={length} premountFor={30}>
            <Enter type={enter}>
              <Scene />
            </Enter>
          </Sequence>
        );
      })}
      <Audio
        src={staticFile('bgm.mp3')}
        volume={(f) => 0.32 * interpolate(f, [0, 8, durationInFrames - 60, durationInFrames], [0, 1, 1, 0], clamp)}
      />
    </AbsoluteFill>
  );
};
