import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

/**
 * GET ALL VIDEOS (with pagination, search, sorting)
 */
const getAllVideos = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    query = "",
    sortBy = "createdAt",
    sortType = "desc",
    userId,
  } = req.query;

  const match = {
    isPublished: true,
  };

  if (query) {
    match.title = { $regex: query, $options: "i" };
  }

  if (userId && isValidObjectId(userId)) {
    match.owner = new mongoose.Types.ObjectId(userId);
  }

  const videos = await Video.aggregate([
    { $match: match },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              fullName: 1,
              username: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        owner: { $first: "$owner" },
      },
    },
    {
      $sort: {
        [sortBy]: sortType === "asc" ? 1 : -1,
      },
    },
    { $skip: (page - 1) * limit },
    { $limit: Number(limit) },
  ]);

  return res.status(200).json(
    new ApiResponse(200, videos, "Videos fetched successfully →")
  );
});

/**
 * PUBLISH A VIDEO
 */
const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description, duration } = req.body;

  if (!title || !description || !duration) {
    throw new ApiError(400, "Title, description and duration are required");
  }

  const videoLocalPath = req.files?.videoFile?.[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

  if (!videoLocalPath || !thumbnailLocalPath) {
    throw new ApiError(400, "Video file and thumbnail are required");
  }

  const videoUpload = await uploadOnCloudinary(videoLocalPath);
  const thumbnailUpload = await uploadOnCloudinary(thumbnailLocalPath);

  if (!videoUpload?.url || !thumbnailUpload?.url) {
    throw new ApiError(500, "Error uploading video or thumbnail");
  }

  const video = await Video.create({
    title,
    description,
    duration,
    videoFile: videoUpload.url,
    thumbnail: thumbnailUpload.url,
    owner: req.user._id,
  });

  return res.status(201).json(
    new ApiResponse(201, video, "Video published successfully 🎬")
  );
});

/**
 * GET VIDEO BY ID
 */
const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const video = await Video.findById(videoId).populate("owner", "fullName username avatar");

  if (!video || !video.isPublished) {
    throw new ApiError(404, "Video not found");
  }

  video.views += 1;
  await video.save({ validateBeforeSave: false });

  return res.status(200).json(
    new ApiResponse(200, video, "Video fetched successfully")
  );
});

/**
 * UPDATE VIDEO
 */
const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not allowed to update this video");
  }

  if (title) video.title = title;
  if (description) video.description = description;

  const thumbnailLocalPath = req.file?.path;
  if (thumbnailLocalPath) {
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    if (!thumbnail?.url) {
      throw new ApiError(500, "Thumbnail upload failed");
    }
    video.thumbnail = thumbnail.url;
  }

  await video.save();

  return res.status(200).json(
    new ApiResponse(200, video, "Video updated successfully")
  );
});

/**
 * DELETE VIDEO
 */
const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not allowed to delete this video");
  }

  await video.deleteOne();

  return res.status(200).json(
    new ApiResponse(200, {}, "Video deleted successfully")
  );
});

/**
 * TOGGLE PUBLISH STATUS
 */
const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not allowed to change publish status");
  }

  video.isPublished = !video.isPublished;
  await video.save({ validateBeforeSave: false });

  return res.status(200).json(
    new ApiResponse(200, video, "Publish status updated successfully")
  );
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
