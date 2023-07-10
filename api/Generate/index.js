var fetch = require("node-fetch");

module.exports = async function (context, req) {

    // read the transcript variable off the request body
    const prompt = req.body.prompt;

    // call the OpenAI API to generate a summary
    let openAIReq = {
        model: "gpt-3.5-turbo",
        messages: [{ "role": "system", "content": "You are a creative writing assistant that writes blog posts when given a trascript from a video. Format all your responses as Markdown. Use creative writing to expand on the transcript of the video to provide a unique perspective. Fill in code examples where you can guess from the transcript what code is being displayed. Make your response as long as the token limit will allow." }, { "role": "user", "content": `Write a blog post for the following transcript: ${prompt}` }]
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