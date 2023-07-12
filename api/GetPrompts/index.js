const cosmos = require('@azure/cosmos');

module.exports = async function (context, req) {

    try {
        // initialize a connection to the cosmos javascript client
        const { CosmosClient } = cosmos;
        const client = new CosmosClient(process.env.COSMOSDB_CONNECTION_STRING);
        const database = client.database('YouTubeTools');
        const container = database.container('Prompts');

        // return all the existing prompts from the database using the container object
        const { resources } = await container.items.readAll().fetchAll();

        // return the prompts to the client
        context.res = {
            body: resources
        };
    }
    catch (error) {
        context.res = {
            status: 500,
            body: error.message
        };
    }
}