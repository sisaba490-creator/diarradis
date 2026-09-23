import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ShoppingBag, Star, Tag, Zap } from 'lucide-react';

type HeroSlide = {
  id: number;
  eyebrow: string;
  eyebrowIcon: string;
  title: string;
  titleHighlight: string;
  description: string;
  buttonLabel: string;
  buttonLink: string;
  badgeLabel: string;
  badgeValue: string;
  image: string;
  tag: string;
  tagSub: string;
  bgGradient: string;
  accentFrom: string;
  accentTo: string;
  btnTextColor: string;
  subColor: string;
  shimmer: string;
  glowColor: string;
};

const slides: HeroSlide[] = [
  {
    id: 0,
    eyebrow: "Collection Cuisine & Électro",
    eyebrowIcon: "🍳",
    title: "Équipez votre",
    titleHighlight: "Bureau",
    description: "tous pour lecteur code barre",
    buttonLabel: "Explorer l'Électroménager",
    buttonLink: "Électroménager",
    badgeLabel: "Garantie produit",
    badgeValue: "12 mois",
    image: "/uploads/imagesjpg_1788005548047_22034.jpg",
    tag: "Lecteur Code barre",
    tagSub: "Livraison express Bamako",
    bgGradient: "radial-gradient(120% 120% at 75% 20%, #881337 0%, #4c0519 45%, #180208 100%)",
    accentFrom: "#fb923c",
    accentTo: "#f43f5e",
    btnTextColor: "#1c0208",
    subColor: "#ffe4e6",
    shimmer: "rgba(251,146,60,0.25)",
    glowColor: "rgba(244,63,94,0.35)",
  },
  {
    id: 1,
    eyebrow: "Offres Flash Exclusives",
    eyebrowIcon: "🔥",
    title: "Téléphonie &",
    titleHighlight: "High-Tech",
    description: "Smartphones, tablettes, accessoires — les meilleures marques à prix imbattables, livrés chez vous.",
    buttonLabel: "Voir les offres",
    buttonLink: "Téléphonie",
    badgeLabel: "Économisez jusqu'à",
    badgeValue: "-30%",
    image: "https://images.pexels.com/photos/947407/pexels-photo-947407.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    tag: "Samsung & Apple",
    tagSub: "Stock limité — Commandez vite",
    bgGradient: "radial-gradient(120% 120% at 75% 20%, #1e1b4b 0%, #0f172a 45%, #020617 100%)",
    accentFrom: "#38bdf8",
    accentTo: "#818cf8",
    btnTextColor: "#020617",
    subColor: "#c7d2fe",
    shimmer: "rgba(56,189,248,0.25)",
    glowColor: "rgba(99,102,241,0.35)",
  },
  {
    id: 2,
    eyebrow: "Nouveautés 2026",
    eyebrowIcon: "⚡",
    title: "DIARRA",
    titleHighlight: "Distribution",
    description: "Le meilleur de l'électroménager et de l'électronique, sélectionné pour votre quotidien au Mali.",
    buttonLabel: "Découvrir la boutique",
    buttonLink: "boutique",
    badgeLabel: "Clients satisfaits",
    badgeValue: "+2 000",
    image: "https://images.pexels.com/photos/5556176/pexels-photo-5556176.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    tag: "Réfrigérateur Pro",
    tagSub: "Le choix N°1 à Bamako",
    bgGradient: "radial-gradient(120% 120% at 75% 20%, #065f46 0%, #064e3b 45%, #022c22 100%)",
    accentFrom: "#fbbf24",
    accentTo: "#f59e0b",
    btnTextColor: "#022c22",
    subColor: "#d1fae5",
    shimmer: "rgba(251,191,36,0.22)",
    glowColor: "rgba(16,185,129,0.25)",
  },
];

type HeroBannerProps = {
  onNavigate: (category: string) => void;
  siteSettings?: Record<string, string>;
  resetTrigger?: number;
};

