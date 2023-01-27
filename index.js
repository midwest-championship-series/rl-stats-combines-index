require("dotenv").config();

const axios = require("axios").default;
const fs = require("fs");
const path = require("path");
const extractPlayerData = require("./player_stats");

const ballchasingUrl = "https://ballchasing.com/api";
const headers = { Authorization: process.env.BALLCHASING_KEY };

const sleep = (seconds) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, seconds * 1000);
  });
};

const getReplayIds = async (groupId) => {
  return (
    await axios.get(`${ballchasingUrl}/replays?group=${groupId}`, { headers })
  ).data;
};

const getReplayData = async (replayId) => {
  return (await axios.get(`${ballchasingUrl}/replays/${replayId}`, { headers }))
    .data;
};

const getPlayerDataFromGroup = async (groupId, stream, cached) => {
  const groupRes = await getReplayIds(groupId);
  for (let replay of groupRes.list) {
    const isCached =
      cached.filter((item) => item.ballchasing_id === replay.id).length === 6;
    if (isCached) {
      continue;
    }
    console.log(`indexing replay: ${replay.id}`);
    const replayData = await getReplayData(replay.id);
    if (replayData.duration < 300) {
      console.log(`rejecting game with ${replayData.duration} seconds played`);
      continue;
    }
    const playerData = extractPlayerData(replayData);
    if (playerData.length !== 6) {
      console.log(`rejecting game with ${playerData.length} players`);
      continue;
    }
    const duplicate = cached.find(
      (item) => item.rl_game_id === replayData.rocket_league_id
    );
    if (duplicate) {
      console.log(
        `${replayData.id} is duplicate of ${duplicate.ballchasing_id}`
      );
      continue;
    }
    for (let playerRecord of playerData) {
      stream.write(JSON.stringify(playerRecord) + "\n");
    }
    await sleep(1);
  }
};

const readNdJsonToObject = (file) => {
  return fs
    .readFileSync(file)
    .toString()
    .split("\n")
    .filter((i) => i.length > 1)
    .map((i) => JSON.parse(i));
};

const run = async () => {
  try {
    const cacheName = "cached_results.ndjson";
    const data = JSON.parse(
      fs.readFileSync(path.join(__dirname, "replay_groups.json"))
    );
    const playerResultsStream = fs
      .createWriteStream(cacheName, { flags: "a" })
      .on("finish", () => {
        console.log("finished");
      })
      .on("error", (err) => {
        console.log("error", err);
      });
    const cachedResults = readNdJsonToObject(cacheName);
    for (let group of data) {
      console.log("getting group", group.replay_group_id);
      await getPlayerDataFromGroup(
        group.replay_group_id,
        playerResultsStream,
        cachedResults
      );
    }
    playerResultsStream.end();

    fs.writeFileSync(
      "results.json",
      JSON.stringify(readNdJsonToObject("cached_results.ndjson"))
    );
  } catch (err) {
    console.error(err);
  }
};

run();
