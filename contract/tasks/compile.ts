import { task } from "hardhat/config";
import fs from "fs";
import path from "path";

function copyRecursiveSync(src: string, dest: string) {
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      if (!fs.existsSync(destPath)) {
        fs.mkdirSync(destPath);
      }
      copyRecursiveSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

task("compile", "Compiles the smart contracts and copies artifacts to multiple locations")
  .setAction(async (args, hre, runSuper) => {
    await runSuper();

    const additionalOutputDir = path.join(__dirname, "../../frontend/src", "_artifacts");

    if (!fs.existsSync(additionalOutputDir)) {
      fs.mkdirSync(additionalOutputDir, { recursive: true });
    }

    const artifactsDir = path.join(__dirname, "..", "artifacts");
    copyRecursiveSync(artifactsDir, additionalOutputDir);

    console.log(`Artifacts have been copied to: ${additionalOutputDir}`);
  });
