const Follow = require("../models/follow");
const user = require("../models/user");
const followUserIds = async (identityUserId) => {
  try {
    // Sacar info de seguimiento
    let following = await Follow.find({ user: identityUserId })
      .select({
        followed: 1,
        _id: 0,
      })
      .populate("followed", "name");
    let followers = await Follow.find({ followed: identityUserId })
      .select({
        user: 1,
        _id: 0,
      })
      .populate("user", "name");
      // Procesar array de identificadores
      let followingClean = []
      following.forEach(follow => {
        followingClean.push(follow.followed)
      });
      let followersClean = []
      followers.forEach(follow => {
        followersClean.push(follow.user)
      });
    return {
      following: followingClean,
      followers: followersClean
    };
  } catch (error) {
    return {};
  }
};

const followThisUser = async (identityUserId, profileUserId) => {
  let following = await Follow.findOne({user: identityUserId })
  
let follower = await Follow.findOne({ user: profileUserId })
  
  return{
    following,
    follower
  }
};

module.exports = {
  followUserIds,
  followThisUser,
};
