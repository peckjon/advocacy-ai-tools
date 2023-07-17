const promptService = require("../services/promptService");
const handlebars = require("handlebars");
const fs = require("fs");

module.exports = async function (context, req) {
  try {
    // read the accessToken from the query string
    const accessToken = req.query.accessToken;

    // get the prompts from the promptService
    const prompts = await promptService.getPrompts(accessToken);

    // load the template file from disk and compile it with handlebars
    const template = handlebars.compile(
      fs.readFileSync(__dirname + "template.html", "utf8")
    );

    // render the template with the prompts
    const html = template({ accessToken: accessToken, prompts: prompts });

    context.res = {
      headers: {
        "Content-Type": "text/html",
      },
      body: responseMessage,
    };
  } catch (error) {
    context.res = {
      status: 500,
      body: error.message,
    };
  }
};
