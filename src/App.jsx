//importa o arquivo css
import "./App.css"

//Importa hook useState da biblioteca react
//Ele permite armazenar valores e atualizar a tela automaticamente
import { useState } from "react";

//Cria o componente principal da aplicação
function App() {

  //Estado responsavel por armazenar a cidade digitada
  const [cidade, setCidade] = useState("");

  //Estado para armazenar a temperatura da cidade
  const [temperatura, setTemperatura] = useState("");

  //Estado para armazenar o clima da cidade
  const [clima, setClima] = useState("");

  //Estado par armazenar a umidade da cidade 
  const [umidade, setUmidade] = useState("");

  //Estado que guarda o "tipo" de clima (usado pra trocar o tema visual)
  //Valores possiveis: default, clear, clouds, rain, thunderstorm, snow, mist
  const [tema, setTema] = useState("default");

  //Estado de loading, pra dar um feedback visual enquanto busca
  const [carregando, setCarregando] = useState(false);

  //Dicionário que traduz o "main" do clima (em inglês, vindo da API)
  //pra um tema visual + emoji grande de fundo
  const temasClima = {
    Clear:        { tema: "clear",        icone: "☀️" },
    Clouds:       { tema: "clouds",       icone: "☁️" },
    Rain:         { tema: "rain",         icone: "🌧️" },
    Drizzle:      { tema: "rain",         icone: "🌦️" },
    Thunderstorm: { tema: "thunderstorm", icone: "⛈️" },
    Snow:         { tema: "snow",         icone: "❄️" },
    Mist:         { tema: "mist",         icone: "🌫️" },
    Haze:         { tema: "mist",         icone: "🌫️" },
    Fog:          { tema: "mist",         icone: "🌫️" },
  };

  //Função executada quando o usuario clicar no botão consultar
  async function consultarClima() {

    //Verifica se o campo está vazio
    if (cidade === "") {
      alert("Digite uma cidade!");
      return;
    }

    setCarregando(true);

    try {

      // Faz a requisicão da API
      const resposta = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${cidade}&appid=31f8958534564fdb031369a754256658&units=metric&lang=pt_br`
      );

      // Converte a resposta para JSON
      const dados = await resposta.json();

      //Verifica se a cidade foi encontrada
      if (dados.cod !== 200) {
        alert("Cidade não encontrada!");
        setCarregando(false);
        return;
      }

      //Atualiza a temperatura
      setTemperatura(Math.round(dados.main.temp) + "°C");

      //Atualiza a condição climática
      setClima(dados.weather[0].description);

      //Atualiza a umidade
      setUmidade(dados.main.humidity + "%");

      //Define o tema visual com base no tipo de clima retornado
      //Se não encontrar no dicionário, usa o tema "default"
      const infoTema = temasClima[dados.weather[0].main] || { tema: "default", icone: "🌡️" };
      setTema(infoTema.tema);

    } catch (erro) {
      console.log(erro);
      alert("Erro ao consultar a API.");
    } finally {
      setCarregando(false);
    }

  }

  //Permite pesquisar apertando Enter no campo de texto
  function aoPressionarTecla(e) {
    if (e.key === "Enter") {
      consultarClima();
    }
  }

  //Retorna a interface visual do sistema
  return (
    // conteiner principal da aplicação — a classe muda o fundo conforme o clima
    <div className={`app-container tema-${tema}`}>

      {/* Emoji gigante decorativo ao fundo */}
      <div className="icone-fundo">
        {temasClima[
          Object.keys(temasClima).find(k => temasClima[k].tema === tema)
        ]?.icone || "🌤️"}
      </div>

      {/* Card central com efeito de vidro (glassmorphism) */}
      <div className="card">

        {/* Titulo Principal */}
        <h1>☀️ Previsão do Tempo</h1>

        {/*Área de busca */}
        <div className="busca">

          {/*Campo para digitação */}
          <input
            type="text"
            placeholder="Digite uma cidade"
            value={cidade}
            onChange={(e) => setCidade(e.target.value)}
            onKeyDown={aoPressionarTecla}
          />

          {/*Botão de consulta */}
          <button onClick={consultarClima} disabled={carregando}>
            {carregando ? "Buscando..." : "Consultar"}
          </button>
        </div>

        {/*Linha horizontal para separar seçoes */}
        <hr />

        {/*Resultados */}
        <div className="resultado">
          <p>🏙️ <strong>Cidade:</strong> {cidade || "—"}</p>
          <p>🌡️ <strong>Temperatura:</strong> {temperatura || "—"}</p>
          <p>☁️ <strong>Clima:</strong> {clima || "—"}</p>
          <p>💧 <strong>Umidade:</strong> {umidade || "—"}</p>
        </div>

      </div>
    </div>
  );
}

//Exporta o componente App para ser utilizado no React
export default App;