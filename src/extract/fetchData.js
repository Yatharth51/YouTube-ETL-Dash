import dotenv from "dotenv";
dotenv.config();
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { google } from "googleapis";

const MKBHD_CHANNEL_ID = "UCBJycsmduvYEL83R_U4JriQ";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, "../data");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}


const youtube = google.youtube({
    version: "v3",
    auth: process.env.YOUTUBE_API_KEY,
})

const fetchVideosByChannel = async (channelId, maxResults = 15) => {
    try {
        const res = await youtube.search.list({
            part: "snippet",
            channelId,
            maxResults,
            order: "date",
            type: "video"
        });

        const items = res.data.items;
        const videoIds = items.map(item => item.id.videoId).join(',');

        // Fetching stats and snippet for viewcount and categoryid
        const statsRes = await youtube.videos.list({
            part: "statistics,snippet",
            id: videoIds
        });

        const statsMap = {};
        statsRes.data.items.forEach(item => {
            statsMap[item.id] = {
                viewCount: item.statistics.viewCount,
                categoryId: item.snippet.categoryId
            };
        });

        const categoryIds = [
            ...new Set(statsRes.data.items.map(item => item.snippet.categoryId))
        ].join(',');

        // Fetch category names
        const catRes = await youtube.videoCategories.list({
            part: "snippet",
            id: categoryIds,
        });
        const categoryMap = {};
        catRes.data.items.forEach(cat => {
            categoryMap[cat.id] = cat.snippet.title;
        });

        return items.map(item => ({
            channelId,
            videoId: item.id.videoId,
            title: item.snippet.title,
            publishedAt: item.snippet.publishedAt,
            description: item.snippet.description,
            channelTitle: item.snippet.channelTitle,
            viewCount: statsMap[item.id.videoId]?.viewCount || null,
            category: categoryMap[statsMap[item.id.videoId]?.categoryId] || null,
        }));
    } catch (e) {
        console.log(`Failed to fetch Videos by Channel due to ${e.message}`);
    }
}

const fetchTopViewedVideos = async (channelId, maxResults = 5) => {
    try {
        const res = await youtube.search.list({
            part : "snippet" ,
            channelId ,
            maxResults ,
            order : "viewCount" ,
            type : "video"
        }) ;
        const items = res.data.items;
        const videoIds = items.map(item => item.id.videoId).join(',');

        const statsRes = await youtube.videos.list({
            part: "statistics,snippet",
            id: videoIds
        });

        const statsMap = {};
        statsRes.data.items.forEach(item => {
            statsMap[item.id] = {
              viewCount: item.statistics.viewCount,
              categoryId : item.snippet.categoryId
            };
        });

        const categoryIds = [
            ...new Set(statsRes.data.items.map(item => item.snippet.categoryId))
        ].join(',');

        
        const catRes = await youtube.videoCategories.list({
            part: "snippet",
            id: categoryIds,
        });
        const categoryMap = {};
        catRes.data.items.forEach(cat => {
            categoryMap[cat.id] = cat.snippet.title;
        });

        return res.data.items.map((item)=>({
            channelId,
            videoId : item.id.videoId,
            title : item.snippet.title,
            publishedAt : item.snippet.publishedAt,
            description : item.snippet.description ,
            channelTitle : item.snippet.channelTitle,
            viewCount: statsMap[item.id.videoId].viewCount || null,
            category: categoryMap[statsMap[item.id.videoId]?.categoryId] || null,
        }))

    }
    catch(e){
        console.log(`Failed to fetch Videos by View Count due to ${e.message}`) ;
    }
}

const fetchChannelMetadata = async (channelId) => {
  const res = await youtube.channels.list({
    part: 'snippet,statistics',
    id: channelId,
  });

  const ch = res.data.items[0];
  return {
    channelId,
    title: ch.snippet.title,
    description: ch.snippet.description,
    publishedAt: ch.snippet.publishedAt,
    subscribers: ch.statistics.subscriberCount,
    videoCount: ch.statistics.videoCount,
    viewCount: ch.statistics.viewCount,
  };
}

const fetchChannelStats = async (channelId) => {
  const videos = await fetchVideosByChannel(channelId, 25); // Fetchin 25 rec
  const videoIds = videos.map(v => v.videoId).join(',');

  const res = await youtube.videos.list({
    part: 'statistics',
    id: videoIds,
  });

  const viewsArray = res.data.items.map(item => parseInt(item.statistics.viewCount, 10));

  const total = viewsArray.reduce((a, b) => a + b, 0); 
  const avg = (total / viewsArray.length).toFixed(0);
  const min = Math.min(...viewsArray);
  const max = Math.max(...viewsArray);

  return {
    channelId,
    totalVideos: viewsArray.length,
    averageViews: avg,
    minViews: min,
    maxViews: max,
  };
}

const test = async () => {
  const vids = await fetchVideosByChannel(MKBHD_CHANNEL_ID);
  const top = await fetchTopViewedVideos(MKBHD_CHANNEL_ID);
  const meta = await fetchChannelMetadata(MKBHD_CHANNEL_ID);
  const stats = await fetchChannelStats(MKBHD_CHANNEL_ID);

  fs.writeFileSync(path.join(DATA_DIR, "videos.json"), JSON.stringify(vids, null, 2));
  fs.writeFileSync(path.join(DATA_DIR, "top_videos.json"), JSON.stringify(top, null, 2));
  fs.writeFileSync(path.join(DATA_DIR, "channel_metadata.json"), JSON.stringify(meta, null, 2));
  fs.writeFileSync(path.join(DATA_DIR, "channel_stats.json"), JSON.stringify(stats, null, 2));

  console.log('\n Recent Videos:\n', vids);
  console.log('\n Top Viewed:\n', top);
  console.log('\n Channel Metadata:\n', meta);
  console.log('\n Statistics:\n', stats);
};

test();