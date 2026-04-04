const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Sport Event Management System API is running...");
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/players", require("./routes/playerRoutes"));
app.use("/api/player-requests", require("./routes/playerRequestRoutes"));
app.use("/api/teams", require("./routes/teamRoutes"));
app.use("/api/venues", require("./routes/venueRoutes"));
app.use("/api/events", require("./routes/eventRoutes"));
app.use("/api/matches", require("./routes/matchRoutes"));
app.use("/api/results", require("./routes/resultRoutes"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});