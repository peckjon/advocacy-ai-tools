const cosmos = require("@azure/cosmos");

module.exports = async function (context, req) {
  try {
    // initialize a connection to the cosmos javascript client
    const { CosmosClient } = cosmos;
    const client = new CosmosClient(process.env.COSMOSDB_CONNECTION_STRING);
    const database = client.database("YouTubeTools");
    const container = database.container("Prompts");

    // get all the items from the Prompts container
    const { resources } = await container.items.readAll().fetchAll();

    // loop over the resources and compose an HTML fragement consisting of options for a select element
    let html = "";
    resources.forEach((prompt) => {
      html += `<option value="${prompt.systemPrompt}">${prompt.promptName}</option>`;
    });

    // return the prompts to the client
    context.res = {
      body: { systemPrompts: resources },
    };
  } catch (error) {
    context.res = {
      status: 500,
      body: error.message,
    };
  }
};
