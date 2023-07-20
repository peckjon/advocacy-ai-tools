# Advocacy AI Tools

Use GPT to generate social content.

## Running Locally

### Prerequsites

- [Azure Static Web Apps CLI](https://www.npmjs.com/package/@azure/static-web-apps-cli)
- At least Node v18 (this is not a recommendation - the app will not work on previous versions because the API needs fetch. Don't ask why - the answer isn't a good one.)

### Setup

1. Rename the `RENAME_THIS.local.settings.json` to `local.setting.json`
2. Populate the `AZURE_OPENAI_KEY` and `COSMOSDB_CONNECTION_STRING` settings in the `local.settings.json` file with the correct values (ping Burke for Cosmos DB).

### Running

You'll need to run both the API and frontend. The emulator should do both with a single command...

```bash
swa start --api-location ./api
```

If it doesn't start the API, open a separate terminal instance and run `func start`.
