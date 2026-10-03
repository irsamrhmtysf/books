/* Seed catalog. User edits live in localStorage, not here. */
window.FOLIO_SEED = {
  shelves: ["Ideas", "Foundations", "Craft", "Study", "Build"],
  books: [
    {
      id: "range",
      title: "Range",
      author: "David Epstein",
      year: 2019,
      pages: 339,
      isbn: "9780735214484",
      shelf: "Ideas",
      status: "reading",
      progress: 18,
      fit: 5,
      accent: "#1f4d3c",
      why: "First book on this shelf. Built so the argument can be recalled, not only finished.",
      blurb: "Generalists often win once the problem stops looking like golf or chess. Kind worlds reward narrow practice. Wicked worlds reward sampling, analogies, and late focus.",
      notes: "",
      chapters: [
        { id: "tiger", title: "Roger vs Tiger", done: false, idea: "A sampling period often beats an early head start.", remember: "Head start is not the same as match quality.", body: "Tiger Woods was shaped for golf almost from the crib. Roger Federer played many sports and only later narrowed. Epstein uses the pair to break the cult of the head start. Eventual elites often sample, lightly structured, then ramp deliberate practice after the match is real." },
        { id: "kind", title: "Kind vs wicked", done: false, idea: "Specialists win kind games. Range wins wicked ones.", remember: "If feedback is late or muddy, narrow practice is not enough.", body: "A kind environment repeats patterns and gives fast, accurate feedback. Chess and golf live here. A wicked environment has unclear rules and delayed or noisy feedback. Most modern work is wicked. A method that worked in a kind room can fail, confidently, in a wicked one." },
        { id: "sampling", title: "Sampling period", done: false, idea: "Breadth first, then a spike of practice.", remember: "Sample to find the match. Then practice.", body: "The common path in the studies Epstein cites is not early specialization. It is varied experience, then a narrowing of focus and a jump in practice. Sampling is how a person learns their own fit. That fit is match quality." },
        { id: "slow", title: "Learning that looks slow", done: false, idea: "The best learning often looks like falling behind.", remember: "Inefficient today, durable next month.", body: "Spacing, interleaving, and self-testing feel worse on the immediate quiz and last longer. Blocking one skill feels efficient and fades. This shelf uses that: recall beats reread." },
        { id: "analogy", title: "Outside experience", done: false, idea: "Analogies are a tool, not a distraction.", remember: "Ask what this is like, not only what it is.", body: "People who carry a structure from one domain into another solve problems specialists inside the domain miss. Range is not a refusal to go deep. It is a stock of models you can borrow when local tools stop working." },
        { id: "tools", title: "Drop familiar tools", done: false, idea: "Experts cling to methods that already worked.", remember: "Familiar is not the same as fitting.", body: "In novel situations, trained people often keep the tool that made them successful in a kinder setting. The advantage of range is knowing when to put that tool down." }
      ],
      cards: [
        { id: "c1", q: "What is a kind learning environment?", a: "Patterns repeat and feedback is fast and accurate. Golf and chess are the examples." },
        { id: "c2", q: "What is a wicked learning environment?", a: "Rules are unclear, patterns may not repeat, and feedback is delayed or noisy." },
        { id: "c3", q: "What is the sampling period?", a: "An early stretch of varied experience before narrow deliberate practice." },
        { id: "c4", q: "Why does Federer sit next to Woods?", a: "Woods specialized early. Federer sampled, then focused. Both reached the top by different paths." },
        { id: "c5", q: "What is match quality?", a: "How well a person fits the work or field they later specialize in." },
        { id: "c6", q: "Why can slow-feeling learning be better?", a: "Spacing, interleaving, and self-testing feel worse now and stick longer." }
      ]
    }
  ]
};
