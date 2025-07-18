export default function CriticalCSS() {
  return (
    <style jsx>{`
      /* Critical CSS for above-the-fold content */
      .hero-section {
        min-height: 60vh;
        background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
      }
      
      .property-card-skeleton {
        background: #f3f4f6;
        border-radius: 0.5rem;
        overflow: hidden;
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
      }
      
      .property-card-skeleton::before {
        content: '';
        display: block;
        height: 12rem;
        background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
        background-size: 200% 100%;
        animation: loading 1.5s infinite;
      }
      
      @keyframes loading {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
      
      /* Optimize font loading */
      @font-face {
        font-family: 'Geist';
        font-display: swap;
      }
      
      /* Prevent layout shift */
      .property-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1.5rem;
        min-height: 400px;
      }
      
      /* Critical navigation styles */
      .nav-header {
        position: sticky;
        top: 0;
        z-index: 50;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
      }
    `}</style>
  );
}