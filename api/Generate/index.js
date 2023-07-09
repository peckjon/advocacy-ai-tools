module.exports = async function (context, req) {

    // read the transcript variable off the request body
    const transcript = req.body.transcript;

    // call the OpenAI API to generate a summary
    let openAIReq = {
        model: "gpt-3.5-turbo",
        messages: [{ "role": "system", "content": "You are an auto blogging AI. Format all your responses as HTML but leave off the html, head and body tags." }, { "role": "user", "content": "Write a blog post based on the following transcript: " + transcript }]
    };

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPEN_AI_API_KEY}`,
        },
        body: JSON.stringify(openAIReq),
    });

    context.res = {
        // status: 200, /* Defaults to 200 */
        body: responseMessage
    };
}