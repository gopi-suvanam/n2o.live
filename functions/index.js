const functions = require("firebase-functions");
const { google } = require("googleapis");
const moment = require("moment-timezone");
const utf8 = require("utf8");

// Config from Firebase (set via CLI)
const SPREADSHEET_ID = functions.config().n2o.spreadsheet_id;
const SHEETS_API_KEY = functions.config().n2o.sheets_key;
const YT_API_KEY = functions.config().n2o.youtube_key;

// Google Sheets + YouTube clients
const sheets = google.sheets({ version: "v4", auth: SHEETS_API_KEY });
const youtube = google.youtube({ version: "v3", auth: YT_API_KEY });

// Local in-memory cache
const searches = {};

function getCurrentHour() {
  return moment().tz("Asia/Kolkata").hours();
}

// 🔹 Get all channels for a TV name
exports.getAllChannels = functions.https.onCall(async (data, context) => {
  const { tvname } = data;
  try {
    const rangeName = `${tvname}!D2:AB25`;
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: rangeName,
    });

    const values = res.data.values || [];
    const ind = getCurrentHour();

    const channels = values.map((r) => [utf8.encode(r[0]), utf8.encode(r[ind])]);
    return { channels };
  } catch (err) {
    console.error("getAllChannels error:", err);
    return { channels: [] };
  }
});

// 🔹 Get a specific channel (and fetch latest YouTube videos)
exports.getChannel = functions.https.onCall(async (data, context) => {
  const { tvname, channel } = data;
  try {
    const allChannels = await exports.getAllChannels({ tvname }, context);
    const channels = allChannels.channels;

    const channelIndex = channels.map((x) => x[0]).indexOf(channel);
    if (channelIndex < 0) {
      return { error: "404 - channel not found" };
    }

    const row = channelIndex + 2;
    const ind = getCurrentHour();

    // Get keywords
    const keywordsRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${tvname}!E${row}:AB${row}`,
    });
    const keywords = (keywordsRes.data.values[0] || []).map(utf8.encode);

    // Get logo
    let logo = "";
    try {
      const logoRes = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${tvname}!AC1`,
      });
      logo = logoRes.data.values;
    } catch (e) {
      console.warn("No logo found");
    }

    // Search YouTube
    const searchKey = keywords[ind];
    const { videos, contentDetails } = await youtubeSearch(searchKey);

    return { keywords, videos, contentDetails, logo };
  } catch (err) {
    console.error("getChannel error:", err);
    return { error: err.message };
  }
});

// 🔹 YouTube search
async function youtubeSearch(searchKey) {
  if (!searches[searchKey]) {
    const res = await youtube.search.list({
      part: "id,snippet",
      q: searchKey,
      type: "video",
      maxResults: 50,
      order: "date",
      videoEmbeddable: "true",
    });

    const items = res.data.items || [];
    searches[searchKey] = items;
  }

  const newList = searches[searchKey].sort(
    (a, b) =>
      new Date(b.snippet.publishedAt) - new Date(a.snippet.publishedAt)
  );

  const videos = newList.map((j) => [
    utf8.encode(j.id.videoId),
    utf8.encode(j.snippet.thumbnails.default.url),
  ]);

  const contentDetails = await getVideoDetails(videos);
  return { videos, contentDetails };
}

// 🔹 Get YouTube video details
async function getVideoDetails(videos) {
  if (!videos.length) return [];

  const ids = videos.map((x) => x[0]).join(",");
  const res = await youtube.videos.list({
    id: ids,
    part: "snippet,contentDetails,statistics",
  });
  return res.data.items || [];
}
