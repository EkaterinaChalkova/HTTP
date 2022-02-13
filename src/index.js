const http = require("http");
const fs = require("fs");

const host = "localhost";
const port = 8000;

const user = {
  id: 123,
  username: "testuser",
  password: "qwerty",
};

function parseCookie(Cookie) {
  return Object.assign(
    {},
    ...Cookie.split(";")
      .map((prop) => prop.trim().split("="))
      .map(([key, value]) => ({ [key]: value }))
  );
}

const requestListener = (req, res) => {
  if (req.url === "/auth" && req.method === "POST") {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });

    req.on("end", () => {
      const parsedData = JSON.parse(data);

      if (
        parsedData.username === user.username &&
        parsedData.password === user.password
      ) {
        res.setHeader("Set-Cookie", [
          `userId=${user.id};Expires=${new Date(
            Date.now() + 1000 * 60 * 60 * 24 * 2
          ).toUTCString()}; max_age=${60 * 60 * 24 * 2};`,
          `authorized=true;Expires=${new Date(
            Date.now() + 1000 * 60 * 60 * 24 * 2
          ).toUTCString()}; max_age=${60 * 60 * 24 * 2};`,
        ]);
        res.writeHead(200);
        res.end("Successful auth");
      } else {
        res.writeHead(400);
        res.end("Неверный логин или пароль");
      }
    });
  } else if (req.url === "/get" && req.method === "GET") {
    try {
      let text = fs.readdirSync("../files");
      res.writeHead(200);
      res.end(text.join(", "));
    } catch (err) {
      res.writeHead(500);
      res.end("Internal server error");
    }
  } else if (req.url === "/delete" && req.method === "DELETE") {
    cookie = req.headers.cookie;
    if (
      +parseCookie(cookie).userId === user.id &&
      parseCookie(cookie).authorized
    ) {
      let data = "";
      req.on("data", (chunk) => {
        data += chunk;
      });
      req.on("end", () => {
        const parsedData = JSON.parse(data);
        try {
          let dir = "../files";
          if (
            fs.existsSync(dir) &&
            fs.existsSync(`${dir}/${parsedData.filename}`)
          ) {
            fs.unlinkSync(`./${dir}/${parsedData.filename}`);
          }
        } catch (err) {
          res.writeHead(500);
          res.end("Internal server error");
        }
      });
      res.writeHead(200);
      res.end(`Файл удалён`);
    } else {
      res.writeHead(200);
      res.end(`Вы не авторизованы`);
    }
  } else if (req.url === "/post" && req.method === "POST") {
    cookie = req.headers.cookie;
    if (
      +parseCookie(cookie).userId === user.id &&
      parseCookie(cookie).authorized
    ) {
      let data = "";
      req.on("data", (chunk) => {
        data += chunk;
      });
      req.on("end", () => {
        const parsedData = JSON.parse(data);
        try {
          let dir = "../files";
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
          }
          fs.writeFileSync(
            `${dir}/${parsedData.filename}`,
            `${parsedData.content}`,
            {
              encoding: "utf-8",
              flag: "a",
            }
          );
        } catch (err) {
          res.writeHead(500);
          res.end("Internal server error");
        }
      });
      res.writeHead(200);
      res.end(`Файл добавлен`);
    } else {
      res.writeHead(200);
      res.end(`Вы не авторизованы`);
    }
  } else if (req.url === "/redirect" && req.method === "GET") {
    res
      .writeHead(307, {
        Location: "/redirected",
      })
      .end();
  } else if (req.url === "/redirected" && req.method === "GET") {
    res.writeHead(200);
    res.end("Successful redirection");
  } else {
    res.writeHead(405);
    res.end("HTTP method not allowed");
  }
};

const server = http.createServer(requestListener);

server.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
});
