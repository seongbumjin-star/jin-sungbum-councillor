import React from 'react';
import {Composition} from 'remotion';
import {AnchorShort} from './AnchorShort';
import {SongVideo} from './SongVideo';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="AnchorShort" component={AnchorShort} durationInFrames={900} fps={30} width={1080} height={1920} />
    {/* 기본금융 노래(SUNO 제작 mp3, 112.39초) */}
    <Composition id="SongBasicFinance" component={SongVideo} durationInFrames={3372} fps={30} width={1080} height={1920} />
  </>
);
