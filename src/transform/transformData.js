import { channel } from "diagnostics_channel";
import fs from "fs" ;
import path from "path" ;
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputDir = path.join(__dirname, "../data");
const outputDir = path.join(__dirname, "../data/transformed");

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

const writeJson = (filename,data) => {
    const outPath = path.join(outputDir,filename) ;
    fs.writeFileSync(outPath,JSON.stringify(data,null,2),'utf-8');
    console.log("Transformed file Saved\n") ;
}

// channelMeta data tranform
const channelMeta = JSON.parse(fs.readFileSync(path.join(inputDir, "channel_metadata.json"), "utf-8"));
const transformedMeta = {
  channelId : channelMeta.channelId,
  title: channelMeta.title,
  description: channelMeta.description,
  publishedAt: new Date(channelMeta.publishedAt.trim()).toISOString().split('T')[0],
  subscribers: Number(channelMeta.subscribers),
  videoCount: Number(channelMeta.videoCount),
  viewCount: Number(channelMeta.viewCount),
};
writeJson("channel_metadata_transformed.json", transformedMeta);

//channelStats transform
const channelStats = JSON.parse(fs.readFileSync(path.join(inputDir, "channel_stats.json"), "utf-8"));
const transformedStats = {
  channelId : channelStats.channelId,
  totalVideos: channelStats.totalVideos,
  averageViews: Number(channelStats.averageViews),
  minViews: channelStats.minViews,
  maxViews: channelStats.maxViews,
};
writeJson("channel_stats_transformed.json", transformedStats);


const topVideos = JSON.parse(fs.readFileSync(path.join(inputDir, "top_videos.json"), "utf-8"));
const transformedTopVideos = topVideos.map(video => ({
  channelId : video.channelId,
  videoId: video.videoId,
  title: video.title.trim(),
  publishedAt: new Date(video.publishedAt.trim()).toISOString().split('T')[0],
  description: video.description.trim(),
  channelTitle: video.channelTitle,
  viewCount : Number(video.viewCount),
  category : video.category.trim(),
}));
writeJson("top_videos_transformed.json", transformedTopVideos);


const videos = JSON.parse(fs.readFileSync(path.join(inputDir, "videos.json"), "utf-8"));
const transformedVideos = videos.map(video => ({
  channelId : video.channelId,
  videoId: video.videoId,
  title: video.title.trim(),
  publishedAt: new Date(video.publishedAt.trim()).toISOString().split('T')[0],
  description: video.description.trim(),
  channelTitle: video.channelTitle,
  viewCount : Number(video.viewCount),
  category : video.category.trim(),
}));
writeJson("videos_transformed.json", transformedVideos);