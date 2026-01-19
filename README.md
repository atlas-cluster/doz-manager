# Lecturer Management System

## Project Description

The goal of this software is to optimize the assignment of lecturers to lectures at a university. The user should be able to find the most suitable lecturer for a lecture.

### Example Use Cases:

1. The user urgently needs a lecturer who can teach Mathematics in a Bachelor's program without preparation.
2. The user is looking for a lecturer who can teach Agile Project Work in the Master's program next semester and has previously taught this subject at Provadis University.

### Key Features:

- **Web Application**: Desktop-based, accessible via browsers
- **Database Integration**: Stores and manages data for lecturers and lectures.

### Reporting Features:

The application allows the generation of reports, which can be displayed in a table format on the web and exported as CSV, JSON, or PDF:

1. List of all lecturers and lectures they have taught at Provadis University (Bachelor and Master).
2. List of all lecturers and lectures they can teach but have never taught at Provadis University (Bachelor and Master).
3. List of all lectures (Bachelor and Master) for which no lecturer is known.
4. List of all lectures (Bachelor and Master) for which only lecturers who have taught at other universities but not at Provadis University are available.

### Typical User Workflow:

1. Select a lecture.
2. Choose Bachelor or Master (default: Bachelor).
3. Choose availability (immediate, within four weeks, or longer; default: immediate).
4. Choose teaching history (Provadis, none, or other universities; default: Provadis).

### Alternative Workflow:

1. Search or select a lecturer.
2. View all lectures the lecturer can teach, with filtering options (e.g., Bachelor, taught at Provadis, etc.).

All combinations of workflows are supported.

---

## Setup on DevClients

<details>
<summary>Click to expand</summary>

### Prerequisites

- Docker Desktop
- Sia-Proxy(http://sia-lb.telekom.de:8080)

### Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/atlas-cluster/doz-manager.git
   cd doz-manager
   ```
2. Set Proxy:
   ```Dockerfile
   #As Windows environment variable
   #In Docker Desktop under settings->Resources->Proxies
   #In Dockerfile.dev
   ENV HTTP_PROXY=http://sia-lb.telekom.de:8080
   ENV HTTPS_PROXY=http://sia-lb.telekom.de:8080
   ENV NO_PROXY=localhost,127.0.0.1
   ```
3. Install bun:
   ```bash
   winget install -e --id Oven-sh.Bun #restart vs-code to apply changes
   ```
4. Install Dependencies:
   ```bash
   bun install #restart vs-code to apply changes
   ```
5. Generate Prisma Client:
   ```bash
   bun prisma:generate
   ```
6. Start the Docker-Container:
   ```bash
   bun run docker:dev #main way
   docker compose -f docker-compose.dev.yml up --build #if you get an error
   ```

</details>
