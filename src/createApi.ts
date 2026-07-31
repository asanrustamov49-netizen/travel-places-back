import express from "express";
import cors from "cors";
import placesRouter from "./routes/places.route";
import usersRouter from "./routes/users.route";
import countriesRouter from "./routes/countries.route";
import authRouter from "./routes/auth.route";
import { errorHandler } from "./middlewares/errorHandler";
import { logger } from "./middlewares/logger";

const createApi = () => {
  const app = express();
  app.use(express.json());

  app.use(
    cors({
      origin: "http://localhost:3000",
    }),
  );

  app.use(logger);

  app.use("/places", placesRouter);
  app.use("/countries", usersRouter);
  app.use("/users", countriesRouter);
  app.use("/auth", authRouter);

  app.use(errorHandler);
  return app;
};

export default createApi;
