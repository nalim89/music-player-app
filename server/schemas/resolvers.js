const { AuthenticationError } = require('apollo-server-express');
const { User, Category, Songs } = require('../models');
const { signToken } = require('../utils/auth');

const axios = require('axios');

const resolvers = {
  Query: {
    searchUsers: async (_parent, args) => {
      const search = args.term;
      const rgx = (pattern) => new RegExp(`.*${pattern}.*`);
      const searchRgx = rgx(search);
      return await User.find({
        $or: [
          {
            email: {
              $regex: searchRgx,
              $options: 'i',
            },
          },
          {
            username: {
              $regex: searchRgx,
              $options: 'i',
            }
          },
        ]
      });
    },
    users: async () => {
      return await User.find().populate("songList");
    },
    user: async (_, args) => {
      return await User.findOne({ _id: args.id }).populate("songList");
    },
    me: async (_, _args, context) => {
      if (context.user) {
        return await User.findOne({ _id: context.user._id }).populate("songList");
      }
      throw new AuthenticationError('You need to be logged in!');
    },
    getAllCategories: async () => {
      return await Category.find();
    },
    getAllSong: async () => {
      return await Songs.find();
    },
    getSongsByCategory: async (_parent, args) => {
      const search = args.term;
      const rgx = (pattern) => new RegExp(`.*${pattern}.*`);
      const searchRgx = rgx(search);
      return await Songs.find({
        $or: [
          {
            category: {
              $regex: searchRgx,
              $options: 'i',
            },
          },
        ]
      });
    },
  },

  Mutation: {
    addUser: async (_, args) => {
      const user = await User.create(args);
      const token = signToken(user);
      return { token, user };
    },
    login: async (_, { email, username, password }) => {
      const user = await User.findOne(email ? { email } : { username });

      if (!user) {
        throw new AuthenticationError('No user found with this email address');
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError('Incorrect credentials');
      }

      const token = signToken(user);

      return { token, user };
    },
    saveSong: async (_parent, { songID }, context) => {
      if (context.user) {
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $addToSet: { songList: songID } },
          { new: true }
        );
        return updatedUser;
      }
      throw new AuthenticationError('You need to be logged in!');
    },
    
    removeSong: async (_parent, { songID }, context) => {
      if (context.user) {
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { songList: songID } },
          { new: true }
        );
        return updatedUser;
      }
      throw new AuthenticationError('You need to be logged in!');
    },
  }
};

module.exports = resolvers;
