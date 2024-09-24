import packageJson from "../package.json";

const browser = process.env.BROWSER ?? "chrome";
const isFirefox = browser === "firefox";
const isChrome = browser === "chrome";
const isProd = process.env.NODE_ENV === "production";

export default {
  manifest_version: 3,
  version: packageJson.version,
  name: "GitOwl - Open Source Insights At a Glance",
  short_name: "GitOwl",
  description:
    "GitOwl provides a sidebar with contextual insights to help you navigate the world of open source.",
  homepage_url: "https://gitowl.dev",

  icons: {
    "16": "favicon@16x16.png",
    "48": "favicon@48x48.png",
    "128": "favicon@128x128.png",
  },

  permissions: ["storage"],

  content_scripts: [
    {
      js: ["src/content/index.js"],
      matches: [
        "https://github.com/*",
        "https://www.npmjs.com/*",
        "https://pypi.org/*",
      ],
      all_frames: false,
    },
  ],

  web_accessible_resources: [
    {
      resources: ["src/frame/index.html", "src/frame/index.js"],
      matches: [
        "https://github.com/*",
        "https://www.npmjs.com/*",
        "https://pypi.org/*",
      ],
    },
  ],

  ...(isChrome
    ? {
        externally_connectable: {
          matches: isProd
            ? ["https://gitowl.dev/*"]
            : [
                "http://localhost:*/*",
                "https://gitowl.dev/*",
                "https://*.gitowl.dev/*",
              ],
        },

        background: {
          service_worker: "src/worker/index.js",
        },
      }
    : {}),

  ...(isFirefox
    ? {
        browser_specific_settings: {
          gecko: {
            id: "gitowl@gitowl.dev",
          },
        },
      }
    : {}),
} satisfies chrome.runtime.ManifestV3;
