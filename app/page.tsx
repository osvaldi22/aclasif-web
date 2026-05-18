      {/* FONDO NUEVO ILUSTRADO */}
      <div className="fixed inset-0 z-0">
        <img
          src="/fondo-amazonpy.jpg"
          alt="Fondo AmazonPY"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {mounted && Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-30 bubble-float"
            style={{
              background: ["#FFF", "#F4C400", "#00D084"][i % 3],
              width: `${25 + Math.random() * 30}px`,
              height: `${25 + Math.random() * 30}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDuration: `${4 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        <header className="sticky top-0 z-50 topbar-hero">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-2 py-2 gap-2 md:px-6 md:py-3 md:gap-4">
            <Link href="/" className="brand-3d scale-[0.82] origin-left md:scale-100 flex-shrink-0">
              <span className="brand-by">by:</span>
              <span className="brand-amazon">
                AMAZON<span className="brand-py">PY</span>
              </span>
            </Link>

            <div className="flex-1 max-w-md hidden md:block">
              <input
                type="text"
                placeholder="¿Qué buscas hoy?"
                className="search-hero w-full rounded-full px-6 py-2.5 outline-none text-sm text-slate-700"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-1 md:gap-3 flex-shrink-0">
              {!sessionUser ? (
                <>
                  <Link href="/login" className="nav-action-btn nav-login-btn">
                    <span className="nav-icon-dot">➜</span>
                    <span className="nav-label">Entrar</span>
                  </Link>
                  <Link href="/register" className="nav-action-btn nav-register-btn">
                    <span className="nav-icon-dot">★</span>
                    <span className="nav-label">Registrarme</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/dashboard" className="nav-action-btn nav-panel-btn">
                    <span className="nav-icon-dot">●</span>
                    <span className="nav-label">Mi Panel</span>
                  </Link>
                  <button onClick={logout} className="nav-action-btn nav-logout-btn">
                    <span className="nav-icon-dot">↩</span>
                    <span className="nav-label">Salir</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </header>

        {/* HERO SECTION */}
        <section className="mx-auto max-w-7xl px-3 pt-5 md:px-4 md:pt-8 flex items-center justify-center gap-6">
          <div className="hidden lg:flex flex-col items-center group transition-transform hover:scale-110">
            <a href="https://www.facebook.com/amazon.paraguay" target="_blank" className="bg-white/80 p-4 rounded-full shadow-lg mb-2">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>
            <span className="text-[11px] font-black text-blue-700 uppercase tracking-widest drop-shadow-sm">
              Síguenos
            </span>
          </div>

          <div className="flex-1 max-w-5xl overflow-hidden bg-transparent shadow-none rounded-[26px] md:rounded-[55px]">
            <img
              src="/hero-amazonpy-6.png"
              alt="Banner"
              className="block w-full h-auto rounded-[26px] md:rounded-[55px]"
              style={{
                display: "block",
              }}
            />
          </div>

          <div className="hidden lg:flex flex-col items-center group transition-transform hover:scale-110">
            <a href="https://instagram.com/amazon_paraguay" target="_blank" className="bg-white/80 p-4 rounded-full shadow-lg mb-2">
              <svg width="40" height="40" viewBox="0 0 24 24">
                <defs>
                  <linearGradient id="hero-insta" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" style={{ stopColor: "#f09433" }} />
                    <stop offset="25%" style={{ stopColor: "#e6683c" }} />
                    <stop offset="50%" style={{ stopColor: "#dc2743" }} />
                    <stop offset="75%" style={{ stopColor: "#cc2366" }} />
                    <stop offset="100%" style={{ stopColor: "#bc1888" }} />
                  </linearGradient>
                </defs>
                <path fill="url(#hero-insta)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
            <span className="text-[11px] font-black text-pink-600 uppercase tracking-widest drop-shadow-sm">
              Síguenos
            </span>
          </div>
        </section>

        {isInstallable && (
          <section className="mx-auto max-w-4xl px-4 pt-6 flex justify-center">
            <button
              onClick={handleInstallClick}
              className="w-full md:w-auto rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 px-8 py-4 font-black text-white shadow-lg border-2 border-white hover:scale-105 transition-transform flex items-center justify-center gap-3"
            >
              <span className="text-2xl">📲</span> Instalar App Aclasif
            </button>
          </section>
        )}

        {/* MENÚ DE CATEGORÍAS */}
        <section className="mx-auto max-w-6xl px-3 pt-6 md:px-4 md:pt-10">
          <div className="cat-menu-glow p-3 md:p-5 flex gap-3 md:gap-5 overflow-x-auto pb-4 md:pb-5 no-scrollbar">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`cat-btn-glow flex flex-col items-center justify-center gap-2 text-white transition-all duration-300 whitespace-nowrap ${
                selectedCategory === "all" ? "cat-btn-selected" : ""
              }`}
              style={{
                background: "linear-gradient(135deg, #FFB000 0%, #FF6A00 45%, #FF2D00 100%)",
                color: "#FFFFFF",
              }}
            >
              <span className="relative z-10 cat-icon-bubble text-white">
                <svg viewBox="0 0 64 64" className="h-8 w-8" fill="none">
                  <path d="M12 38c0-12 9-22 20-22s20 10 20 22" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
                  <path d="M20 38c0-7 5-14 12-14s12 7 12 14" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
                  <path d="M28 38c0-3 2-6 4-6s4 3 4 6" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
                </svg>
              </span>
              <span className="relative z-10 cat-title-glow">Todas</span>
            </button>

            {categories.map((c) => {
              const catColor = categoryColors[c.name] || categoryColors[c.slug] || "#64748B";
              const isSelected = selectedCategory === c.slug;

              return (
                <button
                  key={c.slug}
                  onClick={() => setSelectedCategory(c.slug)}
                  className={`cat-btn-glow flex flex-col items-center justify-center gap-2 text-white transition-all duration-300 whitespace-nowrap ${
                    isSelected ? "cat-btn-selected" : ""
                  }`}
                  style={{
                    background: `linear-gradient(135deg, ${catColor} 0%, ${catColor} 45%, #111827 140%)`,
                    color: "#FFFFFF",
                  }}
                >
                  <span className="relative z-10 cat-icon-bubble text-white">
                    <CategoryVisualIcon name={c.name} />
                  </span>
                  <span className="relative z-10 cat-title-glow">{c.name}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* GRILLA DE PRODUCTOS */}
        <section className="mx-auto max-w-7xl px-3 py-6 md:px-4 md:py-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {filtered.map((it) => (
            <div key={it.id} className="card-shell">
              <article className="group card-inner-wave">
                <Link
                  href={`/producto/${it.article_code || "#"}`}
                  className="relative h-52 w-full overflow-hidden rounded-[2rem] bg-gray-50 mb-4 flex items-center justify-center border-2 border-white"
                >
                  {it.image_url ? (
                    <img
                      src={it.image_url}
                      alt={it.title}
                      className="h-full w-full object-contain p-4 group-hover:scale-110 transition-transform"
                    />
                  ) : (
                    <div className="text-blue-100 font-black italic text-2xl">AmazonPy</div>
                  )}
                  {premiumActive(it.premium_until) && (
                    <div className="absolute top-4 right-4 bg-[#F4C400] text-black text-[10px] font-black px-4 py-1 rounded-full border-2 border-white animate-pulse">
                      ⭐ PREMIUM
                    </div>
                  )}
                </Link>

                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-1.5 mb-2">
                    <div
                      className="inline-flex items-center gap-1 font-black text-[9px] uppercase rounded-full px-2 py-1 border border-white shadow-sm text-white"
                      style={{ backgroundColor: categoryColors[it.category] || "#64748B" }}
                    >
                      <span>{getIcon(it.category)}</span> {it.category}
                    </div>

                    {it.condicion === "usado" ? (
                      <div className="inline-flex items-center gap-1">
                        <span className="bg-orange-100 text-orange-600 border border-orange-200 px-2 py-1 rounded-full text-[9px] font-black uppercase shadow-sm">
                          Usado
                        </span>
                        {it.detalles_condicion && (
                          <button 
                            onClick={(e) => { 
                              e.preventDefault(); 
                              setDefectModal({show: true, text: it.detalles_condicion || ""}); 
                            }}
                            className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-2 py-1 rounded-full text-[9px] font-bold uppercase transition shadow-sm"
                          >
                            Ver detalles 🔍
                          </button>
                        )}
                      </div>
                    ) : (
                      <span className="bg-green-100 text-green-700 border border-green-200 px-2 py-1 rounded-full text-[9px] font-black uppercase shadow-sm">
                        Nuevo
                      </span>
                    )}
                  </div>

                  {it.article_code && (
                    <p className="mb-2 text-[11px] font-black text-[#F4C400]">
                      Articulo: {it.article_code}
                    </p>
                  )}

                  <h3 className="font-extrabold text-slate-800 text-sm line-clamp-2 leading-tight mb-2">
                    {it.title}
                  </h3>

                  {it.description && (
                    <div className="mb-3 rounded-2xl bg-black/10 px-3 py-2">
                      <p className="text-[11px] font-bold text-slate-500 mb-1">Descripcion</p>
                      <p className="text-sm text-slate-800 line-clamp-2">
                        {it.description}
                      </p>
                    </div>
                  )}

                  <p className="text-2xl font-black text-[#0066FF]">
                    {formatGs(it.price_usd)}
                  </p>
                </div>

                {it.stock !== undefined && it.stock <= 0 ? (
                  <div className="w-full mt-4 flex items-center justify-center rounded-2xl bg-red-100 border border-red-300 py-4 text-red-600 font-black text-xs uppercase shadow-sm cursor-not-allowed opacity-80">
                    ❌ Agotado
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setSelected(it);
                      setBuyOpen(true);
                    }}
                    className="w-full mt-4 rounded-2xl bg-[#2FA84F] py-4 text-white font-black text-xs uppercase shadow-lg hover:brightness-110 active:scale-95 transition-all"
                  >
                    Comprar ya
                  </button>
                )}
              </article>
            </div>
          ))}
        </section>

        {/* FOOTER PREMIUM */}
        <footer className="footer-magic mt-20">
          <div className="footer-glow-line" />

          <div className="relative z-10 mx-auto max-w-7xl px-6 pt-16 pb-10">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-stretch">
              <div className="footer-brand-card lg:col-span-1">
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="footer-title-3d mb-4">
                    AMAZON<span className="footer-title-py">PY</span>
                  </div>

                  <div className="relative mb-5">
                    <div className="absolute inset-0 rounded-full bg-yellow-300/30 blur-2xl" />
                    <img
                      src="/amazonpy-footer.png"
                      alt="AmazonPy"
                      className="relative z-10 h-36 w-auto object-contain drop-shadow-2xl"
                    />
                  </div>

                  <p className="text-white/90 text-sm font-bold leading-relaxed drop-shadow">
                    La plataforma de clasificados más divertida y segura de Paraguay.
                    Comprá y vendé de todo con un solo clic. 🇵🇾
                  </p>

                  <div className="mt-5 inline-flex rounded-full bg-white/10 border border-white/20 px-4 py-2 text-[11px] font-black text-white/90 uppercase tracking-widest">
                    Seguro • Rápido • Fácil
                  </div>
                </div>
              </div>

              <div className="footer-box">
                <h4 className="footer-heading mb-5">Navegación</h4>
                <ul className="space-y-3">
                  <li>
                    <Link href="/sobre-nosotros" className="footer-pill-link">
                      <span className="footer-mini-dot">🏠</span>
                      <span>Sobre Nosotros</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/como-vender" className="footer-pill-link">
                      <span className="footer-mini-dot">🛒</span>
                      <span>¿Cómo vender?</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/ser-premium" className="footer-pill-link">
                      <span className="footer-mini-dot">⭐</span>
                      <span>Ser Premium</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/centro-ayuda" className="footer-pill-link">
                      <span className="footer-mini-dot">💬</span>
                      <span>Centro de Ayuda</span>
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="footer-box">
                <h4 className="footer-heading mb-5">Legales</h4>
                <ul className="space-y-3 mb-7">
                  <li>
                    <Link href="/terminos" className="footer-pill-link">
                      <span className="footer-mini-dot">📜</span>
                      <span>Términos y Condiciones</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/privacidad" className="footer-pill-link">
                      <span className="footer-mini-dot">🔒</span>
                      <span>Política de Privacidad</span>
                    </Link>
                  </li>
                </ul>

                <h4 className="footer-heading mb-4 text-[13px]">Síguenos</h4>
                <div className="flex gap-4">
                  <a href="https://www.facebook.com/amazon.paraguay" target="_blank" className="footer-social">
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="#3B82F6">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>

                  <a href="https://instagram.com/amazon_paraguay" target="_blank" className="footer-social">
                    <svg width="30" height="30" viewBox="0 0 24 24">
                      <defs>
                        <linearGradient id="footer-insta-color-premium" x1="0%" y1="100%" x2="100%" y2="0%">
                          <stop offset="0%" style={{ stopColor: "#f09433" }} />
                          <stop offset="25%" style={{ stopColor: "#e6683c" }} />
                          <stop offset="50%" style={{ stopColor: "#dc2743" }} />
                          <stop offset="75%" style={{ stopColor: "#cc2366" }} />
                          <stop offset="100%" style={{ stopColor: "#bc1888" }} />
                        </linearGradient>
                      </defs>
                      <path fill="url(#footer-insta-color-premium)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </a>
                </div>
              </div>

              <div className="footer-box">
                <h4 className="footer-heading mb-5">Contacto Directo</h4>

                <div className="space-y-4">
                  <a href="/chat" className="footer-contact-btn footer-contact-blue">
                    <div className="relative z-10 w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl shadow-inner">
                      💬
                    </div>
                    <div className="relative z-10">
                      <p className="font-black text-white">Chat en vivo</p>
                      <p className="text-xs text-white/80">Consultas, reclamos, ayuda</p>
                    </div>
                  </a>

                  <a href="https://t.me/Aclasif_Bot" target="_blank" className="footer-contact-btn footer-contact-cyan">
                    <div className="relative z-10 w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shadow-inner">
                      <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zm5.478 8.156l-1.831 8.628c-.136.612-.496.764-1.006.476l-2.778-2.047-1.34 1.288c-.148.148-.272.272-.56.272l.2-2.822 5.14-4.644c.224-.2-.048-.312-.348-.112L9.09 13.37l-2.6-.812c-.564-.176-.576-.564.12-.836L16.77 7.84c.54-.2 1.016.132.708.316z"/>
                      </svg>
                    </div>
                    <div className="relative z-10">
                      <p className="font-black text-white">Telegram</p>
                      <p className="text-xs text-white/80">@Aclasif_Bot</p>
                    </div>
                  </a>

                  <a href={`https://wa.me/${ADMIN_WHATSAPP}`} target="_blank" className="footer-contact-btn footer-contact-green">
                    <div className="relative z-10 w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl shadow-inner">
                      🟢
                    </div>
                    <div className="relative z-10">
                      <p className="font-black text-white">Urgencias</p>
                      <p className="text-xs text-white/80">Solo para casos importantes</p>
                    </div>
                  </a>
                </div>
              </div>
            </div>

            <div className="footer-bottom-glass mt-12 px-6 py-5 text-center">
              <p className="text-[10px] font-black text-white/80 uppercase tracking-[5px]">
                © 2026 AMAZONPY CLASIFICADOS — TODOS LOS DERECHOS RESERVADOS
              </p>
            </div>
          </div>
        </footer>
      </div>

      {defectModal.show && (
        <div 
          className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setDefectModal({show: false, text: ""})}
        >
          <div 
            className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform scale-100 transition-transform relative"
            onClick={e => e.stopPropagation()}
          >
            <button 
              onClick={() => setDefectModal({show: false, text: ""})}
              className="absolute top-4 right-4 text-slate-400 hover:text-red-500 text-xl font-black"
            >
              ✕
            </button>
            <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-100 text-orange-500 text-2xl">
              ⚠️
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2">Detalles del artículo</h3>
            <p className="text-slate-600 text-sm whitespace-pre-wrap leading-relaxed border-t border-slate-100 pt-4">
              {defectModal.text}
            </p>
            <button 
              onClick={() => setDefectModal({show: false, text: ""})} 
              className="mt-6 w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-black py-3 rounded-xl transition"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {buyOpen && selected && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md p-4">
          <div className="login-shell w-full max-w-md rounded-[2rem] p-4">
            <div className="login-inner rounded-[1.7rem] p-6 relative">
              <div className="mb-4 flex justify-center">
                <img
                  src="/aclasif-logo.png"
                  alt="Aclasif"
                  style={{ width: "220px", height: "auto" }}
                  className="object-contain"
                />
              </div>

              <h2 className="text-xl font-black text-slate-800 mb-1">
                Finalizar <span className="text-[#2FA84F]">Pedido</span>
              </h2>
              <p className="text-sm text-slate-500 mb-4">
                {selected.title}
              </p>

              <button
                onClick={() => setBuyOpen(false)}
                className="absolute top-4 right-5 text-slate-400 hover:text-red-500 text-2xl"
              >
                ✕
              </button>

              <div className="space-y-3">
                <input value={buyerName} onChange={e => setBuyerName(e.target.value)} placeholder="Nombre y Apellido" className="field-soft w-full rounded-2xl px-4 py-3 text-sm text-slate-800 outline-none focus:ring-4 focus:ring-[#2FA84F]/30" required />
                <input value={buyerWhatsapp} onChange={e => setBuyerWhatsapp(e.target.value)} placeholder="Tu WhatsApp (obligatorio)" className="field-soft w-full rounded-2xl px-4 py-3 text-sm text-slate-800 outline-none focus:ring-4 focus:ring-[#2FA84F]/30" required />
                <input value={buyerCity} onChange={e => setBuyerCity(e.target.value)} placeholder="Ciudad (obligatorio)" className="field-soft w-full rounded-2xl px-4 py-3 text-sm text-slate-800 outline-none focus:ring-4 focus:ring-[#2FA84F]/30" required />
                <textarea value={buyerAddress} onChange={e => setBuyerAddress(e.target.value)} placeholder="Dirección de entrega (obligatorio)" className="field-soft w-full rounded-2xl px-4 py-3 text-sm text-slate-800 outline-none focus:ring-4 focus:ring-[#2FA84F]/30 h-20 resize-none" required />
                <div>
                  <input value={buyerEmail} onChange={e => setBuyerEmail(e.target.value)} placeholder="Correo electrónico (no obligatorio)" className="field-soft w-full rounded-2xl px-4 py-3 text-sm text-slate-800 outline-none focus:ring-4 focus:ring-[#2FA84F]/30" />
                  <p className="text-[11px] text-gray-400 mt-1 ml-2">No obligatorio</p>
                </div>

                <button onClick={createOrder} disabled={buyLoading} className="mt-4 w-full rounded-2xl bg-[#2FA84F] py-4 text-white font-black text-sm uppercase shadow-xl hover:scale-[1.02] transition-transform disabled:opacity-50">
                  {buyLoading ? "Procesando..." : "Confirmar y enviar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast.show && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[101] bg-green-500 text-white px-6 py-3 rounded-2xl shadow-2xl font-bold animate-bounce">
          {toast.text}
        </div>
      )}

      <AclasifStickyDock />
      <AclasifChat />
    </main>
  );
}