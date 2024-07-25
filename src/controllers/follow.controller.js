import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { Follower } from "../models/follower.model.js";
import { FollowRequest } from "../models/followRequest.model.js";
import { followNotification } from "../utils/notifications.js"
import { ApiResponse } from "../utils/ApiResponse.js";

const sendFollowRequest = asyncHandler(async (req, res) => {
    const { toUserId } = req.body;
    const fromUserId = req.user._id;

    const toUser = await User.findById(toUserId);
    if (!toUser) {
        throw new ApiError(404, "This is user not exist");
    }

    const existingRequest = await FollowRequest.findOne({ fromUser: fromUserId, toUser: toUserId });

    if (existingRequest) {
        throw new ApiError(400, "Follow request already sent.");
    }

    if (toUser.Account_type === 'public') {
        const follower = new Follower({
            userId: toUserId,
            followerId: fromUserId
        });
        await follower.save();

        await Promise.all([
            User.findByIdAndUpdate(toUserId, { $inc: { followersCount: 1 } }),
            User.findByIdAndUpdate(fromUserId, { $inc: { followingCount: 1 } })
        ]);

        await createNotification(toUserId, `${fromUser.username} has started following you.`, 'followAccepted');

        return res
            .status(200)
            .json(new ApiResponse(200, follower, "You are now following the user."));
    }

    const followRequest = new FollowRequest({
        fromUser: fromUserId,
        toUser: toUserId,
        status: 'pending',
    })

    await followRequest.save();

    const fromUser = await User.findById(fromUserId);

    await followNotification(toUserId, `${fromUser.username} has sent you a follow request.`, 'followRequest')

    return res
        .status(200)
        .json(new ApiResponse(200, followRequest, "Follow request sent successfully."));
})

const respondToFollowRequest = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { response } = req.body;
    const { userId } = req.user._id;

    const followRequest = await FollowRequest.findById(id);

    if (!followRequest || followRequest.toUser.toString() !== userId.toString()) {
        throw new ApiError(404, "Follow request not found.");
    }

    if (response === 'accept') {
        followRequest.status = 'accepted';
        await followRequest.save();

        const follower = new Follower({
            userId: followRequest.toUser,
            followerId: followRequest.fromUser
        });
        await follower.save();

        await Promise.all([
            User.findByIdAndUpdate(userId, { $inc: { followersCount: 1 } }),
            User.findByIdAndUpdate(id, { $inc: { followingCount: 1 } })
        ]);

        await createNotification(followRequest.fromUser, `${fromUser.username} has accepted your follow request.`, 'followAccepted');

        return res.status(200).json(new ApiResponse(200, follower, "Follow request accepted."));
    } else if (response === 'decline') {
        followRequest.status = 'declined';
        await followRequest.save();

        // Optionally, remove the declined request
        await FollowRequest.findByIdAndDelete(id);
        
        await createNotification(followRequest.fromUser, `${fromUser.username} has declined your follow request.`, 'followDeclined');

        return res.status(200).json(new ApiResponse(200, followRequest, "Follow request declined."));
    } else {
        throw new ApiError(400, "Invalid response.");
    }
})

const getFollowers = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const pipeline = [
        {
            $match: { userId: mongoose.Types.ObjectId(id) }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'followerId',
                foreignField: '_id',
                as: 'followerDetails'
            }
        },
        {
            $unwind: '$followerDetails'
        },
        {
            $project: {
                'followerDetails.username': 1,
                'followerDetails.firstName': 1,
                'followerDetails.lastName': 1
            }
        },
        {
            $sort: { 'followerDetails.username': 1 }
        }
    ];

    const followers = await Follower.aggregate(pipeline).exec();

    return res
        .status(200)
        .json(new ApiResponse(200, followers, "Followers retrieved successfully."));
});

const getFollowing = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const pipeline = [
        {
            $match: { userId: mongoose.Types.ObjectId(id) }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'userId',
                foreignField: '_id',
                as: 'followerDetails'
            }
        },
        {
            $unwind: '$followerDetails'
        },
        {
            $project: {
                'followerDetails.username': 1,
                'followerDetails.firstName': 1,
                'followerDetails.lastName': 1
            }
        },
        {
            $sort: { 'followerDetails.username': 1 }
        }
    ];

    const following = await Follower.aggregate(pipeline).exec();

    return res
        .status(200)
        .json(new ApiResponse(200, following, "following retrieved successfully."));
});

export { sendFollowRequest, respondToFollowRequest, getFollowers, getFollowing };