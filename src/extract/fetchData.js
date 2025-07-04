import dotenv from "dotenv";
dotenv.config();
import fs from "fs";
import { google } from "googleapis";

const MKBHD_CHANNEL_ID = "UCBJycsmduvYEL83R_U4JriQ";

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

        const videos = res.data.items.map((item)=>({
            videoId : item.id.videoId,
            title : item.snippet.title,
            publishedAt : item.snippet.publishedAt,
            description : item.snippet.description ,
            channelTitle : item.snippet.channelTitle
        }))
        console.log(videos) ;

    }
    catch(e){
        console.log(`Failed to fetch Videos by CHannel due to ${e.message}`) ;
    }
}

fetchVideosByChannel(MKBHD_CHANNEL_ID);