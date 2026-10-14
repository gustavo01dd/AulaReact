import express from "express";

import cors from "cors";

//importa o módulo FS (File System)
//Este modulo permite a leitura e escrita de arquivos utilizando JavaScript
import Fs from "fs";

//importa a conexão criada com o banco de dados Firebase
import db from "./firebase.js";

import {
    ref,
    push
} from "firebase/database"; 

const app = express();

app.use(cors());

//permite que a api recebe e interprete dados no formato JSON
app.use(express.json());

let historico = [];

//verifica se o arquivo historico.json existe
//caso exista, os dados serão carregados para dentro do vetor historico
if (Fs.existsSync("./api/historico.json")) {
    //lê o arquivo historico.json e armazena os dados na variável dadosArquivos
    const dadosArquivos = Fs.readFileSync(
        "./api/historico.json", 
       "utf-8"
    );

    try {
        if (dadosArquivos.trim() !== "") {

            //converte o JSON do arquivo para um array JavaScript
            historico = JSON.parse(dadosArquivos);
    } else {
        historico = [];
    }

} catch {
    historico = [];

}
}

app.get("/historico", (req, res) => {
    res.json(historico);
})

app.post("/historico", async (req, res) => {
    historico.push(req.body)

    //Cria uma referência chamada "historico" dentro do firebase.
    //Caso ela não exista, o firebase irá criar automaticamente.
    const referenciaFirebase = ref(
        db,
        "historico"
    );

    //Salva uma copia dos dados tambem no Firebase Realtime Database
    await push(
        referenciaFirebase, 
        req.body
    )

    //converte o array JavaScript para o formato JSON, o numero 2 deixa o arquivo organizado e legível
    const historicoJSON = JSON.stringify(
        historico,
         null,
          2
    );


    //salva os dados atualizados no arquivo historico.json, assim os registros permanecem armazendaos mesmo apos desligar o servidos
    fs.writeFileSync(
        "./api/historico.json",
        historicoJSON
    );

    //retorna uma mensagem informando que o registro foi salvo com sucessso
    res.json({
        mensagem: "Consulta salva"
    });

})

//inicialização do servidor 

app.listen(3000, () => {
    console.log("Servidor rodando na porta 3000");
});

