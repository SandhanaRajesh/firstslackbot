const axios = require("axios");
require("dotenv").config();

const { App } = require("@slack/bolt");

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true
});

app.command("/sandhanabot-ping", async ({ command, ack, respond }) => {
  const start = Date.now();
  await ack();
  const latency = Date.now() - start;
  await respond({ text: `Latency: ${latency}ms` });
});


app.command("/sandhanabot-help", async ({ ack, respond }) => {
  await ack();
  await respond({
    text:
`Available Commands:
/sandhanabot-ping - Check bot latency
/sandhanabot-spaceimage - Get a space image`
  });
});

app.command("/sandhanabot-spaceimage", async ({ ack, respond }) => {
  await ack();

  try {
    const response = await axios.get(`https://api.nasa.gov/planetary/apod?api_key=${process.env.NASA_API_KEY}`);
    if (response.data.media_type === "image") {
      await respond({ 
        blocks: [
          {
            type: "image",
            image_url: response.data.url,
            alt_text: "Space Image of the Day"
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `Explanation of the Space Image of the Day:\n${response.data.explanation}`
            }
          }
        ]
      });
    } else {
      await respond({blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `Today's image isn't actually an IMAGE! Check out the url:\n${response.data.url}`
            }
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `Explanation of the Space Image of the Day:\n${response.data.explanation}`
            }
          }
        ]});
    }
  } catch (err) {
    await respond({ text: "Failed to fetch a space image." });
  }
});

(async () => {
  await app.start();
  console.log("bot is running!");
})();