const cosmos = require("@azure/cosmos");

// initialize a connection to the cosmos javascript client
const { CosmosClient } = cosmos;
const client = new CosmosClient(process.env.COSMOSDB_CONNECTION_STRING);
const database = client.database("YouTubeTools");
const container = database.container("Prompts");

const promptService = {
  async getPrompts() {
    // get all the items from the Prompts container
    const { resources } = await container.items.readAll().fetchAll();
    return resources;
  },
};

module.exports = promptService;
