import React, { useCallback, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { GestureResponderEvent, LayoutChangeEvent, PanResponder, Platform, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Svg, { G, Path } from 'react-native-svg';
import { colors } from '@/theme/tokens';
import { BORDER_PATH, EUROPE_DETAIL_PATH, LAND_PATH } from './worldPaths';

/**
 * Lightweight vector map (Web Mercator) with pan, pinch and zoom.
 * Works on iOS, Android and web with no API key. The MapProvider seam lets a
 * production build swap in Mapbox / Google Maps (see docs/ARCHITECTURE.md).
 */

export const TILE = 256;
export function project(lat: number, lon: number) {
  const x = ((lon + 180) / 360) * TILE;
  const s = Math.sin((Math.max(-85, Math.min(85, lat)) * Math.PI) / 180);
  const y = (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * TILE;
  return { x, y };
}
export function unproject(x: number, y: number) {
  const lon = (x / TILE) * 360 - 180;
  const n = Math.PI - (2 * Math.PI * y) / TILE;
  const lat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
  return { lat, lon };
}

export interface Viewport { cx: number; cy: number; k: number; w: number; h: number }

export interface MapApi {
  flyTo: (lat: number, lon: number, zoom?: number) => void;
  zoomBy: (f: number) => void;
  getBounds: () => { north: number; south: number; east: number; west: number };
  getZoom: () => number;
}

export interface GeoMapProps {
  initial: { lat: number; lon: number; zoom: number };
  style?: StyleProp<ViewStyle>;
  minZoom?: number;
  maxZoom?: number;
  /** SVG content in screen coordinates, drawn above the land. */
  renderSvg?: (vp: Viewport, toScreen: (lat: number, lon: number) => { x: number; y: number }) => React.ReactNode;
  /** RN views (touchable markers) in screen coordinates. */
  renderMarkers?: (vp: Viewport, toScreen: (lat: number, lon: number) => { x: number; y: number }) => React.ReactNode;
  onViewportChange?: (vp: Viewport) => void;
  landColor?: string;
  waterColor?: string;
  graticule?: boolean;
  apiRef?: React.Ref<MapApi>;
}

const dist = (t: { pageX: number; pageY: number }[]) => Math.hypot(t[0].pageX - t[1].pageX, t[0].pageY - t[1].pageY);

export function GeoMap({ initial, style, minZoom = 1, maxZoom = 15, renderSvg, renderMarkers, onViewportChange, landColor = '#101B2F', waterColor = colors.bg, graticule = true, apiRef }: GeoMapProps) {
  const p0 = project(initial.lat, initial.lon);
  const [vp, setVp] = useState<Viewport>({ cx: p0.x, cy: p0.y, k: Math.pow(2, initial.zoom), w: 0, h: 0 });
  const vpRef = useRef(vp);
  vpRef.current = vp;
  const gesture = useRef<{ x: number; y: number; d?: number; cx: number; cy: number; k: number; moved: boolean }>({ x: 0, y: 0, cx: 0, cy: 0, k: 1, moved: false });
  const minK = Math.pow(2, minZoom), maxK = Math.pow(2, maxZoom);

  const update = useCallback((next: Partial<Viewport>) => {
    const v = { ...vpRef.current, ...next };
    v.k = Math.max(minK, Math.min(maxK, v.k));
    v.cx = Math.max(0, Math.min(TILE, v.cx));
    v.cy = Math.max(8, Math.min(TILE - 8, v.cy));
    vpRef.current = v;
    setVp(v);
    onViewportChange?.(v);
  }, [minK, maxK, onViewportChange]);

  useImperativeHandle(apiRef, () => ({
    flyTo: (lat, lon, zoom) => {
      const p = project(lat, lon);
      const start = { ...vpRef.current };
      const endK = zoom !== undefined ? Math.pow(2, zoom) : start.k;
      const t0 = Date.now();
      const step = () => {
        const t = Math.min(1, (Date.now() - t0) / 650);
        const e = 1 - Math.pow(1 - t, 3);
        update({ cx: start.cx + (p.x - start.cx) * e, cy: start.cy + (p.y - start.cy) * e, k: Math.exp(Math.log(start.k) + (Math.log(endK) - Math.log(start.k)) * e) });
        if (t < 1) requestAnimationFrame(step);
      };
      step();
    },
    zoomBy: (f) => {
      const start = vpRef.current.k;
      const t0 = Date.now();
      const step = () => {
        const t = Math.min(1, (Date.now() - t0) / 250);
        update({ k: start * Math.pow(f, t) });
        if (t < 1) requestAnimationFrame(step);
      };
      step();
    },
    getBounds: () => {
      const v = vpRef.current;
      const nw = unproject(v.cx - v.w / 2 / v.k, v.cy - v.h / 2 / v.k);
      const se = unproject(v.cx + v.w / 2 / v.k, v.cy + v.h / 2 / v.k);
      return { north: nw.lat, west: nw.lon, south: se.lat, east: se.lon };
    },
    getZoom: () => Math.log2(vpRef.current.k),
  }), [update]);

  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_e, g) => Math.abs(g.dx) > 3 || Math.abs(g.dy) > 3 || g.numberActiveTouches > 1,
        onPanResponderGrant: (e: GestureResponderEvent) => {
          const t = e.nativeEvent.touches;
          const v = vpRef.current;
          gesture.current = { x: e.nativeEvent.pageX, y: e.nativeEvent.pageY, cx: v.cx, cy: v.cy, k: v.k, d: t.length > 1 ? dist(t as never) : undefined, moved: false };
        },
        onPanResponderMove: (e, g) => {
          const t = e.nativeEvent.touches;
          const s = gesture.current;
          s.moved = true;
          if (t.length > 1) {
            const d = dist(t as never);
            if (!s.d) { s.d = d; s.k = vpRef.current.k; s.cx = vpRef.current.cx; s.cy = vpRef.current.cy; return; }
            update({ k: s.k * (d / s.d) });
          } else {
            if (s.d) { s.d = undefined; s.x = e.nativeEvent.pageX - g.dx; s.y = e.nativeEvent.pageY - g.dy; s.cx = vpRef.current.cx + g.dx / vpRef.current.k; s.cy = vpRef.current.cy + g.dy / vpRef.current.k; }
            update({ cx: s.cx - g.dx / vpRef.current.k, cy: s.cy - g.dy / vpRef.current.k });
          }
        },
        onPanResponderTerminationRequest: () => false,
      }),
    [update],
  );

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    update({ w: width, h: height });
  };

  const toScreen = useCallback((lat: number, lon: number) => {
    const p = project(lat, lon);
    const v = vpRef.current;
    return { x: (p.x - v.cx) * v.k + v.w / 2, y: (p.y - v.cy) * v.k + v.h / 2 };
  }, []);

  const tx = vp.w / 2 - vp.cx * vp.k;
  const ty = vp.h / 2 - vp.cy * vp.k;
  const zoom = Math.log2(vp.k);

  // Graticule every 10° (or 1° when zoomed in).
  const grat = useMemo(() => {
    if (!graticule) return '';
    const step = zoom > 6 ? 1 : zoom > 4 ? 5 : 15;
    let d = '';
    for (let lon = -180; lon <= 180; lon += step) {
      const a = project(80, lon), b = project(-80, lon);
      d += `M${a.x} ${a.y}L${b.x} ${b.y}`;
    }
    for (let lat = -75; lat <= 75; lat += step) {
      const a = project(lat, -180), b = project(lat, 180);
      d += `M${a.x} ${a.y}L${b.x} ${b.y}`;
    }
    return d;
  }, [graticule, zoom]);

  const webWheel = Platform.OS === 'web'
    ? ({ onWheel: (e: { deltaY: number; preventDefault?: () => void }) => { update({ k: vpRef.current.k * (e.deltaY > 0 ? 0.9 : 1.1) }); } } as object)
    : {};

  return (
    <View style={[{ overflow: 'hidden', backgroundColor: waterColor }, style]} onLayout={onLayout} {...responder.panHandlers} {...webWheel}>
      {vp.w > 0 && (
        <>
          <Svg width={vp.w} height={vp.h} style={StyleSheet.absoluteFill} pointerEvents="none">
            <G transform={`translate(${tx} ${ty}) scale(${vp.k})`}>
              {!!grat && <Path d={grat} stroke={colors.primary} strokeOpacity={0.07} strokeWidth={1 / vp.k} fill="none" />}
              <Path d={LAND_PATH} fill={landColor} />
              {zoom > 4 && <Path d={EUROPE_DETAIL_PATH} fill={landColor} />}
              <Path d={BORDER_PATH} stroke={colors.primary} strokeOpacity={0.22} strokeWidth={0.9 / vp.k} fill="none" />
            </G>
            {renderSvg?.(vp, toScreen)}
          </Svg>
          <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
            {renderMarkers?.(vp, toScreen)}
          </View>
        </>
      )}
    </View>
  );
}
