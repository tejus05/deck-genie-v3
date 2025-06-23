const builder = require("electron-builder")

const config = {
  appId: "ai.presenton",
  asar: false,
  directories: {
    output: "dist",
  },
  files: [
    "resources",
    "app_dist",
    "node_modules",
    "NOTICE",
  ],
  linux: {
    artifactName: "Presenton-${version}.${ext}",
    target: ["AppImage"],
    icon: "resources/ui/assets/images/presenton_short_filled.png",
  },
}


builder.build({ config })