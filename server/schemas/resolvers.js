const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');

const axios = require('axios');
require('dotenv').config();
const API_KEY = process.env.REACT_APP_SPOTIFY_TOKEN;

const resolvers = {
  Query: {
    searchUsers: async (_parent, args) => {
      const search = args.term;
      const rgx = (pattern) => new RegExp(`.*${pattern}.*`);
      const searchRgx = rgx(search);
      return User.find({
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
      return User.find();
    },
    user: async (_, args) => {
      return User.findOne({ _id: args.id });
    },
    me: async (_, _args, context) => {
      if (context.user) {
        return User.findOne({ _id: context.user._id });
      }
      throw new AuthenticationError('You need to be logged in!');
    },
    playlist: async (_, args, context) => {
      //https://api.spotify.com/v1/me/playlists
      const { data } = await axios.get(
        'https://api.spotify.com/v1/me/playlists',
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': API_KEY
          }
        }
      );

      console.log(data);

      return data;
    },
    categories: async (_, args, context) => {
      //https://api.spotify.com/v1/browse/categories
      const { data } = await axios.get(
        'https://api.spotify.com/v1/browse/categories',
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': API_KEY
          }
        }
      );

      console.log(data);

      return data;
    },
    category_playlist: async (_, args, context) => {
      //https://api.spotify.com/v1/browse/categories/[categoryID]/playlists
      const { data } = await axios.get(
        'https://api.spotify.com/v1/browse/categories/0JQ5DAqbMKFAXlCG6QvYQ4/playlists',
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': API_KEY
          }
        }
      );

      console.log(data);

      return data;
    },
    track: async (_, args, context) => {
      //https://api.spotify.com/v1/playlists/3[playlistId]/tracks
      const { data } = await axios.get(
        'https://api.spotify.com/v1/playlists/37i9dQZF1DXcWBRiUaG3o5/tracks',
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': API_KEY
          }
        }
      );

      console.log(data);

      return data;
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
    }
  }
};

module.exports = resolvers;
