const fetch = require("node-fetch");
const { encode } = require("gpt-3-encoder");
const authService = require("../services/authService");

module.exports = async function (context, req) {

  // read the source and prompt parameters from the body of the request. The body is www-form-urlencoded.
  const { userPrompt, systemPrompt } = req.body;

  // encode the prompts
  const userPromptEncoded = encode(userPrompt);
  const systemPromptEncoded = encode(systemPrompt);

  const availableTokenLength = 1600 - (userPromptEncoded.length + systemPromptEncoded.length);

  // call the OpenAI API to generate a summary
  let openAIReq = {
    model: "gpt-3.5-turbo-16k",
    messages: [{ "role": "system", "content": `${systemPrompt} You have ${availableTokenLength} available tokens for your response.` }, { "role": "user", "content": userPrompt }]
  };

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify(openAIReq),
  });

  const json = await response.json();

  context.res = {
    status: response.status,
    headers: {
      "Content-Type": "text/html",
    },
    body: { completion: json.choices[0].message.content, usedTokens: json.usage.total_tokens, availableTokens: 16000 }
  };
}
