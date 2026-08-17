import express from "express";
import cors from "cors";
import path from "path";
import placesRouter from "./routes/places.route";
import usersRouter from "./routes/users.route";
import bookingsRouter from "./routes/booking.route";
import countriesRouter from "./routes/countries.route";
import authRouter from "./routes/auth.route";
import ratingsRouter from "./routes/rating.route";
import adminRouter from "./routes/admin.route";
import { errorHandler } from "./middlewares/errorHandler";
import { logger } from "./middlewares/logger";

const createApi = () => {
  const app = express();
  app.use(express.json());
  app.use("/uploads", express.static("src/uploads"));

  app.use(
    cors({
      origin: "http://travel-places-front.vercel.app/",
    }),
  );

  app.use(logger);

  app.use("/places", placesRouter);
  app.use("/users", usersRouter);
  app.use("/countries", countriesRouter);
  app.use("/auth", authRouter);
  app.use("/ratings", ratingsRouter);
  app.use("/admin", adminRouter);
  app.use("/bookings", bookingsRouter);

  app.use(errorHandler);
  return app;
};

export default createApi;
