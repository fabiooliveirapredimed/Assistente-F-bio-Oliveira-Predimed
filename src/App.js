import { useState, useRef, useEffect } from "react";

// ─── BRAND COLORS (Predimed: dourado + escuro) ───
const GOLD = "#C9A84C";
const GOLD2 = "#E8C96A";
const DARK = "#0D0D0D";
const DARK2 = "#141414";
const DARK3 = "#1C1C1C";
const CARD = "#181818";
const BORDER = "rgba(201,168,76,0.18)";
const TEXT = "#F5F0E8";
const MUTED = "#7A6A50";

const TABS = [
  { id: "chat",      label: "Assistente",  icon: "🏠" },
  { id: "email",     label: "E-mails",     icon: "✉️" },
  { id: "tasks",     label: "Tarefas",     icon: "✅" },
  { id: "analytics", label: "Negócio",     icon: "📊" },
];

const SYSTEM = {
  chat: `És o assistente pessoal do Fábio Oliveira, consultor imobiliário da Predimed Portimão (AMI 22503), sediada na Avenida Tomás Cabreira, Edifício Casa da Praia, Loja 10, 8500-802 Portimão. 
O Fábio está especializado no mercado imobiliário do Algarve (Portimão, Ferragudo, Lagoa, Carvoeiro, Albufeira e arredores). Trabalha com compra, venda e arrendamento de apartamentos, moradias e terrenos — incluindo o segmento premium Predimed Prestige.
Contactos do Fábio: 916 190 158 | fabio.oliveira@predimed.pt
Responsável da agência: Paulo Gonçalves | portimao@predimed.pt | 282 011 447
Responde sempre em português de Portugal. És profissional, conhecedor do mercado algarvio e orientado para resultados. Ajudas com questões de clientes, estratégia de vendas, prospeção e gestão do negócio imobiliário.`,

  email: `És um especialista em comunicação imobiliária profissional. Representas o Fábio Oliveira, consultor da Predimed Portimão. Rediges emails em português de Portugal com tom profissional e caloroso. 
Quando o Fábio descreve o que precisa, rediges o email completo.
Formato obrigatório: ASSUNTO: [assunto]\n\n[corpo do email]
Assina sempre como: Fábio Oliveira | Consultor Imobiliário | Predimed Portimão | 916 190 158 | fabio.oliveira@predimed.pt`,

  tasks: `És o gestor de produtividade do Fábio Oliveira, consultor imobiliário da Predimed Portimão. Ajudas a organizar visitas a imóveis, contactos com clientes, follow-ups, documentação e prospeção. Respondes sempre em português de Portugal com foco prático no dia-a-dia imobiliário.`,

  analytics: `És o analista de negócio do Fábio Oliveira, consultor imobiliário na Predimed Portimão. Analisas o mercado imobiliário do Algarve, dás insights sobre preços, tendências e estratégias para vender/arrendar imóveis na zona de Portimão, Ferragudo, Lagoa e Carvoeiro. Respondes em português de Portugal com dados e recomendações práticas.`,
};

const QUICK = {
  chat: ["Como qualificar um cliente comprador?", "Estratégia para vender mais rápido", "Como responder a uma objeção de preço?"],
  email: ["Email de proposta a vendedor", "Follow-up após visita ao imóvel", "Apresentação a novo cliente"],
  tasks: ["Planear o meu dia de visitas", "Follow-ups pendentes desta semana", "Checklist de novo imóvel em carteira"],
  analytics: ["Mercado imobiliário em Portimão", "Como posicionar preço num T2 em Ferragudo?", "Tendências do Algarve em 2025"],
};

async function callClaude(messages, tab) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: SYSTEM[tab],
      messages,
    }),
  });
  const data = await response.json();
  return data.content?.map(b => b.text || "").join("") || "Erro ao obter resposta.";
}

