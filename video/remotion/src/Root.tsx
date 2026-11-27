import React from 'react';
import {Composition} from 'remotion';
import {AnchorShort} from './AnchorShort';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="AnchorShort"
    component={AnchorShort}
    durationInFrames={900}
    fps={30}
    width={1080}
    height={1920}
  />
);
