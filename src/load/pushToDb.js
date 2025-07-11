import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pkg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Client } = pkg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pgClient = new Client(process.env.POSTGRES_KEY) ;

const dataDir = path.join(__dirname, "../data/transformed");

const run = async () => {
  try {

    const channelMeta = JSON.parse(fs.readFileSync(path.join(dataDir, "channel_metadata_transformed.json")));
    const channelStats = JSON.parse(fs.readFileSync(path.join(dataDir, "channel_stats_transformed.json")));
    const topVideos = JSON.parse(fs.readFileSync(path.join(dataDir, "top_videos_transformed.json")));
    const videos = JSON.parse(fs.readFileSync(path.join(dataDir, "videos_transformed.json")));

    await pgClient.connect() ;

    
    await pgClient.query(
      `INSERT INTO channel_metrics (channel_id, title, description, published_at, subscribers, video_count, view_count)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        channelMeta.channelId,
        channelMeta.title,
        channelMeta.description,
        channelMeta.publishedAt,
        channelMeta.subscribers,
        channelMeta.videoCount,
        channelMeta.viewCount
      ]
    );

    
    await pgClient.query(
      `INSERT INTO channel_stats (channel_id, total_videos, average_views, min_views, max_views)
       VALUES ($1, $2, $3, $4, $5)`,
      [channelStats.channelId, channelStats.totalVideos, channelStats.averageViews, channelStats.minViews, channelStats.maxViews]
    );


    for (const video of topVideos) {
      await pgClient.query(
        `INSERT INTO top_videos (channel_id, video_id, title, published_at, description, channel_title, view_count, category)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (video_id) DO NOTHING`,
        [video.channelId, video.videoId, video.title, video.publishedAt, video.description, video.channelTitle, video.viewCount, video.category]
      );
    }

    
    for (const video of videos) {
      await pgClient.query(
        `INSERT INTO videos (channel_id, video_id, title, published_at, description, channel_title, view_count, category)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (video_id) DO NOTHING`,
        [video.channelId, video.videoId, video.title, video.publishedAt, video.description, video.channelTitle, video.viewCount, video.category]
      );
    }

    console.log("All data pushed to DB!");
    await pgClient.end();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();