// ─── BUTTON ───
function GoldBtn({ children, onClick, disabled, style = {} }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background: disabled ? "#2a2a2a" : `linear-gradient(135deg, ${GOLD}, ${GOLD2})`,
      border: "none", borderRadius: 10, color: disabled ? MUTED : DARK,
      fontWeight: 700, fontSize: 14, cursor: disabled ? "not-allowed" : "pointer",
      fontFamily: "inherit", padding: "11px 22px", transition: "all 0.2s",
      ...style,
    }}>{children}</button>
  );
}

// ─── TASK MANAGER ───
function TaskManager() {
  const [tasks, setTasks] = useState([
    { id: 1, text: "Visita ao Penthouse T4 em Portimão — cliente João Santos", priority: "alta", done: false },
    { id: 2, text: "Follow-up proposta — Casa Geminada T3 em Ferragudo", priority: "alta", done: false },
    { id: 3, text: "Publicar novo T1 em Portimão no portal", priority: "média", done: false },
    { id: 4, text: "Enviar documentação escritura — cliente anterior", priority: "baixa", done: true },
  ]);
  const [input, setInput] = useState("");
  const [priority, setPriority] = useState("média");
  const [aiMsg, setAiMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const addTask = () => {
    if (!input.trim()) return;
    setTasks(t => [...t, { id: Date.now(), text: input, priority, done: false }]);
    setInput("");
  };
  const toggle = id => setTasks(t => t.map(tk => tk.id === id ? { ...tk, done: !tk.done } : tk));
  const remove = id => setTasks(t => t.filter(tk => tk.id !== id));

  const aiOrganize = async () => {
    setLoading(true);
    const list = tasks.map(t => `- [${t.priority}] ${t.text}${t.done ? " (concluída)" : ""}`).join("\n");
    const reply = await callClaude([{ role: "user", content: `Tenho estas tarefas no meu dia como consultor imobiliário:\n${list}\n\nAjuda-me a priorizar e organizar para o máximo de eficiência.` }], "tasks");
    setAiMsg(reply);
    setLoading(false);
  };

  const pc = p => ({ alta: "#e53e3e", média: GOLD, baixa: "#38a169" }[p]);

  return (
    <div style={{ display: "flex", gap: 20, height: "100%", minHeight: 0 }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14, minHeight: 0 }}>
        {/* Input */}
        <div style={{ background: CARD, borderRadius: 14, padding: 18, border: `1px solid ${BORDER}` }}>
          <p style={{ color: MUTED, fontSize: 12, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>Nova Tarefa</p>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && addTask()}
            placeholder="Ex: Visita ao T2 em Ferragudo às 15h..."
            style={{ width: "100%", background: DARK3, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "10px 14px", color: TEXT, fontSize: 14, fontFamily: "inherit", boxSizing: "border-box", marginBottom: 10, outline: "none" }} />
          <div style={{ display: "flex", gap: 8 }}>
            {["alta", "média", "baixa"].map(p => (
              <button key={p} onClick={() => setPriority(p)} style={{
                flex: 1, padding: "7px 0", borderRadius: 7, border: `1px solid ${pc(p)}`,
                background: priority === p ? pc(p) + "33" : "transparent",
                color: pc(p), fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: priority === p ? 700 : 400,
              }}>{p.charAt(0).toUpperCase() + p.slice(1)}</button>
            ))}
            <GoldBtn onClick={addTask} style={{ flex: 2, padding: "7px 0" }}>+ Adicionar</GoldBtn>
          </div>
        </div>
        {/* List */}
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
          {tasks.map(tk => (
            <div key={tk.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: CARD, borderRadius: 10, border: `1px solid ${BORDER}`, opacity: tk.done ? 0.45 : 1, transition: "opacity 0.2s" }}>
              <div onClick={() => toggle(tk.id)} style={{ width: 18, height: 18, borderRadius: 5, border: `2px solid ${pc(tk.priority)}`, background: tk.done ? pc(tk.priority) : "transparent", cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {tk.done && <span style={{ color: DARK, fontSize: 11, fontWeight: 900 }}>✓</span>}
              </div>
              <span style={{ flex: 1, color: TEXT, fontSize: 13, textDecoration: tk.done ? "line-through" : "none", fontFamily: "inherit" }}>{tk.text}</span>
              <span style={{ fontSize: 11, color: pc(tk.priority), background: pc(tk.priority) + "22", padding: "2px 9px", borderRadius: 20, whiteSpace: "nowrap" }}>{tk.priority}</span>
              <button onClick={() => remove(tk.id)} style={{ background: "none", border: "none", color: MUTED, cursor: "pointer", fontSize: 18, lineHeight: 1 }}>×</button>
            </div>
          ))}
        </div>
        <GoldBtn onClick={aiOrganize} disabled={loading} style={{ width: "100%", padding: 13 }}>
          {loading ? "A organizar..." : "✨ IA: Otimizar o meu dia"}
        </GoldBtn>
      </div>
      {aiMsg && (
        <div style={{ width: 290, background: `linear-gradient(160deg, ${DARK3}, ${DARK2})`, borderRadius: 14, padding: 20, border: `1px solid ${BORDER}`, overflowY: "auto", flexShrink: 0 }}>
          <p style={{ color: GOLD, fontSize: 12, marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>💡 Sugestão da IA</p>
          <p style={{ color: TEXT, fontSize: 13, lineHeight: 1.7, whiteSpace: "pre-wrap", fontFamily: "inherit" }}>{aiMsg}</p>
        </div>
      )}
    </div>
  );
}

// ─── ANALYTICS ───
function Analytics() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const metrics = [
    { label: "Imóveis em Carteira", value: "15", delta: "↑ activos", positive: true },
    { label: "Zona Principal", value: "Portimão", delta: "Algarve", positive: true },
    { label: "Gama de Preços", value: "185K–1,2M€", delta: "compra", positive: true },
    { label: "Arrendamentos", value: "1.300–1.950€", delta: "mensais", positive: true },
  ];

  const ask = async (q) => {
    const query = q || question;
    if (!query.trim()) return;
    setLoading(true); setAnswer("");
    const reply = await callClaude([{ role: "user", content: query }], "analytics");
    setAnswer(reply); setLoading(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, height: "100%", minHeight: 0 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {metrics.map(m => (
          <div key={m.label} style={{ background: CARD, borderRadius: 12, padding: 18, border: `1px solid ${BORDER}` }}>
            <p style={{ color: MUTED, fontSize: 11, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.8 }}>{m.label}</p>
            <p style={{ color: TEXT, fontSize: 20, fontWeight: 700, fontFamily: "inherit", marginBottom: 4 }}>{m.value}</p>
            <span style={{ color: m.positive ? GOLD : "#e53e3e", fontSize: 12 }}>{m.delta}</span>
          </div>
        ))}
      </div>
      <div style={{ background: CARD, borderRadius: 12, padding: 18, border: `1px solid ${BORDER}` }}>
        <p style={{ color: MUTED, fontSize: 11, marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.8 }}>Analista de Mercado IA</p>
        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          <input value={question} onChange={e => setQuestion(e.target.value)} onKeyDown={e => e.key === "Enter" && ask()}
            placeholder="Ex: Qual o preço médio de T2 em Portimão?"
            style={{ flex: 1, background: DARK3, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "10px 14px", color: TEXT, fontSize: 13, fontFamily: "inherit", outline: "none" }} />
          <GoldBtn onClick={() => ask()} disabled={loading}>{loading ? "..." : "Analisar"}</GoldBtn>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {QUICK.analytics.map(q => (
            <button key={q} onClick={() => { setQuestion(q); ask(q); }} style={{ padding: "5px 12px", borderRadius: 20, background: GOLD + "15", border: `1px solid ${BORDER}`, color: GOLD, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>{q}</button>
          ))}
        </div>
      </div>
      {(loading || answer) && (
        <div style={{ flex: 1, background: `linear-gradient(160deg,${DARK3},${DARK2})`, borderRadius: 12, padding: 20, border: `1px solid ${BORDER}`, overflowY: "auto", minHeight: 0 }}>
          {loading
            ? <p style={{ color: GOLD, fontFamily: "inherit" }}>A analisar o mercado...</p>
            : <p style={{ color: TEXT, fontSize: 13, lineHeight: 1.75, whiteSpace: "pre-wrap", fontFamily: "inherit" }}>{answer}</p>}
        </div>
      )}
    </div>
  );
}

// ─── CHAT PANEL ───
function ChatPanel({ tab }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const send = async (text) => {
    const msg = text || input;
    if (!msg.trim()) return;
    const newMessages = [...messages, { role: "user", content: msg }];
    setMessages(newMessages); setInput(""); setLoading(true);
    try {
      const reply = await callClaude(newMessages, tab);
      setMessages(m => [...m, { role: "assistant", content: reply }]);
    } catch {
      setMessages(m => [...m, { role: "assistant", content: "Erro de ligação. Tenta novamente." }]);
    }
    setLoading(false);
  };

  const isEmail = tab === "email";

  const formatMsg = (text) => {
    if (!isEmail) return <p style={{ margin: 0, whiteSpace: "pre-wrap", fontFamily: "inherit", lineHeight: 1.65 }}>{text}</p>;
    const lines = text.split("\n");
    const subjectLine = lines.find(l => l.startsWith("ASSUNTO:"));
    const body = lines.filter(l => !l.startsWith("ASSUNTO:")).join("\n").trim();
    return (
      <div>
        {subjectLine && <div style={{ background: GOLD + "22", borderRadius: 6, padding: "6px 10px", marginBottom: 10, fontSize: 12, color: GOLD, fontWeight: 600, fontFamily: "inherit", borderLeft: `3px solid ${GOLD}` }}>{subjectLine}</div>}
        <p style={{ margin: 0, whiteSpace: "pre-wrap", fontFamily: "inherit", lineHeight: 1.65 }}>{body}</p>
      </div>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      {messages.length === 0 && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 18 }}>
          <p style={{ color: MUTED, fontSize: 13, fontFamily: "inherit" }}>Sugestões rápidas:</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", maxWidth: 520 }}>
            {QUICK[tab].map(q => (
              <button key={q} onClick={() => send(q)} style={{ padding: "10px 18px", borderRadius: 24, background: GOLD + "12", border: `1px solid ${BORDER}`, color: GOLD, fontSize: 13, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" }}>{q}</button>
            ))}
          </div>
        </div>
      )}
      {messages.length > 0 && (
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 14, paddingBottom: 8, minHeight: 0 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
              {m.role === "assistant" && (
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: `linear-gradient(135deg,${GOLD},${GOLD2})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, marginRight: 8, flexShrink: 0, marginTop: 2 }}>🏠</div>
              )}
              <div style={{
                maxWidth: "76%", padding: "12px 16px",
                borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "4px 18px 18px 18px",
                background: m.role === "user" ? `linear-gradient(135deg,${GOLD},${GOLD2})` : CARD,
                border: m.role === "user" ? "none" : `1px solid ${BORDER}`,
                color: m.role === "user" ? DARK : TEXT, fontSize: 13,
              }}>
                {formatMsg(m.content)}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: `linear-gradient(135deg,${GOLD},${GOLD2})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🏠</div>
              <div style={{ padding: "12px 18px", borderRadius: "4px 18px 18px 18px", background: CARD, border: `1px solid ${BORDER}` }}>
                <span style={{ color: MUTED, fontSize: 13 }}>A processar</span>
                <span style={{ animation: "pulse 1.2s infinite", color: GOLD }}>...</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      )}
      <div style={{ display: "flex", gap: 10, paddingTop: 12, borderTop: `1px solid ${BORDER}`, marginTop: 8 }}>
        <input
          value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
          placeholder={tab === "email" ? "Descreve o email que precisas redigir..." : tab === "chat" ? "Pergunta o que precisares sobre o negócio..." : "Qual a tua questão?"}
          style={{ flex: 1, background: DARK3, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "12px 16px", color: TEXT, fontSize: 13, fontFamily: "inherit", outline: "none" }}
        />
        <GoldBtn onClick={() => send()} disabled={loading || !input.trim()} style={{ padding: "12px 18px", borderRadius: 12 }}>→</GoldBtn>
      </div>
    </div>
  );
}

// ─── MAIN APP ───
export default function App() {
  const [activeTab, setActiveTab] = useState("chat");
  const [time, setTime] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 60000); return () => clearInterval(t); }, []);
  const hour = time.getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 19 ? "Boa tarde" : "Boa noite";

  return (
    <div style={{ minHeight: "100vh", background: DARK, fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif", display: "flex", flexDirection: "column", maxHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=DM+Sans:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${DARK}; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: ${GOLD}44; border-radius: 3px; }
        input::placeholder { color: ${MUTED}; }
        @keyframes pulse { 0%,100%{opacity:0.3} 50%{opacity:1} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      {/* ── HEADER ── */}
      <div style={{ padding: "16px 28px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between", background: DARK2, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {/* Logo Predimed placeholder */}
          <div style={{ width: 44, height: 44, borderRadius: 10, background: `linear-gradient(135deg, ${GOLD}, ${GOLD2})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🏡</div>
          <div>
            <p style={{ color: TEXT, fontWeight: 700, fontSize: 17, letterSpacing: 0.3 }}>Fábio Oliveira</p>
            <p style={{ color: GOLD, fontSize: 11, letterSpacing: 1.2, textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif" }}>Predimed Portimão · Consultor</p>
          </div>
        </div>
        <div style={{ textAlign: "right", fontFamily: "'DM Sans', sans-serif" }}>
          <p style={{ color: GOLD, fontSize: 13, fontWeight: 500 }}>{greeting}, Fábio 👋</p>
          <p style={{ color: MUTED, fontSize: 11 }}>
            {time.toLocaleDateString("pt-PT", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>
      </div>

      {/* ── TABS ── */}
      <div style={{ display: "flex", padding: "0 28px", borderBottom: `1px solid ${BORDER}`, background: DARK2, flexShrink: 0 }}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            padding: "13px 18px", border: "none", background: "none", cursor: "pointer",
            color: activeTab === tab.id ? GOLD : MUTED,
            borderBottom: activeTab === tab.id ? `2px solid ${GOLD}` : "2px solid transparent",
            fontSize: 13, fontFamily: "'DM Sans', sans-serif", fontWeight: activeTab === tab.id ? 600 : 400,
            display: "flex", alignItems: "center", gap: 7, transition: "all 0.2s",
          }}>
            <span>{tab.icon}</span> {tab.label}
          </button>
        ))}

        {/* Contact info right side */}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 16, fontFamily: "'DM Sans', sans-serif" }}>
          <span style={{ color: MUTED, fontSize: 11 }}>📞 916 190 158</span>
          <span style={{ color: MUTED, fontSize: 11 }}>✉️ fabio.oliveira@predimed.pt</span>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{ flex: 1, padding: "22px 28px", overflow: "hidden", display: "flex", flexDirection: "column", animation: "fadeUp 0.3s ease", minHeight: 0 }}>
        {activeTab === "tasks"     ? <TaskManager /> :
         activeTab === "analytics" ? <Analytics />   :
         <ChatPanel key={activeTab} tab={activeTab} />}
      </div>

      {/* ── FOOTER ── */}
      <div style={{ padding: "8px 28px", borderTop: `1px solid ${BORDER}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
        <span style={{ color: MUTED, fontSize: 10, fontFamily: "'DM Sans', sans-serif", letterSpacing: 0.5 }}>PREDIMED IMOBILIÁRIA · AMI Nº 22503 · AV. TOMÁS CABREIRA, PORTIMÃO</span>
        <span style={{ color: MUTED, fontSize: 10, fontFamily: "'DM Sans', sans-serif" }}>Assistente IA Pessoal</span>
      </div>
    </div>
  );
}
