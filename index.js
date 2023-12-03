#!/usr/bin/env node

// inspired by Tom MacWright's approach with: https://github.com/tmcw/bespoke

import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import prettyBytes from "pretty-bytes";
import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";

// all of the sizes and formats to generat for each image
const sizes = [128, 640, 1280, 2880];
const formats = ["jpg", "webp", "avif"];

async function main(srcImagePath, outputDir, resizeImages = true) {
  console.log(`Generating images for ${srcImagePath}`);
  const ext = path.extname(srcImagePath);
  const name = path.basename(srcImagePath, ext);
  const input = await fs.readFile(srcImagePath);
  // first, generate an image at the original size in jpeg format, with no metadata
  if (resizeImages) {
    const originalName = `${name}_original.jpg`;
    const originalPath = path.join(outputDir, originalName);
    await sharp(input).rotate().toFile(originalPath);
    const originalFile = await fs.readFile(originalPath);
    console.log(
      `Format: $jpg, Res: original, Size: ${prettyBytes(
        originalFile.byteLength,
      )}`,
    );
    // loop through all sizes and formats and generate each one
    for (let size of sizes) {
      for (let format of formats) {
        const outputName = `${name}_${size}.${format}`;
        const outputPath = path.join(outputDir, outputName);
        await sharp(input).rotate().resize(size).toFile(outputPath);
        const outputFile = await fs.readFile(outputPath);
        console.log(
          `Format: ${format}, Res: ${size}, Size: ${prettyBytes(
            outputFile.byteLength,
          )}`,
        );
      }
    }
  } else {
    for (let format of formats) {
      const outputName = `${name}.${format}`;
      const outputPath = path.join(outputDir, outputName);
      await sharp(input).rotate().toFile(outputPath);
      const outputFile = await fs.readFile(outputPath);
      console.log(
        `Format: ${format}, Res: original, Size: ${prettyBytes(
          outputFile.byteLength,
        )}`,
      );
    }
  }
}

const args = yargs(hideBin(process.argv))
  .command("$0 <srcImage> <outputDir>", "process images", () => {})
  .option("n", {
    alias: "noresize",
    type: "boolean",
    description: "do not resize images",
    default: false,
  }).argv;

main(args.srcImage, args.outputDir, !args.noresize);
