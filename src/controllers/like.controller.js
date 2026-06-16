import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * TOGGLE LIKE ON VIDEO
 * Route: POST /toggle/v/:videoId
 */
const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user._id;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const existingLike = await Like.findOne({
    video: videoId,
    likedBy: userId,
  });

  if (existingLike) {
    await existingLike.deleteOne();
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Video unliked"));
  }

  await Like.create({
    video: videoId,
    likedBy: userId,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, {}, "Video liked"));
});

/**
 * TOGGLE LIKE ON COMMENT
 * Route: POST /toggle/c/:commentId
 */
const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user._id;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment ID");
  }

  const existingLike = await Like.findOne({
    comment: commentId,
    likedBy: userId,
  });

  if (existingLike) {
    await existingLike.deleteOne();
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Comment unliked"));
  }

  await Like.create({
    comment: commentId,
    likedBy: userId,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, {}, "Comment liked"));
});

/**
 * TOGGLE LIKE ON TWEET
 * Route: POST /toggle/t/:tweetId
 */
const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const userId = req.user._id;

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet ID");
  }

  const existingLike = await Like.findOne({
    tweet: tweetId,
    likedBy: userId,
  });

  if (existingLike) {
    await existingLike.deleteOne();
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Tweet unliked"));
  }

  await Like.create({
    tweet: tweetId,
    likedBy: userId,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, {}, "Tweet liked"));
});

/**
 * GET ALL VIDEOS LIKED BY USER
 * Route: GET /videos
 */
const getLikedVideos = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const likedVideos = await Like.aggregate([
    {
      $match: {
        likedBy: new mongoose.Types.ObjectId(userId),
        video: { $exists: true },
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "video",
        pipeline: [
          {
            $project: {
              title: 1,
              thumbnail: 1,
              duration: 1,
              views: 1,
              owner: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        video: { $first: "$video" },
      },
    },
    {
      $match: {
        video: { $ne: null },
      },
    },
    {
      $sort: { createdAt: -1 },
    },
  ]);

  return res.status(200).json(
    new ApiResponse(200, likedVideos, "Liked videos fetched successfully")
  );
});

export {
  toggleVideoLike,
  toggleCommentLike,
  toggleTweetLike,
  getLikedVideos,
};
