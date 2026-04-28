import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import router from "./routes/route";
import cors,{CorsOptions} from "cors";

dotenv.config({ path: ".env.local" });

const connectionString = process.env.MONGO_URI || "";
const PORT = process.env.PORT || 3001;

mongoose
  .connect(connectionString)
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch((err) => console.log(err));

const corsOptions: CorsOptions = {
  origin: "http://localhost:5173",
  methods: ["GET", "POST","PATCH", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

const app = express();
app.use(express.json());
app.use(cors(corsOptions));
app.use(router);

app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
});
