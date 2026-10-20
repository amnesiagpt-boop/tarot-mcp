import { useState } from "react";

/** The web table is a full document, with the same navigation as the site. */
export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className="site-header">
      <a className="site-brand" href="/" aria-label="Код души — главная">
        <span className="site-brand-mark" aria-hidden="true" />
        КОД ДУШИ
      </a>
      <nav
        aria-label="Главное меню"
        className={menuOpen ? "is-open" : undefined}
      >
        <a href="/?page=features">Возможности</a>
        <a href="/?page=examples">Примеры</a>
        <a href="/?page=pricing">Тарифы</a>
        <a href="/?page=faq">FAQ</a>
        <a href="/draw/?view=readings">Мои расклады</a>
      </nav>
      <a className="site-library" href="/?page=library">
        Мои расчёты
      </a>
      <a className="site-create" href="/?page=natal">
        Создать карту →
      </a>
      <button
        type="button"
        className="site-menu"
        aria-label="Открыть меню"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        ☰
      </button>
    </header>
  );
}
