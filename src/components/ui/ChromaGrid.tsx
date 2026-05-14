import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import './ChromaGrid.css';

interface ChromaItem {
  image: string;
  title: string;
  subtitle?: string;
  borderColor?: string;
  gradient?: string;
  url?: string;
}

interface ChromaGridProps {
  items: ChromaItem[];
  className?: string;
  radius?: number;
  columns?: number;
  damping?: number;
  fadeOut?: number;
  ease?: string;
  onItemClick?: (index: number) => void;
}

export default function ChromaGrid({
  items,
  className = '',
  radius = 300,
  columns = 3,
  damping = 0.45,
  fadeOut = 0.6,
  ease = 'power3.out',
  onItemClick,
}: ChromaGridProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const fadeRef = useRef<HTMLDivElement>(null);
  const setX = useRef<((v: number) => void) | null>(null);
  const setY = useRef<((v: number) => void) | null>(null);
  const pos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    setX.current = gsap.quickSetter(el, '--x', 'px');
    setY.current = gsap.quickSetter(el, '--y', 'px');
    const { width, height } = el.getBoundingClientRect();
    pos.current = { x: width / 2, y: height / 2 };
    setX.current(pos.current.x);
    setY.current(pos.current.y);
  }, []);

  const moveTo = (x: number, y: number) => {
    gsap.to(pos.current, {
      x,
      y,
      duration: damping,
      ease,
      onUpdate: () => {
        setX.current?.(pos.current.x);
        setY.current?.(pos.current.y);
      },
      overwrite: true,
    });
  };

  const handleMove = (e: React.PointerEvent) => {
    const r = rootRef.current?.getBoundingClientRect();
    if (!r) return;
    moveTo(e.clientX - r.left, e.clientY - r.top);
    gsap.to(fadeRef.current, { opacity: 0, duration: 0.25, overwrite: true });
  };

  const handleLeave = () => {
    gsap.to(fadeRef.current, { opacity: 1, duration: fadeOut, overwrite: true });
  };

  const handleCardMove = (e: React.MouseEvent) => {
    const card = e.currentTarget as HTMLElement;
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };

  if (!items || items.length === 0) return null;

  const rows = Math.ceil(items.length / columns);

  return (
    <div
      ref={rootRef}
      className={`chroma-grid ${className}`}
      style={{
        '--r': `${radius}px`,
        '--cols': columns,
        '--rows': rows,
      } as React.CSSProperties}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
    >
      {items.map((item, i) => (
        <article
          key={i}
          className="chroma-card"
          onMouseMove={handleCardMove}
          onClick={() => onItemClick?.(i)}
          style={{
            '--card-border': item.borderColor || '#6366f1',
            '--card-gradient': item.gradient || 'linear-gradient(145deg, #1e3a8a, #111)',
            cursor: onItemClick ? 'pointer' : 'default',
          } as React.CSSProperties}
        >
          <div className="chroma-img-wrapper">
            <img src={item.image} alt={item.title} loading="lazy" />
          </div>
          <footer className="chroma-info">
            <h3 className="name">{item.title}</h3>
            {item.subtitle && <p className="role">{item.subtitle}</p>}
          </footer>
        </article>
      ))}
      <div className="chroma-overlay" />
      <div ref={fadeRef} className="chroma-fade" />
    </div>
  );
}
