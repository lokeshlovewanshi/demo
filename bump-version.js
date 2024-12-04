#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const readline = require("readline");

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Paths to configuration files
const PATHS = {
  packageJson: path.join(process.cwd(), "package.json"),
  appJson: path.join(process.cwd(), "app.json"),
  gradleBuild: path.join(process.cwd(), "android", "app", "build.gradle"),
};

// Function to read JSON file
function readJsonFile(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

// Function to write JSON file
function writeJsonFile(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// Function to update version in package.json
function updatePackageJsonVersion(newVersion) {
  const packageJson = readJsonFile(PATHS.packageJson);
  packageJson.version = newVersion;
  writeJsonFile(PATHS.packageJson, packageJson);
  console.log("Updated package.json version");
}

// Function to update version and version code in app.json
function updateAppJsonVersion(newVersion, currentVersionCode) {
  const appJson = readJsonFile(PATHS.appJson);

  // Update version
  appJson.expo.version = newVersion;

  // Update Android version code
  if (appJson.expo.android) {
    appJson.expo.android.versionCode = currentVersionCode + 1;
  }

  writeJsonFile(PATHS.appJson, appJson);
  console.log("Updated app.json version and version code");

  return appJson.expo.android
    ? appJson.expo.android.versionCode
    : currentVersionCode + 1;
}

// Function to update version and version code in build.gradle
function updateGradleBuildVersion(newVersion, newVersionCode) {
  let gradleBuildContent = fs.readFileSync(PATHS.gradleBuild, "utf8");

  // Update version name
  gradleBuildContent = gradleBuildContent.replace(
    /versionName\s+["'].*["']/,
    `versionName "${newVersion}"`
  );

  // Update version code
  gradleBuildContent = gradleBuildContent.replace(
    /versionCode\s+\d+/,
    `versionCode ${newVersionCode}`
  );

  fs.writeFileSync(PATHS.gradleBuild, gradleBuildContent);
  console.log("Updated build.gradle version and version code");
}

// Function to create a new branch and commit changes
function createBranchAndCommit(newVersion) {
  try {
    // Get current branch name
    const currentBranch = execSync("git rev-parse --abbrev-ref HEAD")
      .toString()
      .trim();
    //fetch origin
    execSync(`git fetch origin`);

    // Create and checkout new branch
    const newBranchName = `release/v${newVersion}`;
    execSync(`git checkout -b ${newBranchName} origin/dev`);

    // Stage changes
    execSync("git add package.json app.json android/app/build.gradle");

    // Commit changes
    execSync(`git commit -m "Bump version to ${newVersion}"`);

    // Push new branch
    execSync(`git push -u origin ${newBranchName}`);

    console.log(`Created and pushed new branch: ${newBranchName}`);
    return newBranchName;
  } catch (error) {
    console.error("Error creating branch or committing:", error);
    return null;
  }
}

// Main function to handle version update
async function updateVersion() {
  try {
    // Read current version from app.json
    const appJson = readJsonFile(PATHS.appJson);
    const currentVersion = appJson.expo.version;
    const currentVersionCode = appJson.expo.android
      ? appJson.expo.android.versionCode
      : 1;

    // Prompt for new version
    rl.question(
      `Current version is ${currentVersion}. Please enter the new release version: `,
      (newVersion) => {
        // Validate version format
        const versionRegex = /^\d+\.\d+$/;
        if (!versionRegex.test(newVersion)) {
          console.error(
            "Invalid version format. Please use X.Y.Z format (e.g., 1.2.3)"
          );
          rl.close();
          return;
        }

        try {
          // Update versions in different files
          updatePackageJsonVersion(newVersion);
          const newVersionCode = updateAppJsonVersion(
            newVersion,
            currentVersionCode
          );
          updateGradleBuildVersion(newVersion, newVersionCode);

          // Create branch and commit
          const newBranchName = createBranchAndCommit(newVersion);

          if (newBranchName) {
            console.log("Version update completed successfully!");
          }

          rl.close();
        } catch (error) {
          console.error("Error updating version:", error);
          rl.close();
        }
      }
    );
  } catch (error) {
    console.error("Error reading configuration:", error);
    rl.close();
  }
}

// Run the version update
updateVersion();
