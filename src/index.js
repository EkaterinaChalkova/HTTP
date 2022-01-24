const http = require("http");
const fs = require("fs");

const host = "localhost";
const port = 8000;

const requestListener = (req, res) => {
  if (req.url === "/get" && req.method === "GET") {
    try {
      let text = fs.readdirSync("../files");
      res.writeHead(200);
      res.end(text.join(", "));
    } catch (err) {
      res.writeHead(500);
      res.end("Internal server error");
    }
  } else if (req.url === "/delete" && req.method === "DELETE") {
    res.writeHead(200);
    res.end("Success");
  } else if (req.url === "/post" && req.method === "POST") {
    res.writeHead(200);
    res.end("Success");
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
