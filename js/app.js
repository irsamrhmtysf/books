(function () {
  const store = window.FolioStore;
  const state = store.load();
  let tab = "now";
  let filter = "all";
  let recallIndex = 0;

  const I18N = {
    en: { now: "Now", shelf: "Shelf", recall: "Recall", search: "Search", you: "You", open: "Open", add: "Add book", empty: "Nothing here yet.", save: "Saved on this device." },
    id: { now: "Kini", shelf: "Rak", recall: "Ingat", search: "Cari", you: "Kamu", open: "Buka", add: "Tambah buku", empty: "Masih kosong.", save: "Tersimpan di perangkat ini." }
  };
  const t = (k) => (I18N[state.lang] || I18N.en)[k] || k;

  function cover(book) {
    return book.isbn ? "https://covers.openlibrary.org/b/isbn/" + book.isbn + "-L.jpg" : "";
  }
  function bookBtn(book, tall) {
    const pct = Math.max(0, Math.min(100, book.progress || 0));
    return '<button class="book" type="button" data-open="' + book.id + '" style="height:' + (tall ? 200 : 162) + 'px;background:' + book.accent + '">' +
      '<img alt="" src="' + cover(book) + '" onerror="this.style.display=\'none\'" />' +
      '<span class="fb"><strong>' + book.title + '</strong></span>' +
      '<span class="bar"><i style="width:' + pct + '%"></i></span></button>';
  }
  function pagesLogged() {
    return state.books.reduce((s, b) => s + Math.round((b.pages || 0) * (b.progress || 0) / 100), 0);
  }
  function find(id) { return state.books.find(b => b.id === id); }

  function renderNow() {
    const reading = state.books.filter(b => b.status === "reading");
    const hero = reading[0] || state.books[0];
    const due = store.dueCards(state).length;
    document.getElementById("now").innerHTML =
      '<div class="kicker">Continue</div>' +
      '<article class="hero">' + bookBtn(hero) +
      '<div><div class="kicker">' + hero.status + ' · ' + (hero.progress || 0) + '%</div>' +
      '<h1>' + hero.title + '</h1><p class="sub">' + hero.author + ' · ' + hero.year + '</p>' +
      '<p class="sub">' + hero.why + '</p>' +
      '<div class="row"><button class="primary" type="button" data-open="' + hero.id + '">' + t("open") + '</button>' +
      '<button class="ghost" type="button" data-tabjump="recall">Recall ' + due + '</button></div></div></article>' +
      '<div class="stats">' +
      '<div class="stat"><b>' + state.books.length + '</b><span>books</span></div>' +
      '<div class="stat"><b>' + pagesLogged() + '</b><span>pages</span></div>' +
      '<div class="stat"><b>' + store.streak(state) + '</b><span>streak</span></div>' +
      '<div class="stat"><b>' + due + '</b><span>due cards</span></div></div>' +
      '<h2>On the rail</h2><div class="shelf">' + state.books.map(b => bookBtn(b)).join("") + '</div>';
  }

  function renderLibrary() {
    const chips = ["all", "reading", "want", "finished"].map(id =>
      '<button class="chip ' + (filter === id ? "on" : "") + '" type="button" data-filter="' + id + '">' + id + '</button>'
    ).join("");
    const list = state.books.filter(b => filter === "all" || b.status === filter);
    document.getElementById("library").innerHTML =
      '<div class="kicker">' + t("shelf") + '</div><h2>Your collection</h2><div class="chips">' + chips + '</div>' +
      (list.length ? '<div class="grid">' + list.map(b =>
        '<div class="card" data-open="' + b.id + '">' + bookBtn(b, true) +
        '<p style="margin:8px 0 0;font-weight:620">' + b.title + '</p><p class="note">' + b.author + '</p></div>'
      ).join("") + '</div>' : '<p class="note">' + t("empty") + '</p>');
  }

  function renderRecall() {
    const due = store.dueCards(state);
    const box = document.getElementById("recall");
    if (!due.length) {
      box.innerHTML = '<div class="kicker">Recall</div><h2>Nothing due</h2><p class="sub">Range cards come back after you grade them. Open the book if you want to reread a chapter first.</p>';
      return;
    }
    recallIndex = Math.min(recallIndex, due.length - 1);
    const item = due[recallIndex];
    box.innerHTML =
      '<div class="kicker">Recall · ' + (recallIndex + 1) + ' / ' + due.length + '</div>' +
      '<h2>' + item.book.title + '</h2>' +
      '<div class="recall"><p class="quote">' + item.card.q + '</p><p class="sub" id="ans" hidden>' + item.card.a + '</p>' +
      '<div class="row"><button class="ghost" type="button" id="show">Show answer</button></div>' +
      '<div class="row" id="grades" hidden>' +
      '<button class="ghost" type="button" data-grade="again">Again</button>' +
      '<button class="primary" type="button" data-grade="good">Good · 3d</button>' +
      '<button class="ghost" type="button" data-grade="easy">Easy · 7d</button></div></div>';
    document.getElementById("show").onclick = () => {
      document.getElementById("ans").hidden = false;
      document.getElementById("grades").hidden = false;
    };
    box.querySelectorAll("[data-grade]").forEach(btn => {
      btn.onclick = () => {
        store.grade(state, item.card.id, btn.dataset.grade);
        store.touch(state);
        recallIndex = 0;
        renderRecall();
      };
    });
  }

  function renderSearch() {
    document.getElementById("search").innerHTML =
      '<div class="kicker">Search</div><h2>Find an idea</h2>' +
      '<input class="searchbox" id="q" placeholder="Title, author, chapter, card" />' +
      '<div id="sres"></div>';
    const paint = () => {
      const q = document.getElementById("q").value.toLowerCase();
      const hits = [];
      state.books.forEach(b => {
        const blob = [b.title, b.author, b.why, b.blurb, b.notes].join(" ");
        if (!q || blob.toLowerCase().includes(q)) hits.push('<button class="card" type="button" data-open="' + b.id + '" style="display:block;margin-top:8px"><b>' + b.title + '</b><br><span class="note">' + b.author + ' — ' + b.why + '</span></button>');
        (b.chapters || []).forEach(ch => {
          if (q && (ch.title + ch.idea + ch.body).toLowerCase().includes(q)) {
            hits.push('<button class="card" type="button" data-open="' + b.id + '" data-ch="' + ch.id + '" style="display:block;margin-top:8px"><b>' + ch.title + '</b><br><span class="note">' + b.title + ' — ' + ch.idea + '</span></button>');
          }
        });
      });
      document.getElementById("sres").innerHTML = hits.join("") || '<p class="note">' + t("empty") + '</p>';
    };
    document.getElementById("q").addEventListener("input", paint);
    paint();
  }

  function renderYou() {
    document.getElementById("you").innerHTML =
      '<div class="kicker">You</div><h2>A shelf, not a store</h2>' +
      '<p class="sub">FOLIO keeps Range as the first book. Chapters, notes, and recall grades stay in this browser. ' + t("save") + '</p>' +
      '<div class="stats"><div class="stat"><b>' + state.books.length + '</b><span>books</span></div>' +
      '<div class="stat"><b>' + pagesLogged() + '</b><span>pages</span></div>' +
      '<div class="stat"><b>' + store.streak(state) + '</b><span>streak</span></div>' +
      '<div class="stat"><b>' + Object.keys(state.reviews).length + '</b><span>grades</span></div></div>' +
      '<div class="row"><button class="primary" type="button" id="exp">Export</button>' +
      '<button class="ghost" type="button" id="imp">Import</button>' +
      '<button class="ghost" type="button" id="reset">Reset to Range</button></div>' +
      '<input id="file" type="file" accept="application/json" hidden />';
    document.getElementById("exp").onclick = () => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([JSON.stringify(state, null, 2)], { type: "application/json" }));
      a.download = "folio-books.json";
      a.click();
    };
    document.getElementById("imp").onclick = () => document.getElementById("file").click();
    document.getElementById("file").onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = JSON.parse(reader.result);
          if (!data.books) throw new Error("no books");
          Object.assign(state, data);
          store.save(state);
          go(tab);
        } catch (err) { alert("Not a FOLIO shelf file."); }
      };
      reader.readAsText(file);
    };
    document.getElementById("reset").onclick = () => {
      if (!confirm("Replace this shelf with the Range sample?")) return;
      const fresh = store.blank();
      state.books = fresh.books;
      state.shelves = fresh.shelves;
      state.reviews = {};
      store.save(state);
      go("now");
    };
  }

  function openBook(id, chapterId) {
    const b = find(id);
    if (!b) return;
    store.touch(state);
    const ch = (b.chapters || []).find(c => c.id === chapterId) || (b.chapters || [])[0];
    const map = (b.chapters || []).map(c =>
      '<button class="node ' + (ch && c.id === ch.id ? "on" : "") + '" type="button" data-ch="' + c.id + '"><b>' + c.title + '</b><br><span class="note">' + c.idea + '</span></button>'
    ).join("");
    document.getElementById("panel").innerHTML =
      '<button class="iconbtn" type="button" id="close">×</button>' +
      '<div class="kicker">' + b.shelf + ' · ' + b.pages + ' pp</div>' +
      '<h2>' + b.title + '</h2><p class="sub">' + b.author + ' · ' + b.year + '</p>' +
      '<div class="seg">' + ["reading", "want", "finished"].map(s =>
        '<button type="button" data-status="' + s + '" class="' + (b.status === s ? "on" : "") + '">' + s + '</button>'
      ).join("") + '</div>' +
      '<p><b>' + (b.progress || 0) + '%</b></p><input id="prog" type="range" min="0" max="100" value="' + (b.progress || 0) + '" />' +
      '<p>' + b.blurb + '</p><div class="map">' + map + '</div>' +
      (ch ? '<article class="read" style="margin-top:12px"><div class="kicker">Chapter</div><h3>' + ch.title + '</h3><p>' + ch.body + '</p><p class="quote">' + ch.remember + '</p>' +
        '<button class="ghost" type="button" id="doneCh">' + (ch.done ? "Chapter done" : "Mark chapter done") + '</button></article>' : '') +
      '<h3 style="margin-top:14px">Note</h3><textarea id="note">' + (b.notes || "") + '</textarea>' +
      '<div class="row"><button class="primary" type="button" id="saveNote">Save note</button>' +
      '<button class="ghost" type="button" id="del">Remove</button></div>';
    document.getElementById("sheet").classList.add("on");
    document.getElementById("close").onclick = close;
    document.getElementById("prog").oninput = (e) => {
      b.progress = +e.target.value;
      if (b.progress === 100) b.status = "finished";
      store.save(state);
    };
    document.querySelectorAll("[data-status]").forEach(btn => {
      btn.onclick = () => { b.status = btn.dataset.status; store.save(state); openBook(id, chapterId); };
    });
    document.querySelectorAll("#panel [data-ch]").forEach(btn => {
      btn.onclick = () => openBook(id, btn.dataset.ch);
    });
    if (ch) {
      document.getElementById("doneCh").onclick = () => {
        ch.done = !ch.done;
        const done = b.chapters.filter(c => c.done).length;
        b.progress = Math.max(b.progress || 0, Math.round(done / b.chapters.length * 100));
        store.save(state);
        openBook(id, ch.id);
      };
    }
    document.getElementById("saveNote").onclick = () => {
      b.notes = document.getElementById("note").value;
      store.save(state);
      document.getElementById("saveNote").textContent = "Saved";
    };
    document.getElementById("del").onclick = () => {
      if (!confirm("Remove this book?")) return;
      state.books = state.books.filter(x => x.id !== id);
      store.save(state);
      close();
    };
  }

  function openAdd() {
    document.getElementById("panel").innerHTML =
      '<button class="iconbtn" type="button" id="close">×</button>' +
      '<h2>Add a book</h2>' +
      '<div class="row" style="display:grid;grid-template-columns:1fr 1fr;gap:8px">' +
      '<input class="field" id="f-title" placeholder="Title" /><input class="field" id="f-author" placeholder="Author" />' +
      '<input class="field" id="f-pages" placeholder="Pages" inputmode="numeric" /><input class="field" id="f-isbn" placeholder="ISBN" />' +
      '<select class="field" id="f-shelf">' + state.shelves.map(s => '<option>' + s + '</option>').join("") + '</select>' +
      '<select class="field" id="f-status"><option value="want">want</option><option value="reading">reading</option><option value="finished">finished</option></select>' +
      '</div><input class="field" id="f-why" placeholder="Why it is here" style="margin-top:8px" />' +
      '<div class="row"><button class="primary" type="button" id="saveBook">' + t("add") + '</button></div>';
    document.getElementById("sheet").classList.add("on");
    document.getElementById("close").onclick = close;
    document.getElementById("saveBook").onclick = () => {
      const title = document.getElementById("f-title").value.trim();
      const author = document.getElementById("f-author").value.trim();
      if (!title || !author) return;
      state.books.unshift({
        id: "b" + Date.now(), title, author,
        year: new Date().getFullYear(),
        pages: +document.getElementById("f-pages").value || 0,
        isbn: document.getElementById("f-isbn").value.replace(/[^0-9X]/gi, ""),
        shelf: document.getElementById("f-shelf").value,
        status: document.getElementById("f-status").value,
        progress: 0, fit: 3, accent: "#24324a",
        why: document.getElementById("f-why").value.trim() || "Added by hand.",
        blurb: "", notes: "", chapters: [], cards: []
      });
      store.save(state);
      close();
      go("library");
    };
  }

  function close() {
    document.getElementById("sheet").classList.remove("on");
    go(tab);
  }

  function go(next) {
    tab = next;
    document.querySelectorAll(".view").forEach(v => v.classList.remove("on"));
    document.getElementById(tab).classList.add("on");
    document.querySelectorAll(".nav button").forEach(b => b.classList.toggle("on", b.dataset.tab === tab));
    if (tab === "now") renderNow();
    if (tab === "library") renderLibrary();
    if (tab === "recall") renderRecall();
    if (tab === "search") renderSearch();
    if (tab === "you") renderYou();
    document.querySelectorAll(".nav small").forEach(el => {
      const key = el.parentElement.dataset.tab === "library" ? "shelf" : el.parentElement.dataset.tab;
      el.textContent = t(key);
    });
  }

  document.body.addEventListener("click", (e) => {
    const jump = e.target.closest("[data-tabjump]");
    if (jump) { go(jump.dataset.tabjump); return; }
    const open = e.target.closest("[data-open]");
    if (open && !e.target.closest("#panel")) { openBook(open.dataset.open, open.dataset.ch); return; }
    const f = e.target.closest("[data-filter]");
    if (f) { filter = f.dataset.filter; renderLibrary(); }
  });
  document.querySelectorAll(".nav button").forEach(b => b.onclick = () => go(b.dataset.tab));
  document.getElementById("addBtn").onclick = openAdd;
  document.getElementById("sheet").onclick = (e) => { if (e.target.id === "sheet") close(); };
  document.getElementById("themeBtn").onclick = () => {
    state.theme = state.theme === "paper" ? "night" : state.theme === "night" ? "sepia" : "paper";
    document.documentElement.dataset.theme = state.theme === "paper" ? "" : state.theme;
    store.save(state);
  };
  document.getElementById("langBtn").onclick = () => {
    state.lang = state.lang === "en" ? "id" : "en";
    document.getElementById("langBtn").textContent = state.lang.toUpperCase();
    store.save(state);
    go(tab);
  };
  document.documentElement.dataset.theme = state.theme === "paper" ? "" : state.theme;
  document.getElementById("langBtn").textContent = (state.lang || "en").toUpperCase();
  store.touch(state);
  go("now");
})();
