window.FolioStore = (function () {
  const KEY = "folio.books.v1";
  function today() { return new Date().toISOString().slice(0, 10); }
  function blank() {
    return {
      books: JSON.parse(JSON.stringify(window.FOLIO_SEED.books)),
      shelves: window.FOLIO_SEED.shelves.slice(),
      days: [today()],
      reviews: {},
      lang: "en",
      theme: "paper"
    };
  }
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return blank();
      const data = JSON.parse(raw);
      if (!data.books || !data.books.length) data.books = blank().books;
      data.shelves = data.shelves || blank().shelves;
      data.days = data.days || [today()];
      data.reviews = data.reviews || {};
      return data;
    } catch (e) {
      return blank();
    }
  }
  function save(state) { localStorage.setItem(KEY, JSON.stringify(state)); }
  function touch(state) {
    if (!state.days.includes(today())) state.days.push(today());
    save(state);
  }
  function streak(state) {
    const set = new Set(state.days || []);
    let n = 0;
    const d = new Date();
    for (let i = 0; i < 365; i++) {
      const key = d.toISOString().slice(0, 10);
      if (!set.has(key)) break;
      n++;
      d.setDate(d.getDate() - 1);
    }
    return n;
  }
  function dueCards(state) {
    const now = Date.now();
    const out = [];
    state.books.forEach(book => {
      (book.cards || []).forEach(card => {
        const rev = state.reviews[card.id];
        if (!rev || rev.due <= now) out.push({ book, card, rev });
      });
    });
    return out;
  }
  function grade(state, cardId, gradeName) {
    const days = gradeName === "again" ? 0 : gradeName === "good" ? 3 : 7;
    const due = Date.now() + days * 86400000;
    const prev = state.reviews[cardId] || { box: 0 };
    state.reviews[cardId] = {
      box: gradeName === "again" ? 0 : prev.box + 1,
      due: gradeName === "again" ? Date.now() : due,
      last: gradeName
    };
    save(state);
  }
  return { load, save, touch, streak, dueCards, grade, today, blank };
})();
