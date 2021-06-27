const http = require('http');
const xs = require('xstream').default;

const server = http.createServer();

const serverProducer = {
  start: listener => {
    server.on('request', (req, res) => {
      listener.next({ req, res });
    })
  },
  stop: () => server.close(),
  id: 0
};

const server$ = xs.create(serverProducer);

server$.addListener({
  next: ({ req, res }) => {
    res.end('hello, world');
  }
});

server.listen(3000);
