import express from "express" ;
import {Client} from "pg" ;
import dotenv from "dotenv" ;
dotenv.config();

const app = express() ;
const PORT = process.env.PORT; 

const pgClient = new Client(process.env.POSTGRES_KEY) ;

app.get('/api/videos',async (req,res)=>{
    const {rows} = await pgClient.query(`SELECT * FROM videos`) ;
    res.json(rows) ;
})

app.get("/api/top-videos", async (req, res) => {
  const { rows } = await pgClient.query("SELECT * FROM top_videos ORDER BY view_count DESC LIMIT 10");
  res.json(rows);
});

app.get("/api/channel-metadata", async (req, res) => {
  const { rows } = await pgClient.query("SELECT * FROM channel_metrics");
  res.json(rows);
});

app.get("/api/channel-summary", async (req, res) => {
  const { rows } = await pgClient.query("SELECT * FROM channel_stats");
  res.json(rows);
});

app.listen(PORT,()=>{
console.log(`Server running on port ${PORT}`) ;
pgClient.connect() ;
} ) ;