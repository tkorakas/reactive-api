import { combineControllers } from "./combineControllers";
import http from "http";
import * as Rx from "rxjs";

const hostname = "127.0.0.1";
const port = 3000;

const server$ = new Rx.Subject();

const serverWithMiddleware$ = server$.pipe(
  Rx.tap(({ req }: any) => {
    console.log("URL:", req.url);
  }),
  Rx.tap(({ req }) => {
    console.log(
      "IP:",
      req.headers["x-forwarded-for"] || req.connection.remoteAddress
    );
  }),
  Rx.filter(({ req, res }) => {
    const isJson = req.headers?.["content-type"]?.includes("application/json");
    if (!isJson) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Not supported content type" }));
    }

    return isJson;
  })
);

const rootController = (request$: any) =>
  request$.pipe(
    Rx.filter(({ req }) => req.url === "/"),
    Rx.map((payload: any) => ({ ...payload, data: "Root controller" }))
  );

const helloWorldController = (request$: any) =>
  request$.pipe(
    Rx.filter(({ req }) => req.url === "/hello"),
    Rx.map((payload: any) => ({ ...payload, data: "Hello world controller" }))
  );

const controllers = [rootController, helloWorldController];

serverWithMiddleware$
  .pipe(combineControllers(controllers))
  .subscribe((event: any) => {
    if (!event.data) {
      event.res.writeHead(404, { "Content-Type": "application/json" });
      event.res.end();
      return;
    }
    event.res.writeHead(200, { "Content-Type": "application/json" });
    event.res.end(JSON.stringify(event.data));
  });

function requestHandler(req: any, res: any) {
  server$.next({ req, res });
}

const httpServer = http.createServer(requestHandler);

httpServer.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
