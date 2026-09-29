# Al-Tayer Platform

A personal project by **Waleed Tareq** for trying different approaches to a university campus food ordering and queue management platform. This repository brings together a Super Admin dashboard, a merchant portal, and an ASP.NET Core Web API. It is a learning and experimentation project, not a production deployment.

## Project structure

| Path | Purpose |
| --- | --- |
| `index.html`, `styles.css`, `app.js` | Interactive Super Admin dashboard |
| `merchant-portal/` | Merchant-facing web interface |
| `AlTayer.API/` | ASP.NET Core 8 API, data models, and authentication |
| `AlTayer.sln` | Visual Studio solution |
| `serve.py`, `Run Dashboard.bat` | Local dashboard server and Windows launcher |

## Explore locally

**Super Admin dashboard:** On Windows, double-click `Run Dashboard.bat`, or run `python serve.py` from the repository root. Open the local address printed by the server (typically `http://127.0.0.1:8080/`).

**API:** Install the .NET 8 SDK and SQL Server LocalDB, then run:

```bash
cd AlTayer.API
dotnet restore
dotnet run
```

The API project documents its Swagger page, routes, and sample merchant token in [AlTayer.API/README.md](AlTayer.API/README.md). The dashboard and API are separate parts of the repository; running the dashboard does not automatically start the API.

## What this project explores

- A responsive Super Admin dashboard with summary cards, charts, and an order monitor
- Merchant menu endpoints and item availability
- ASP.NET Core Web API, Entity Framework Core, LocalDB, and JWT-based development flows

## Development note

The checked-in configuration includes a sample JWT signing key and a development token endpoint. Use this repository only in a local test environment. Before any public deployment, disable development tokens, replace the key with a secret supplied outside source control, and review authentication, CORS, and database settings.