export function HeroBanner({ onNavigate, siteSettings = {}, resetTrigger = 0 }: HeroBannerProps) {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const [shimmerPos, setShimmerPos] = useState(0);
  const currentRef = useRef(0);
  const isHoveredRef = useRef(false);
  const timerRef = useRef<any>(null);

  // Synchronisation continue du ref avec l'état courant
  currentRef.current = current;

  // Activé par défaut — désactivé seulement si l'admin met explicitement 'false'
  const isAutoRotate = siteSettings?.hero_autorotate !== 'false';

  // Ref stable vers goTo pour éviter les stale closures dans setInterval
  const goToRef = useRef<(index: number, dir: 'next' | 'prev') => void>(() => {});

  const goTo = (index: number, dir: 'next' | 'prev') => {
    setAnimating(true);
    setDirection(dir);
    setTimeout(() => {
      setCurrent(index);
      currentRef.current = index;
      setAnimating(false);
    }, 380);
  };

  // Mettre à jour la ref à chaque render pour avoir toujours la dernière version
  goToRef.current = goTo;

  // Démarrer / redémarrer le timer selon le réglage auto-rotation
  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (!isAutoRotate) return;
    timerRef.current = setInterval(() => {
      if (!isHoveredRef.current) {
        const nextIdx = (currentRef.current + 1) % slides.length;
        goToRef.current(nextIdx, 'next');
      }
    }, 5000);
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isAutoRotate]);

  // Revenir instantanément au slide 0 quand l'utilisateur clique sur Accueil
  useEffect(() => {
    if (resetTrigger > 0) {
      setCurrent(0);
      currentRef.current = 0;
      setAnimating(false);
    }
  }, [resetTrigger]);

  const goNext = () => {
    const nextIdx = (currentRef.current + 1) % slides.length;
    goTo(nextIdx, 'next');
  };

  const goPrev = () => {
    const prevIdx = (currentRef.current - 1 + slides.length) % slides.length;
    goTo(prevIdx, 'prev');
  };

  // Balayage lumineux diagonal continu
  useEffect(() => {
    let frame: number;
    let pos = -200;
    const animate = () => {
      pos += 1.8;
      if (pos > 110) pos = -200;
      setShimmerPos(pos);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  // Override slide data with admin settings if defined
  const rawSlide = slides[current];
  const slide: HeroSlide = {
    ...rawSlide,
    eyebrow: siteSettings[`hero_slide${current}_eyebrow`] !== undefined && siteSettings[`hero_slide${current}_eyebrow`] !== ''
      ? siteSettings[`hero_slide${current}_eyebrow`]
      : rawSlide.eyebrow,
    eyebrowIcon: siteSettings[`hero_slide${current}_eyebrow_icon`] !== undefined && siteSettings[`hero_slide${current}_eyebrow_icon`] !== ''
      ? siteSettings[`hero_slide${current}_eyebrow_icon`]
      : rawSlide.eyebrowIcon,
    title: siteSettings[`hero_slide${current}_title`] !== undefined && siteSettings[`hero_slide${current}_title`] !== ''
      ? siteSettings[`hero_slide${current}_title`]
      : rawSlide.title,
    titleHighlight: siteSettings[`hero_slide${current}_title_hl`] !== undefined && siteSettings[`hero_slide${current}_title_hl`] !== ''
      ? siteSettings[`hero_slide${current}_title_hl`]
      : rawSlide.titleHighlight,
    description: siteSettings[`hero_slide${current}_desc`] !== undefined && siteSettings[`hero_slide${current}_desc`] !== ''
      ? siteSettings[`hero_slide${current}_desc`]
      : rawSlide.description,
    buttonLabel: siteSettings[`hero_slide${current}_btn_label`] !== undefined && siteSettings[`hero_slide${current}_btn_label`] !== ''
      ? siteSettings[`hero_slide${current}_btn_label`]
      : rawSlide.buttonLabel,
    buttonLink: siteSettings[`hero_slide${current}_btn_link`] !== undefined && siteSettings[`hero_slide${current}_btn_link`] !== ''
      ? siteSettings[`hero_slide${current}_btn_link`]
      : rawSlide.buttonLink,
    badgeValue: siteSettings[`hero_slide${current}_badge_val`] !== undefined && siteSettings[`hero_slide${current}_badge_val`] !== ''
      ? siteSettings[`hero_slide${current}_badge_val`]
      : rawSlide.badgeValue,
    badgeLabel: siteSettings[`hero_slide${current}_badge_label`] !== undefined && siteSettings[`hero_slide${current}_badge_label`] !== ''
      ? siteSettings[`hero_slide${current}_badge_label`]
      : rawSlide.badgeLabel,
    image: siteSettings[`hero_slide${current}_image`] || rawSlide.image,
    tag: siteSettings[`hero_slide${current}_tag`] !== undefined && siteSettings[`hero_slide${current}_tag`] !== ''
      ? siteSettings[`hero_slide${current}_tag`]
      : rawSlide.tag,
    tagSub: siteSettings[`hero_slide${current}_tagsub`] !== undefined && siteSettings[`hero_slide${current}_tagsub`] !== ''
      ? siteSettings[`hero_slide${current}_tagsub`]
      : rawSlide.tagSub,
  };

  return (
    <section 
      className="hero-banner" 
      aria-label="Bannière principale"
      style={{
        background: slide.bgGradient,
        transition: 'background 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      onMouseEnter={() => { isHoveredRef.current = true; }}
      onMouseLeave={() => { isHoveredRef.current = false; }}
    >
      {/* Fond dégradé dynamique avec transition fluide */}
      <div 
        className="hero-bg-layer" 
        style={{
          background: `radial-gradient(ellipse 60% 50% at 80% 30%, ${slide.glowColor} 0%, transparent 70%)`,
          transition: 'background 0.8s ease-in-out',
        }}
      />
      <div
        className="hero-shimmer-sweep"
        style={{
          left: `${shimmerPos}%`,
          background: `linear-gradient(105deg, transparent 0%, ${slide.shimmer} 50%, transparent 100%)`,
        }}
      />

      {/* Particules déco */}
      <div className="hero-particles">
        {[...Array(8)].map((_, i) => (
          <div key={i} className={`hero-particle particle-${i}`} style={{ background: slide.accentFrom }} />
        ))}
      </div>

      {/* Grille dot background */}
      <div className="hero-dot-grid" />

      {/* Contenu du slide */}
      <div className={`hero-slide-content ${animating ? `slide-exit-${direction}` : 'slide-enter'}`}>
        {/* Zone texte */}
        <div className="hero-text-zone">
          <span className="hero-eyebrow-badge" style={{ borderColor: `${slide.accentFrom}55`, color: slide.accentFrom }}>
            <span>{slide.eyebrowIcon}</span>
            {slide.eyebrow}
          </span>

          <h1 className="hero-headline">
            {slide.title}{' '}
            <span
              className="hero-headline-hl"
              style={{
                backgroundImage: `linear-gradient(135deg, ${slide.accentFrom} 0%, ${slide.accentTo} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {slide.titleHighlight}
            </span>
          </h1>

          <p className="hero-sub" style={{ color: slide.subColor }}>{slide.description}</p>

          <div className="hero-actions">
            <button
              className="hero-cta-btn"
              style={{
                background: `linear-gradient(135deg, ${slide.accentFrom} 0%, ${slide.accentTo} 100%)`,
                color: slide.btnTextColor,
                boxShadow: `0 12px 30px ${slide.shimmer.replace('0.22', '0.6').replace('0.25', '0.6')}`,
              }}
              onClick={() => onNavigate(slide.buttonLink)}
            >
              <ShoppingBag size={17} />
              {slide.buttonLabel}
              <ArrowRight size={16} className="cta-arrow" />
            </button>

            <div className="hero-stat-pill">
              <span className="hero-stat-value" style={{ color: slide.accentFrom }}>
                {slide.badgeValue}
              </span>
              <span className="hero-stat-label" style={{ color: slide.subColor }}>{slide.badgeLabel}</span>
            </div>
          </div>

          {/* Trust badges */}
          <div className="hero-trust-row">
            <span className="trust-chip" style={{ color: slide.subColor }}><Star size={12} fill="currentColor" /> Qualité garantie</span>
            <span className="trust-chip" style={{ color: slide.subColor }}><Zap size={12} /> Livraison rapide</span>
            <span className="trust-chip" style={{ color: slide.subColor }}><Tag size={12} /> Prix imbattables</span>
          </div>
        </div>

        {/* Zone image */}
        <div className="hero-visual-zone">
          {/* Cercle brillant rotatif */}
          <div className="hero-glow-ring" style={{ boxShadow: `0 0 0 2px ${slide.accentFrom}44, 0 0 80px ${slide.glowColor}` }} />
          <div className="hero-glow-ring inner" style={{ boxShadow: `0 0 0 1px ${slide.accentFrom}22, 0 0 40px ${slide.glowColor}` }} />

          {/* Carte produit */}
          <div className="hero-product-frame">
            <img src={slide.image} alt={slide.tag} className="hero-product-img" />
            <div className="hero-img-overlay" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.2) 0%, transparent 45%)' }} />
          </div>

          {/* Tag flottant */}
          <div className="hero-float-tag">
            <span className="float-dot" style={{ background: slide.accentFrom }} />
            <div>
              <strong>{slide.tag}</strong>
              <small>{slide.tagSub}</small>
            </div>
            <span className="float-arrow" style={{ color: slide.accentTo }}>↗</span>
          </div>

          {/* Badge brillant */}
          <div className="hero-shine-badge" style={{ borderColor: `${slide.accentFrom}66`, background: `linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 100%)` }}>
            <span className="badge-value" style={{ color: slide.accentFrom }}>{slide.badgeValue}</span>
            <small>{slide.badgeLabel}</small>
          </div>
        </div>
      </div>

      {/* Contrôles du carrousel */}
      <button className="hero-nav-btn prev" onClick={goPrev} aria-label="Slide précédent">
        <ArrowLeft size={20} />
      </button>
      <button className="hero-nav-btn next" onClick={goNext} aria-label="Slide suivant">
        <ArrowRight size={20} />
      </button>

      {/* Indicateurs / dots */}
      <div className="hero-dots">
        {slides.map((s, i) => (
          <button
            key={s.id}
            className={`hero-dot ${i === current ? 'active' : ''}`}
            style={i === current ? { background: slide.accentFrom, width: 28 } : {}}
            onClick={() => goTo(i, i > current ? 'next' : 'prev')}
            aria-label={`Aller au slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Barre de progression */}
      <div className="hero-progress-bar">
        <div
          className="hero-progress-fill"
          style={{ background: slide.accentFrom }}
          key={`${current}-${slide.accentFrom}`}
        />
      </div>
    </section>
  );
}
