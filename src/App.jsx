//Importa o arquivo css
import "./App.css";

//Importa os hooks do React
//useState  -> guarda valores e atualiza a tela automaticamente
//useEffect -> executa algo quando o componente aparece na tela
//useRef    -> guarda uma referência para um elemento da página
import { useState, useEffect, useRef } from "react";

// =====================================================
// CONFIGURAÇÕES DO TEMA
// (ficam fora do componente porque nunca mudam)
// =====================================================

//Traduz o "main" do clima (vem da API em inglês) para o efeito do céu
const CONDICOES = {
  Clear: "limpo",
  Clouds: "nublado",
  Rain: "chuva",
  Drizzle: "chuva",
  Thunderstorm: "tempestade",
  Squall: "tempestade",
  Tornado: "tempestade",
  Snow: "neve",
  Mist: "nevoa",
  Haze: "nevoa",
  Fog: "nevoa",
  Smoke: "nevoa",
  Dust: "nevoa",
  Sand: "nevoa",
  Ash: "nevoa",
};

//Nome que aparece embaixo do frasco para cada faixa de temperatura
const NOMES_FAIXA = {
  neutro: "Aguardando",
  gelido: "Gélido",
  frio: "Frio",
  ameno: "Ameno",
  quente: "Quente",
  escaldante: "Escaldante",
};

//Frases do oráculo: uma para a condição do céu...
const PROFECIAS_CEU = {
  limpo: "O céu está limpo e os astros falam com clareza.",
  nublado: "Nuvens espessas escondem as estrelas do oráculo.",
  chuva: "As nuvens choram sobre a cidade; leve seu guarda-chuva encantado.",
  tempestade: "Trovões rasgam o céu; hoje o lugar certo é perto da lareira.",
  neve: "Flocos de neve dançam como se alguém os tivesse enfeitiçado.",
  nevoa: "Uma névoa misteriosa encobre o caminho; ande com cuidado.",
};

//...e outra para a temperatura
const PROFECIAS_TEMPERATURA = {
  gelido: "Frio de congelar o tinteiro: capa grossa e chocolate quente.",
  frio: "O vento sopra gelado pelas torres. Não esqueça o cachecol.",
  ameno: "A temperatura está em perfeito equilíbrio para um passeio.",
  quente: "O sol aquece as pedras do castelo. Uma poção gelada cai bem.",
  escaldante: "Calor de fornalha de dragão! Fique na sombra e beba água.",
};

//Quantas partículas cada efeito usa
const QUANTIDADE = { chuva: 110, neve: 70, geada: 45, poeira: 45, vagalume: 28, brasa: 60 };

//110 partículas com valores aleatórios.
//O CSS usa esses números para a posição, o tamanho e a velocidade
//de cada gota de chuva, floco de neve, brasa...
const PARTICULAS = Array.from({ length: 110 }, (_, i) => ({
  id: i,
  x: Math.random() * 100, //posição horizontal (%)
  y: Math.random() * 100, //posição vertical (%)
  r: Math.random(), //velocidade (0 a 1)
  t: Math.random(), //tamanho (0 a 1)
  d: Math.random(), //atraso da animação (0 a 1)
  w: Math.random() * 2 - 1, //balanço para os lados (-1 a 1)
}));

//Velas flutuantes: posição (x e y em %), escala (s) e atraso da animação (d)
const VELAS = [
  { x: 5, y: 16, s: 1, d: 0 },
  { x: 14, y: 62, s: 0.75, d: -2 },
  { x: 88, y: 52, s: 0.95, d: -3 },
  { x: 72, y: 34, s: 0.6, d: -1 },
  { x: 24, y: 30, s: 0.55, d: -4 },
  { x: 20, y: 88, s: 0.6, d: -2.5 },
  { x: 80, y: 84, s: 0.8, d: -4.5 },
  { x: 42, y: 4, s: 0.5, d: -5.5 },
];

//Decide a faixa de temperatura (é ela que pinta o céu)
function faixaDaTemperatura(temp) {
  if (temp < 8) return "gelido";
  if (temp < 17) return "frio";
  if (temp < 25) return "ameno";
  if (temp < 31) return "quente";
  return "escaldante";
}

//Decide qual efeito de partícula aparece no céu
function tipoDeParticula(condicao, faixa) {
  if (condicao === "chuva" || condicao === "tempestade") return "chuva";
  if (condicao === "neve") return "neve";
  if (faixa === "gelido" || faixa === "frio") return "geada";
  if (faixa === "escaldante") return "brasa";
  if (faixa === "quente") return "vagalume";
  return "poeira";
}

