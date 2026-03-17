import { createServer } from "node:http";
import { Server } from "socket.io";
import { createApp } from "./app.js";

const port = Number(process.env.PORT ?? 4000);
const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL ?? "*"
  }
});

const app = createApp(io);
httpServer.on("request", app);

io.on("connection", (socket) => {
  socket.emit("system.ready", { message: "TransitLink realtime connected" });
});

httpServer.listen(port, () => {
  console.log(`TransitLink API listening on http://localhost:${port}`);
});
