# Solar Power Logger

A web application designed to record and visualize solar power generation data for portable power stations. Users can easily input daily recovery percentages, view comprehensive generation statistics through interactive charts, manage their data in a tabular format, and conveniently import or export data via CSV files.

## Features

*   **Data Input & Tracking**: Effortlessly record daily solar power recovery percentages.
*   **Interactive Visualization**: Visualize solar power generation statistics with dynamic charts powered by Recharts.
*   **Data Management**: Manage and review all your recorded data in an intuitive table format.
*   **CSV Import/Export**: Seamlessly import existing data or export your current data for backup and analysis.
*   **Multi-Station Support**: Pre-configured to track data for various popular power stations, including River2, River3, Delta3, and EB3A.

## Technologies Used

This project is built with a modern web stack:

*   **Frontend**: React.js (v19)
*   **Build Tool**: Vite (v6)
*   **Language**: TypeScript
*   **Routing**: React Router DOM
*   **Icons**: Heroicons
*   **Charting**: Recharts

## Setup and Installation

### Prerequisites

Before you begin, ensure you have the following installed:

*   [Node.js](https://nodejs.org/en/) (LTS version recommended)
*   [npm](https://www.npmjs.com/) (comes with Node.js)
*   [Docker](https://www.docker.com/get-started) and [Docker Compose](https://docs.docker.com/compose/install/) (if you plan to use the Docker setup)

### Local Development Setup

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/solar-power-logger.git
    cd solar-power-logger
    ```
    *(Note: Replace `https://github.com/your-username/solar-power-logger.git` with the actual repository URL if available.)*

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Set up environment variables**:
    Refer to `.env.example` for structure.

4.  **Run the development server**:
    ```bash
    npm run dev
    ```
    The application will typically be available at `http://localhost:5173` (or another port if 5173 is in use).

### Docker Setup

For a containerized environment, you can use Docker Compose:

1.  **Build the Docker images**:
    ```bash
    docker-compose build
    ```

2.  **Start the containers**:
    ```bash
    docker-compose up -d
    ```
    The application will be accessible via the port configured in `nginx.conf` (e.g., `http://localhost:80`).

## Usage

Once the application is running, navigate to the provided URL in your web browser.

*   **Input Data**: Use the data input form to add new solar power generation records, including daily recovery percentages.
*   **View Charts**: Explore the "Data Visualization" section to see graphical representations of your solar power statistics over time.
*   **Manage Table**: Go to the "Data Table" page to view, edit, or delete individual data entries.
*   **Import/Export**: Utilize the CSV tools to import historical data or export your current dataset.

## Project Structure

```
.
├── public/                 # Static assets
├── src/
│   ├── assets/             # Example CSV data
│   ├── components/         # React components (CsvTools, DataInputForm, DataTablePage, DataVisualization, Modal, Navbar)
│   ├── services/           # Data handling services (dataService.ts)
│   ├── App.tsx             # Main application component
│   ├── index.html          # HTML entry point
│   ├── index.tsx           # React application entry point
│   ├── constants.ts        # Application constants (e.g., power station configurations)
│   ├── types.ts            # TypeScript type definitions
│   └── vite-env.d.ts       # Vite environment type definitions
├── .dockerignore           # Files to ignore in Docker builds
├── .env.example            # Example environment variables
├── .gitignore              # Git ignore rules
├── Dockerfile              # Dockerfile for production build
├── Dockerfile.dev          # Dockerfile for development build
├── LICENSE                 # Project license
├── README.md               # This README file
├── docker-compose.yml      # Docker Compose configuration
├── metadata.json           # Project metadata and description
├── nginx.conf              # Nginx configuration for Docker
├── package.json            # Project dependencies and scripts
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite build configuration
```

## License

This project is licensed under the [Apache 2.0 License](LICENSE).