//Cria o componente principal da aplicação
function App() {

  //Estado responsável por armazenar a cidade digitada
  const [cidade, setCidade] = useState("");

  //Guarda tudo o que veio da API, já organizado (null = ainda não pesquisou)
  const [resultado, setResultado] = useState(null);

  //Mensagem de erro mostrada no pergaminho (no lugar do alert)
  const [erro, setErro] = useState("");

  //Estado de loading, para dar um feedback visual enquanto busca
  const [carregando, setCarregando] = useState(false);

  //Conta as consultas; serve para reiniciar a animação de "revelar"
  const [consultas, setConsultas] = useState(0);

  //Referência para a camada onde as faíscas da varinha são criadas
  const rastroRef = useRef(null);

  //Rastro de faíscas que segue o mouse, como uma varinha mágica
  useEffect(() => {
    const semAnimacao = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const temMouse = window.matchMedia("(pointer: fine)").matches;
    if (semAnimacao || !temMouse) return;

    let ultimaFaisca = 0;

    function aoMoverMouse(e) {
      //Cria no máximo uma faísca a cada 35 milissegundos
      const agora = performance.now();
      if (agora - ultimaFaisca < 35) return;
      ultimaFaisca = agora;

      const faisca = document.createElement("span");
      faisca.className = "faisca";
      faisca.style.left = e.clientX + "px";
      faisca.style.top = e.clientY + "px";
      faisca.style.setProperty("--dx", (Math.random() - 0.5) * 50 + "px");

      //Remove a faísca quando a animação termina
      faisca.addEventListener("animationend", () => faisca.remove());
      rastroRef.current?.appendChild(faisca);
    }

    window.addEventListener("mousemove", aoMoverMouse);
    return () => window.removeEventListener("mousemove", aoMoverMouse);
  }, []);

  //Função executada quando o formulário é enviado (botão ou Enter)
  async function consultarClima(evento) {

    //Impede o formulário de recarregar a página
    evento.preventDefault();

    //Remove espaços extras do começo e do fim
    const nomeCidade = cidade.trim();

    //Verifica se o campo está vazio
    if (nomeCidade === "") {
      setErro("Escreva o nome de uma cidade para consultar o oráculo.");
      return;
    }

    setErro("");
    setCarregando(true);

    try {

      //Faz a requisição da API (encodeURIComponent protege acentos e espaços)
      const resposta = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(nomeCidade)}&appid=31f8958534564fdb031369a754256658&units=metric&lang=pt_br`
      );

      //Converte a resposta para JSON
      const dados = await resposta.json();

      //Verifica se a cidade foi encontrada
      if (Number(dados.cod) !== 200) {
        setErro("O oráculo não encontrou essa cidade em nenhum mapa.");
        return;
      }

      const temperatura = Math.round(dados.main.temp);

      //Atualiza a tela de uma vez com tudo o que importa
      setResultado({
        local: dados.sys.country ? `${dados.name}, ${dados.sys.country}` : dados.name,
        temperatura: temperatura,
        sensacao: Math.round(dados.main.feels_like),
        clima: dados.weather[0].description,
        umidade: dados.main.humidity,
        vento: Math.round(dados.wind.speed * 3.6), //m/s -> km/h
        condicao: CONDICOES[dados.weather[0].main] || "nublado",
        faixa: faixaDaTemperatura(temperatura),
        //O ícone da API termina com "d" (dia) ou "n" (noite)
        periodo: dados.weather[0].icon.endsWith("n") ? "noite" : "dia",
      });
      setConsultas((total) => total + 1);

      // ===============================
      // CONTEÚDO DA AULA DE HOJE
      // Enviando dados do React para uma API própria
      // utilizando o método POST.
      // (fica num try/catch próprio: se a API do histórico
      // estiver desligada, a previsão continua aparecendo)
      // ===============================
      try {

        // Faz uma requisição para a API de histórico criada pelos alunos
        await fetch("http://localhost:3000/historico", {

          // Define o método HTTP utilizado
          method: "POST",

          // Informa que os dados enviados estarão no formato JSON
          headers: {
            "Content-Type": "application/json"
          },

          // Converte o objeto JavaScript para JSON
          body: JSON.stringify({

            // Envia o nome da cidade consultada
            cidade: cidade,

            // Envia a temperatura retornada pela API OpenWeatherMap
            temperatura: dados.main.temp + "°C",

            // Envia a descrição do clima
            clima: dados.weather[0].description,

            // Envia a umidade do ar
            umidade: dados.main.humidity + "%"

          })

        });

      } catch (erroHistorico) {
        console.warn("Não foi possível salvar no histórico:", erroHistorico);
      }

      // Fim do conteúdo da aula
      // Neste momento os dados foram enviados para a API
      // e armazenados no histórico de consultas.

    } catch (falha) {
      console.log(falha);
      setErro("Os astros ficaram em silêncio... não foi possível consultar a API.");
    } finally {
      setCarregando(false);
    }

  }

  //Valores que controlam o visual (antes da primeira busca usa o tema "neutro")
  const condicao = resultado ? resultado.condicao : "nenhuma";
  const faixa = resultado ? resultado.faixa : "neutro";
  const periodo = resultado ? resultado.periodo : "noite";
  const particula = tipoDeParticula(condicao, faixa);

  //Nível da poção no frasco: -10 °C = quase vazio, 45 °C = quase cheio
  const nivel = resultado
    ? Math.min(96, Math.max(6, ((resultado.temperatura + 10) / 55) * 100))
    : 35;

  const profecia = resultado
    ? `${PROFECIAS_CEU[condicao]} ${PROFECIAS_TEMPERATURA[faixa]}`
    : "Escreva o nome de uma cidade e o oráculo revelará o céu sobre ela.";

  //Retorna a interface visual do sistema
  return (
    // Container principal: as classes trocam o céu conforme o clima
    <div
      className={`app cond-${condicao} temp-${faixa} periodo-${periodo} ${carregando ? "carregando" : ""}`}
      style={{ "--nivel": nivel }}
    >

      {/* ===== CÉU ENCANTADO (só decoração) ===== */}
      <div className="ceu" aria-hidden="true">
        <div className="ceu__noite" />
        <div className="ceu__cinza" />
        <div className="estrelas" />
        <div className="estrela-cadente" />
        <div className="astro" />

        <div className="nuvens">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <span key={n} className="nuvem" style={{ "--n": n }} />
          ))}
        </div>

        <div className="nevoa" />

        {/* Chuva, neve, gelo, brasas... depende do clima */}
        <div key={particula} className={`particulas particulas--${particula}`}>
          {PARTICULAS.slice(0, QUANTIDADE[particula]).map((p) => (
            <span
              key={p.id}
              className="particula"
              style={{ "--x": p.x, "--y": p.y, "--r": p.r, "--t": p.t, "--d": p.d, "--w": p.w }}
            />
          ))}
        </div>

        <div className="relampago" />
        <div className="calor" />
        <div className="geada" />
      </div>

      {/* ===== VELAS FLUTUANTES ===== */}
      <div className="velas" aria-hidden="true">
        {VELAS.map((v, i) => (
          <div key={i} className="vela" style={{ "--x": v.x, "--y": v.y, "--s": v.s, "--d": v.d }}>
            <span className="vela__chama" />
            <span className="vela__pavio" />
            <span className="vela__cera" />
          </div>
        ))}
      </div>

      {/* Camada onde nascem as faíscas da varinha */}
      <div ref={rastroRef} aria-hidden="true" />

      {/* ===== PERGAMINHO CENTRAL ===== */}
      <main className="pergaminho">
        <div className="pergaminho__geada" aria-hidden="true" />
        <div className="pergaminho__brasa" aria-hidden="true" />
        <div className="pergaminho__moldura" aria-hidden="true" />

        {/* Título */}
        <header>
          <p className="sobretitulo">Almanaque de Previsões Encantadas</p>
          <h1 className="titulo">Oráculo do Tempo</h1>
          <div className="ornamento" aria-hidden="true">
            <span />☾✦☽<span />
          </div>
        </header>

        {/* Área de busca */}
        <form className="busca" onSubmit={consultarClima}>
          <label htmlFor="cidade" className="so-leitor">Cidade</label>
          <input
            id="cidade"
            type="text"
            placeholder="Qual cidade deseja consultar?"
            value={cidade}
            onChange={(e) => setCidade(e.target.value)}
            autoComplete="off"
          />
          <button type="submit" disabled={carregando}>
            <span className="busca__estrela" aria-hidden="true">✦</span>
            {carregando ? "Consultando..." : "Revelar"}
          </button>
        </form>

        {/* Mensagem de erro */}
        {erro && <p className="erro" role="alert">{erro}</p>}

        {/* Resultados */}
        <section key={consultas} className="revelacao" aria-live="polite">

          {/* Frasco de poção que funciona como termômetro */}
          <div className="frasco-area">
            <div className="frasco" aria-hidden="true">
              <span className="frasco__rolha" />
              <span className="frasco__gargalo" />
              <span className="frasco__corpo">
                <span className="pocao">
                  {[1, 2, 3, 4, 5].map((b) => (
                    <span key={b} className="bolha" style={{ "--b": b }} />
                  ))}
                </span>
              </span>
            </div>
            <p className="frasco__temp">{resultado ? `${resultado.temperatura}°C` : "—"}</p>
            <p className="frasco__faixa">{NOMES_FAIXA[faixa]}</p>
          </div>

          <dl className="detalhes">
            <div><dt>Cidade</dt><dd>{resultado ? resultado.local : "—"}</dd></div>
            <div><dt>Clima</dt><dd>{resultado ? resultado.clima : "—"}</dd></div>
            <div><dt>Umidade</dt><dd>{resultado ? `${resultado.umidade}%` : "—"}</dd></div>
            <div><dt>Sensação</dt><dd>{resultado ? `${resultado.sensacao}°C` : "—"}</dd></div>
            <div><dt>Vento</dt><dd>{resultado ? `${resultado.vento} km/h` : "—"}</dd></div>
          </dl>
        </section>

        {/* Frase do oráculo, muda com o clima e a temperatura */}
        <p key={`profecia-${consultas}`} className="profecia">
          <span className="profecia__titulo">Profecia do oráculo</span>
          “{profecia}”
        </p>

        {/* Selo de cera */}
        <div className="selo" aria-hidden="true">☾</div>
      </main>
    </div>
  );
}

//Exporta o componente App para ser utilizado no React
export default App;