const http = require("node:http"),
  https = require("node:https"),
  fs = require("node:fs"),
  protocol = { "http:": http, "https:": https },
  folderName = "Boletins de urna";

function start() {
  fs.mkdir(`./${folderName}`, (err) => {
    if (err && err.code !== "EEXIST") throw err;
    fs.readdir(`./${folderName}`, (err, downloaded) => {
      if (err) throw err;
      fs.readFile("./fontes.json", "utf-8", (err, data) => {
        let files = JSON.parse(data);
        loop(
          files.filter(
            (x) => downloaded.indexOf(x.slice(x.lastIndexOf("/") + 1)) == -1
          )
        );
      });
    });
  });
}
start();

function loop(data) {
  let url = new URL(data.shift()),
    arquiveName = url.pathname.slice(url.pathname.lastIndexOf("/") + 1),
    ws = fs.createWriteStream(`./${folderName}/${arquiveName}`);

  protocol[url.protocol].get(
    {
      host: url.hostname,
      path: url.pathname,
      port: url.port,
      headers: {
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36",
      },
    },
    (res) => {
      res.on("data", (chunk) => {
        if (!ws.write(chunk)) {
          res.pause();
          ws.once("drain", () => {
            res.resume();
          });
        }
      });
      res.on("end", () => {
        console.log(`\x1B[32m${arquiveName} Baixado!\x1B[0m`);
        ws.end();
        if (data.length) return loop(data);
      });
      res.on("error", () => {
        console.log(
          `\x1B[31mHouve um erro ao baixar ${arquiveName}. Reinicie o programa.\x1B[0m`
        );
        ws.end();
        fs.rm(`./${folderName}/${arquiveName}`);
      });
    }
  );
}
