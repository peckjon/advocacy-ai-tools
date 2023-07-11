var fetch = require("node-fetch");
var { encode } = require("gpt-3-encoder");

module.exports = async function (context, req) {

    // read the transcript variable off the request body
    const userPrompt = `Perform your task based on the following video transcript: ${req.body.transcript}`;
    const systemPrompt = req.body.prompt;

    // encode the prompts
    const promptEncoded = encode(userPrompt);
    const systemPromptEncoded = encode(systemPrompt);

    const availableTokenLength = 1600 - (promptEncoded.length + systemPromptEncoded.length);

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
        body: json
    };
}