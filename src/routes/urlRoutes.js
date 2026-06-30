const express = require("express");
const auth = require("../middleware/auth");
const urlController = require("../controllers/urlController");

const router = express.Router();

router.post("/shorturl", auth, urlController.createShortURL);

router.get("/myurls", auth, urlController.getUserUrls);

router.get("/:shortCode", urlController.redirectToOriginal);

router.delete("/url/:urlId", auth, urlController.deleteURL);

router.put("/url/:urlId", auth, urlController.EditURL);

router.get("/analytics/:urlID", auth, urlController.GetAnalytics);

router.get("/top-urls", auth, urlController.GetTopURLs);

module.exports = router;
