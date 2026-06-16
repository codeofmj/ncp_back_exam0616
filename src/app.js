require("dotenv").config();

const express = require("express");
const cors = require("cors");
const diaryRoutes = require("./routes/diaryRoutes");

const app = express();
const port = Number(process.env.PORT || 3000);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/diaries", diaryRoutes);

app.get("/api/server-info", (req, res) => {
  res.json({
    hostname: require("os").hostname(),
  });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "서버 오류가 발생했습니다." });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Backend server is running on port ${port}`);
});
