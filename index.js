const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const pdfParse = require("pdf-parse");

const app = express();

// Configurando o multer para salvar arquivos na pasta "uploads"
const upload = multer({
  dest: path.join(__dirname, "uploads"),
  fileFilter: (req, file, cb) => {
    // Aceitar apenas arquivos PDF
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Apenas arquivos PDF são permitidos."));
    }
  },
});

// Rota para exibir o formulário HTML
app.get("/", (req, res) => {
  console.log("Rota / acionada."); // Log para confirmar
  res.sendFile(path.join(__dirname, "index.html"));
});

// Rota para upload e processamento de PDFs
app.post(
  "/upload",
  (req, res, next) => {
    upload.single("file")(req, res, (err) => {
      if (err) {
        console.error("Erro no upload:", err.message);
        return res
          .status(400)
          .send("Erro no upload: Apenas arquivos PDF são permitidos.");
      }
      next();
    });
  },
  async (req, res) => {
    console.log("Inicio da rota /upload chamada."); // Log inicial

    if (!req.file) {
      console.log("Nenhum arquivo enviado.");
      return res.status(400).send("Nenhum arquivo foi enviado.");
    }

    const pdfPath = req.file.path;

    try {
      console.log("Lendo o PDF...");
      const dataBuffer = fs.readFileSync(pdfPath);
      const pdfData = await pdfParse(dataBuffer);

      console.log("Texto extraído do PDF:");
      console.log(pdfData.text); // Exibir texto no terminal

      // Separar linhas do PDF
      const linhas = pdfData.text.split("\n").map((linha) => linha.trim());
      console.log("Linhas separadas:", linhas);

      const registros = [];

      // Processar as linhas do PDF
      linhas.forEach((linha) => {
        if (/^\d+/.test(linha)) {
          registros.push({ conteudo: linha });
        }
      });

      // Renderizar os dados como uma tabela HTML
      let html = `
        <h1>Dados Extraídos do PDF</h1>
        <table border="1" style="width:100%; border-collapse:collapse; text-align: left;">
          <thead>
            <tr>
              <th>Conteúdo</th>
            </tr>
          </thead>
          <tbody>
      `;

      registros.forEach((registro) => {
        html += `
          <tr>
            <td>${registro.conteudo}</td>
          </tr>
        `;
      });

      html += `
          </tbody>
        </table>
        <br>
        <a href="/">Voltar</a>
      `;

      res.send(html);
    } catch (error) {
      console.error("Erro ao processar o PDF:", error.message);
      res
        .status(500)
        .send(
          "Erro ao processar o PDF. Verifique se o arquivo é um PDF válido."
        );
    }

    console.log("Fim da rota /upload."); // Log no final
  }
);

// Inicializar o servidor
app.listen(3000, () => {
  console.log("Servidor rodando em http://localhost:3000");
});
