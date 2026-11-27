# 저작권 걱정 없는 30초 밝은 배경음악을 코드로 합성합니다. (C장조, 112 BPM)
import numpy as np, wave, sys
SR=44100; DUR=30.0; BPM=112; beat=60/BPM
t=np.arange(int(SR*DUR))/SR
out=np.zeros_like(t)
def note(f): return 440*2**((f-69)/12)
def add(start,length,freq,amp,kind='pluck'):
    i0=int(start*SR); n=int(length*SR); i1=min(i0+n,len(out))
    if i0>=len(out): return
    tt=np.arange(i1-i0)/SR
    if kind=='pluck':
        env=np.exp(-tt*6)*(1-np.exp(-tt*200))
        w=np.sin(2*np.pi*freq*tt)+0.35*np.sin(2*np.pi*2*freq*tt)+0.12*np.sin(2*np.pi*3*freq*tt)
    elif kind=='pad':
        env=np.minimum(1,tt/0.4)*np.minimum(1,(length-tt)/0.5)
        w=np.sin(2*np.pi*freq*tt)+0.5*np.sin(2*np.pi*freq*1.003*tt)
    elif kind=='bass':
        env=np.exp(-tt*3)*(1-np.exp(-tt*300))
        w=np.sin(2*np.pi*freq*tt)
    out[i0:i1]+=amp*env*w
# I - V - vi - IV  (C G Am F)
chords=[[60,64,67],[55,59,62],[57,60,64],[53,57,60]]
bars=int(DUR/(beat*4))+1
rng=np.random.default_rng(7)
for b in range(bars):
    c=chords[b%4]; s=b*4*beat
    for v in c: add(s,4*beat,note(v),0.05,'pad')
    add(s,2*beat,note(c[0]-12),0.22,'bass'); add(s+2*beat,2*beat,note(c[0]-12),0.18,'bass')
    arp=[c[0]+12,c[1]+12,c[2]+12,c[1]+12]
    for k in range(8):
        add(s+k*beat/2,0.5,note(arp[k%4]),0.13,'pluck')
    if b%2==1: add(s+3.5*beat,0.4,note(c[2]+24),0.06,'pluck')
# 가벼운 박자(셰이커)
for k in range(int(DUR/(beat/2))):
    i0=int(k*beat/2*SR); n=int(0.05*SR)
    if i0+n<len(out):
        e=np.exp(-np.arange(n)/SR*90); out[i0:i0+n]+=(0.03 if k%2 else 0.015)*e*rng.standard_normal(n)
# 앞 0.3초 페이드인, 끝 2초 페이드아웃
fade=np.ones_like(t); fade[t<0.3]=t[t<0.3]/0.3; m=t>DUR-2; fade[m]=(DUR-t[m])/2
out*=fade; out/=np.max(np.abs(out))*1.12
st=np.stack([out,out],1); pcm=(st*32767).astype(np.int16)
with wave.open(sys.argv[1],'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
