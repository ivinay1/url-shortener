const Url = require("../models/urlModel");
const generateShortCode = require("../utils/generateShortCode");
const authUtils = require('../utils/authUtils')

const createShortURL = async (req, res) => {
  const userId = req.userId;
  const originalURL = req.body.URL;
  const customAlias = req.body.customAlias?.trim();

  console.log(originalURL);
  // checking if the URL is previously shorted or not
  try {
    console.log("reacher createShortURL");
    const shortedUrl = await Url.findOne({
      userId: userId,
      originalUrl: originalURL,
    });
    console.log("i am here");
    if (shortedUrl) {
      console.log("shortedURL exists");
      return res.status(200).json({
        success: true,
        message: "shortcode exits",
        shortcode: shortedUrl.shortCode,
        originalURL: originalURL,
      });
    } else {
      // check URL
      if (!generateShortCode.checkOriginalURL(originalURL)) {
        console.log("wrwe");
        return res.status(400).json({
          success: false,
          mesaage: "URL is not correct",
          url: originalURL,
        });
      }

      let shortCode;

      // url is valid and customAlias
      if (customAlias) {
        if (!(authUtils.reservedWordsAliases.includes(customAlias) && customAlias.length >= 3 && customAlias.length <= 5)) {
          return res.status(400).json({
            success: false,
            message: "customAlias length between 3 to 5 characters",
          });
        }
        shortCode = customAlias;

        let isShortCodeExists = await Url.findOne({ shortCode: shortCode });

        if(isShortCodeExists)
        {
            return res.status(409).json({
                success: false,
                message: "custom alias already exists"
            })
        }

    } else {
        // url is valid and shortcode
        shortCode = generateShortCode.generateShortCode(6);

         let isShortCodeExists = await Url.findOne({ shortCode: shortCode });

      while (isShortCodeExists) {
        shortCode = generateShortCode.generateShortCode(6);
        isShortCodeExists = await Url.findOne({
          shortCode: shortCode,
        });
      }
        console.log("I am inside isShortCodeExists");
      }

      const urlRecord = await Url.create({
        originalUrl: originalURL,
        shortCode: shortCode,
        clicks: 0,
        userId: userId,
      });

      res.status(201).json({
        success: true,
        message: "shortcode created successfully",
        shortCode: shortCode,
        originalUrl: originalURL,
      });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "internal server error while onnecting to DB",
    });
  }
};

const redirectToOriginal = async (req, res) => {
  // find original URL corresponding to cuurent shortcode in URL collection
  const shortcode = req.params.shortCode;
  console.log("shortcode ", shortcode);
  try {
    const urlRecord = await Url.findOneAndUpdate(
      { shortCode: shortcode },
      { $inc: { clicks: 1 } },
      { returnDocument: "after" },
    );
    // con

    if (!urlRecord) {
      return res.status(404).json({
        success: false,
        message: "No URL exists corresponding to shortCode",
      });
    }

    const originalURL = urlRecord.originalUrl;

    res.redirect(originalURL);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching Original URL",
    });
  }
};

const getUserUrls = async (req, res) => {
  const userID = req.userId;
  let pageNumber = Number(req.query.page) || 1;

  pageNumber = Math.max(pageNumber, 1);

  let limit = Number(req.query.limit) || 3;

  limit = Math.max(limit, 3);
  limit = Math.min(limit, 3);

  let searchItem = req.query.search;

  let query = {
    userId: userID,
  };

  if (searchItem) {
    query.originalUrl = {
      $regex: searchItem,
      $options: "i",
    };
  }

  const skip = (pageNumber - 1) * limit;

  try {
    const totalURLs = await Url.countDocuments(query);
    const userURLs = await Url.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    console.log(userURLs);

    const totalPages = Math.ceil(totalURLs / limit);

    return res.status(200).json({
      success: true,
      userURLsData: userURLs,
      totalURls: totalURLs,
      totalPages: totalPages,
      currentPage: pageNumber,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal server error while getting user URLs",
    });
  }
};

const deleteURL = async (req, res) => {
  const urlId = req.params.urlId;
  const userId = req.userId;

  try {
    const urlRecord = await Url.findById(urlId);
    //check for URL existence
    if (!urlRecord) {
      return res.status(404).json({
        success: false,
        message: "No url found corresponding to this ID",
      });
    }
    // check if current user is authorisd to perform operation
    console.log("URL Record : ", urlRecord);
    console.log(urlRecord.userId);
    console.log(userId);
    if (urlRecord.userId.toString() != userId) {
      return res.status(403).json({
        success: false,
        message: "you are not authorised to perform this action",
      });
    }

    const deletedURLRecord = await Url.findByIdAndDelete(urlId);

    return res.status(200).json({
      success: true,
      message: "successfully deleted",
      originalURL: deletedURLRecord.originalUrl,
      shortcode: deletedURLRecord.shortCode,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal server error while deleting user",
    });
  }
};

const EditURL = async (req, res) => {
  const userId = req.userId;
  const urlId = req.params.urlId;
  const OriginalURL = req.body.URL;

  try {
    const urlRecord = await Url.findById(urlId);
    //check for url record exists
    if (!urlRecord) {
      return res.status(404).json({
        success: false,
        message: "No URL record exists corresponding to URL Id",
      });
    }

    // check authorization
    if (urlRecord.userId.toString() != userId) {
      return res.status(403).json({
        success: false,
        message: "you are not authorised to perform this action",
      });
    }
    // check if updating url is valid or not
    if (!generateShortCode.checkOriginalURL(OriginalURL)) {
      return res.status(400).json({
        success: false,
        message: "URL is not valid",
      });
    }

    const updatedURLRecord = await Url.findByIdAndUpdate(
      urlId,
      { originalUrl: OriginalURL },
      { new: true },
    );

    return res.status(200).json({
      success: true,
      message: "successfully updated original URL",
      OriginalURL: updatedURLRecord.originalUrl,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error while editing a URL Record",
    });
  }
};

const GetAnalytics = async (req, res) => {
  const userId = req.userId;
  const urlId = req.params.urlId;

  try {
    const urlRecord = await Url.findById(urlId);
    //check for url record exists
    if (!urlRecord) {
      return res.status(404).json({
        success: false,
        message: "No URL record exists corresponding to URL Id",
      });
    }

    // check authorization
    if (urlRecord.userId.toString() != userId) {
      return res.status(403).json({
        success: false,
        message: "you are not authorised to perform this action",
      });
    }

    return res.status(200).json({
      success: true,
      message: "successfully got record for analytics",
      analytics: {
        originalUrl: urlRecord.originalUrl,
        shortCode: urlRecord.shortCode,
        clicks: urlRecord.clicks,
        createdAt: urlRecord.createdAt,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error while getting URL for analytics",
    });
  }
};

const GetTopURLs = async (req, res) => {
  const userId = req.userId;

  try {
    const topURLRecord = await Url.find(
      { userId: userId },
      "originalURL shortCode clicks",
    )
      .sort({ clicks: -1 })
      .limit(3);

    return res.status(200).json({
      success: true,
      message: "successfully got top URLs",
      data: topURLRecord,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error while getting top URL",
    });
  }
};

module.exports = {
  createShortURL,
  redirectToOriginal,
  getUserUrls,
  deleteURL,
  EditURL,
  GetAnalytics,
  GetTopURLs,
};
