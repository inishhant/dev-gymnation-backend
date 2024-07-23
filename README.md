# Dev GymNation Backend

This is the backend for the GymNation application. It is built using Node.js, Express, and MongoDB, with various other dependencies.

## Table of Contents

- [Description](#description)
- [Installation](#installation)
- [Usage](#usage)
- [Scripts](#scripts)
- [Dependencies](#dependencies)
- [Author](#author)
- [License](#license)

## Description

This backend application serves as the server-side logic for the GymNation application. It handles API requests, authentication, and data storage.

## Installation

To install the necessary dependencies and set up the project, follow these steps:

1. Clone the repository:
    ```sh
    git clone https://github.com/inishhant/dev-gymnation-backend.git
    ```

2. Navigate to the project directory:
    ```sh
    cd dev-gymnation-backend
    ```

3. Install the dependencies:
    ```sh
    npm install
    ```

4. Create a `.env` file in the root directory and add your environment variables:
    ```env
    MONGODB_URI=<your_mongodb_uri>
    ACCESS_TOKEN_SECRET=<your_access_token_secret>
    ```

## Usage

To start the development server, run:
```sh
npm run dev
