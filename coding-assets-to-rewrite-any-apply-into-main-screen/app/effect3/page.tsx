'use client';

import { WebGPUCanvas } from '@/components/canvas';
import { useAspect, useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Tomorrow } from 'next/font/google';
import gsap from 'gsap';
import { useRouter, useSearchParams } from 'next/navigation';

import {
  abs,
  blendScreen,
  float,
  Fn,
  max,
  mod,
  oneMinus,
  select,
  ShaderNodeObject,
  smoothstep,
  sub,
  texture,
  uniform,
  uv,
  vec2,
  vec3,
} from 'three/tsl';

import * as THREE from 'three/webgpu';
import { useGSAP } from '@gsap/react';
import { PostProcessing } from '@/components/post-processing';
import { ContextProvider, GlobalContext } from '@/context';

const tomorrow = Tomorrow({
  weight: '600',
  subsets: ['latin'],
});

const WIDTH = 1226;
const HEIGHT = 650;

const sdCross = Fn(
  ([p_immutable, b_immutable, r_immutable]: ShaderNodeObject<THREE.Node>[]) => {
    const r = float(r_immutable).toVar();
    const b = vec2(b_immutable).toVar();
    const p = vec2(p_immutable).toVar();
    p.assign(abs(p));
    p.assign(select(p.y.greaterThan(p.x), p.yx, p.xy));
    const q = vec2(p.sub(b)).toVar();
    const k = float(max(q.y, q.x)).toVar();
    const w = vec2(
      select(k.greaterThan(0.0), q, vec2(b.y.sub(p.x), k.negate()))
    ).toVar();
    const d = float(max(w, 0.0).length()).toVar();

    return select(k.greaterThan(0.0), d, d.negate()).add(r);
  }
);

const assetSetCount = 5;
const assetSets = Array.from({ length: assetSetCount }, (_, i) => `pictures_${i + 1}`);
type AssetSet = string;
const assetMap: Record<AssetSet, { raw: string; depth: string }> = {
  pictures_1: { raw: require('../../assets/pictures_1/raw-3.jpg').default.src, depth: require('../../assets/pictures_1/depth-3.png').default.src },
  pictures_2: { raw: require('../../assets/pictures_2/raw-3.jpg').default.src, depth: require('../../assets/pictures_2/depth-3.png').default.src },
  pictures_3: { raw: require('../../assets/pictures_3/raw-3.jpg').default.src, depth: require('../../assets/pictures_3/depth-3.png').default.src },
  pictures_4: { raw: require('../../assets/pictures_4/raw-3.jpg').default.src, depth: require('../../assets/pictures_4/depth-3.png').default.src },
  pictures_5: { raw: require('../../assets/pictures_5/raw-3.jpg').default.src, depth: require('../../assets/pictures_5/depth-3.png').default.src },
};

const Scene = ({ assetSet }: { assetSet: AssetSet }) => {
  const { setIsLoading } = useContext(GlobalContext);
  const rawMapPath = assetMap[assetSet].raw;
  const depthMapPath = assetMap[assetSet].depth;
  const [rawMap, depthMap] = useTexture([rawMapPath, depthMapPath], () => {
    setIsLoading(false);
    rawMap.colorSpace = THREE.SRGBColorSpace;
  });

  // Use state for deterministic color
  const [avgColor, setAvgColor] = useState<[number, number, number]>([0.9, 0.39, 0.12]); // fallback color
  useEffect(() => {
    let cancelled = false;
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.src = rawMapPath;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      const data = ctx.getImageData(0, 0, img.width, img.height).data;
      let r = 0, g = 0, b = 0;
      for (let i = 0; i < data.length; i += 4) {
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
      }
      const pixelCount = data.length / 4;
      let avg = [r / pixelCount / 255, g / pixelCount / 255, b / pixelCount / 255];
      const boost = 1.25;
      avg = avg.map((v) => Math.min(1, v * boost));
      if (!cancelled) setAvgColor(avg as [number, number, number]);
    };
    return () => { cancelled = true; };
  }, [rawMapPath]);

  const { material, uniforms } = useMemo(() => {
    const uPointer = uniform(new THREE.Vector2(0));
    const uProgress = uniform(0);
    // Use avgColor from state
    const uAvgColor = uniform(new THREE.Vector3(avgColor[0], avgColor[1], avgColor[2]));
    const strength = 0.01;
    const tDepthMap = texture(depthMap);
    const aspect = float(WIDTH).div(HEIGHT);
    const tUv = vec2(uv().x.mul(aspect), uv().y);
    const tiling = vec2(50.0);
    const tiledUv = mod(tUv.mul(tiling), 2.0).sub(1.0);
    const dist = sdCross(tiledUv, vec2(0.3, 0.02), 0.0);
    const cross = vec3(smoothstep(0.0, 0.02, dist));
    const depth = oneMinus(tDepthMap);
    const flow = sub(1, smoothstep(0, 0.02, abs(depth.sub(uProgress))));
    // Use the sampled average color for the mask, boost brightness
    const mask = oneMinus(cross).mul(flow).mul(vec3(uAvgColor.x, uAvgColor.y, uAvgColor.z).mul(1.5));
    const tMap = texture(
      rawMap,
      uv().add(tDepthMap.r.mul(uPointer).mul(strength))
    ).mul(0.5);
    const final = blendScreen(tMap, mask);
    const material = new THREE.MeshBasicNodeMaterial({
      colorNode: final,
    });
    return {
      material,
      uniforms: {
        uPointer,
        uProgress,
        uAvgColor,
      },
    };
  }, [rawMap, depthMap, avgColor]);

  const [w, h] = useAspect(WIDTH, HEIGHT);

  useGSAP(() => {
    gsap.to(uniforms.uProgress, {
      value: 0.9,
      repeat: -1,
      yoyo: true,
      duration: 4.5, // smooth, continuous
      ease: 'power1.inOut', // smooth ease for both ends
      repeatDelay: 0, // no freeze
    });
  }, [uniforms.uProgress]);

  useFrame(({ pointer }) => {
    uniforms.uPointer.value = pointer;
  });

  return (
    <mesh scale={[w, h, 1]} material={material}>
      <planeGeometry />
    </mesh>
  );
};

