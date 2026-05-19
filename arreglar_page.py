from pathlib import Path

page_path = Path("app/page.tsx")
text = page_path.read_text(encoding="utf-8")

# 1) Agregar aviso Telegram en createOrder si no existe
telegram_block = '''      // --- AVISO A TELEGRAM VÍA RENDER ---
      try {
        await fetch("https://aclasif-chatbot.onrender.com/api/notificar-compra", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            producto: selected.title,
            article_code: selected.article_code || "Sin código",
            nombre: buyerName,
            whatsapp: buyerWhatsapp,
            email: buyerEmail || "No proporcionado",
            order: data.order_number.toString(),
            session_id: "compra_" + Date.now()
          }),
        });
      } catch (err) {
        console.log("Error al avisar a Telegram:", err);
      }
      // ------------------------------------

'''

if "/api/notificar-compra" not in text:
    marker = '''      await supabase
        .from("listings")
        .update({ stock: newStock })
        .eq("id", selected.id);

      setBuyOpen(false);'''
    
    replacement = '''      await supabase
        .from("listings")
        .update({ stock: newStock })
        .eq("id", selected.id);

''' + telegram_block + '''      setBuyOpen(false);'''

    if marker not in text:
        raise SystemExit("No encontré el lugar exacto para agregar Telegram. No se tocó nada.")
    text = text.replace(marker, replacement, 1)

# 2) Agregar buscador solo celular si no existe
mobile_search_block = '''          </div>

          <form
            className="px-4 pb-3 md:hidden"
            onSubmit={(e) => {
              e.preventDefault();
              const input = e.currentTarget.querySelector("input");
              input?.blur();
            }}
          >
            <div className="search-hero flex w-full items-center rounded-full px-4 py-2.5">
              <input
                type="text"
                placeholder="Buscar producto..."
                className="w-full bg-transparent outline-none text-sm text-slate-700 font-semibold"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              <button
                type="submit"
                className="ml-2 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#0066FF] text-white shadow-md"
                aria-label="Buscar"
              >
                🔍
              </button>
            </div>
          </form>
        </header>'''

if 'placeholder="Buscar producto..."' not in text:
    marker = '''          </div>
        </header>'''
    if marker not in text:
        raise SystemExit("No encontré el cierre del header. No se tocó nada.")
    text = text.replace(marker, mobile_search_block, 1)

page_path.write_text(text, encoding="utf-8")
print("OK: app/page.tsx corregido con Telegram y buscador mobile. Footer no se tocó.")