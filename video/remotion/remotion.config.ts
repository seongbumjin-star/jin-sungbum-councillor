import {Config} from '@remotion/cli/config';

// 사진·음악은 video/materials 폴더 것만 씁니다.
Config.setPublicDir('../materials');
// 이미 설치된 Chromium(헤드리스)을 씁니다. 없으면 Remotion이 직접 내려받습니다.
Config.setBrowserExecutable(
  process.env.REMOTION_BROWSER ??
    '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell'
);
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(92);
Config.setCodec('h264');
Config.setCrf(18);
