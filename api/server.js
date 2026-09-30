//Importa a biblioteca Express, responsavel por criar o servidor e as rotas da API
import express from "express";

//importa a biblioteca CORS, que permite a comunicação entre aplicações executadas em portas diferentes (React e API)
import cors from "cors"

// cria uma instância da aplicação Express
const app = express();

//Habilita o cors para permitir requisições vindas do React
app.use(cors());

//permite que a api receba e interprete dados no formato JSON
app.use(express.json());

//vetor responsavel por armazenar temporariamente todas as consultas realizadas pelo usuario
let historico = [];


//MÉTODO GET
//Utilizado para consultar informações 
// já armazenadas na API
//Rota responsavel por retornar todo o historico
app.get("/historico", (req, res) => {

//Envia a lista completa de consultas em formato
//json'
res.json(historico);

});

//MÉTODO POST
//Utilizado para enviar informações para a API
app.post("/historico", (req, res) =>{

    //Adiciona os dados recebidos pelo react 
    //ao vetor de historico
    historico.push(req.body);

    res.json({
        mensagem: "consulta salva"
    });

});

//Inicia a API na porta 3000
app.listen(3000, () => {

    console.log("Servidor rodando na porta 3000");

});