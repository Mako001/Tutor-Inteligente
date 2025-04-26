# AprendeTech Colombia

This is a NextJS application for creating learning activity proposals tailored to the Colombian educational context.

## Getting Started

1.  Clone this repository to your local machine.
2.  Install the dependencies using `npm install` or `yarn install`.
3.  Set up the environment variables:
    *   Create a `.env` file in the root directory.
    *   Add your Google Gemini API key: `GOOGLE_GENAI_API_KEY=YOUR_API_KEY`.
4.  Run the development server with `npm run dev` or `yarn dev`.
5.  Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.

## Creating a Git Repository and Pushing to GitHub

1.  Initialize a Git repository in your project directory:

    ```bash
    git init
    ```

2.  Add all the files to the repository:

    ```bash
    git add .
    ```

3.  Commit the changes with a message:

    ```bash
    git commit -m "Initial commit"
    ```

4.  Create a new repository on GitHub under your account (Mako001).
5.  Link your local repository to the remote repository on GitHub:

    ```bash
    git remote add origin https://github.com/Mako001/AprendeTechColombia.git
    ```

    Replace `https://github.com/Mako001/AprendeTechColombia.git` with the actual URL of your GitHub repository.
6.  Push the code to GitHub:

    ```bash
    git push -u origin main
    ```

    If you encounter any issues, you might need to configure your Git username and email:

    ```bash
    git config --global user.email "youremail@example.com"
    git config --global user.name "Your Name"
    ```

## Firebase Studio

This project was generated using Firebase Studio.

To get started, take a look at `src/app/page.tsx`.