const Html = () => {
  const { isLoading } = useContext(GlobalContext);
  const router = useRouter();
  const searchParams = useSearchParams();
  // Get assetSet from query param, fallback to pictures_1
  const initialAssetSet = searchParams.get('set') || 'pictures_1';
  const [assetSet, setAssetSet] = useState<AssetSet>(initialAssetSet);

  // When assetSet changes, update the URL query param (shallow)
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('set', assetSet);
    router.replace(url.pathname + url.search);
  }, [assetSet, router]);

  useGSAP(() => {
    if (!isLoading) {
      gsap
        .timeline()
        .to('[data-loader]', {
          opacity: 0,
        })
        .from('[data-title]', {
          yPercent: -100,
          stagger: {
            each: 0.15,
          },
          ease: 'power1.out',
        })
        .from('[data-desc]', {
          opacity: 0,
          yPercent: 100,
        });
    }
  }, [isLoading]);

  return (
    <div>
      <div
        className="h-svh fixed z-90 bg-gray-500 pointer-events-none w-full flex justify-center items-center"
        data-loader
      >
        <div className="w-6 h-6 bg-white animate-ping rounded-full"></div>
      </div>
      <div className="h-svh">
        <div className="h-svh uppercase items-center w-full absolute z-60 pointer-events-none px-10 flex justify-center flex-col">
          {/* <div
            className="text-xl md:text-4xl xl:text-6xl 2xl:text-7xl"
            style={{
              ...tomorrow.style,
            }}
          >
            <div className="flex space-x-2 lg:space-x-6 overflow-hidden">
              {'Embrace Nature’s Rhythm'.split(' ').map((word, index) => {
                return (
                  <div data-title key={index}>
                    {word}
                  </div>
                );
              })}
            </div>
          </div>

          <div className=" text-center text-xs md:text-xl xl:text-2xl 2xl:text-3xl mt-2 overflow-hidden">
            <div data-desc>
              <div>where one endless road leads to an uncertain future.</div>
            </div>
          </div> */}
        </div>

        <WebGPUCanvas>
          <PostProcessing></PostProcessing>
          <Scene assetSet={assetSet}></Scene>
        </WebGPUCanvas>

        <div className="absolute top-4 right-4 z-50 flex flex-col gap-2 pointer-events-auto">
          <div className="flex gap-2">
            <button className="px-3 py-1 rounded bg-gray-800 text-white hover:bg-indigo-600 transition" onClick={() => router.push(`/effect1?set=${assetSet}`)}>Effect 1</button>
            <button className="px-3 py-1 rounded bg-gray-800 text-white hover:bg-indigo-600 transition" onClick={() => router.push(`/effect2?set=${assetSet}`)}>Effect 2</button>
            <button className="px-3 py-1 rounded bg-gray-800 text-white hover:bg-indigo-600 transition" onClick={() => router.push(`/effect3?set=${assetSet}`)}>Effect 3</button>
          </div>
          <div className="flex gap-2 mt-1">
            {assetSets.map((set, idx) => (
              <button
                key={set}
                className={`px-3 py-1 ${idx === 0 ? 'rounded-l' : ''} ${idx === assetSets.length - 1 ? 'rounded-r' : ''} ${assetSet === set ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-200'} transition`}
                onClick={() => setAssetSet(set)}
              >
                {`Load Set ${idx + 1}`}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Page() {
  return (
    <ContextProvider>
      <Html></Html>
    </ContextProvider>
  );
}
