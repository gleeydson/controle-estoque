const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();

// Criar pasta de uploads, se necessário
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuração do multer para salvar na pasta "uploads" forçando salvar com a extensão original
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Define a pasta de destino
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname); // Obtém a extensão do arquivo
    const baseName = path.basename(file.originalname, ext); // Nome sem extensão
    cb(null, `${baseName}-${Date.now()}${ext}`); // Gera o nome com timestamp
  },
});

const upload = multer({ storage });

// Configurar rota para upload de arquivos
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("Nenhum arquivo foi enviado.");
  }
  res.send(`Arquivo recebido: ${req.file.originalname}`);
});

// Configurar rota para exibir o formulário
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Inicializar o servidor
app.listen(3000, () => {
  console.log("Servidor rodando em http://localhost:3000");
});
