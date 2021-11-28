const { User } = require('../models');
const { signToken } = require('../utils/auth');
const { AuthenticationError } = require('apollo-server-express');

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      // console.log(context);
      if (context.user) {

        const foundUser = await User.findOne({ username: context.user.username });
        
        if (!foundUser) {
          return new AuthenticationError('User not found!');
        }

        
        return foundUser;
      }

      return new AuthenticationError('You must be logged in!');
    }
  },
  Mutation: {
    test: async (parent, { str }) => {
      return { str };
    },
    addUser: async (parent, { username, password, email }) => {
      // return new Error(username);

      const user = await User.create({ username, email, password});

      if (!user) {
        throw new AuthenticationError('Something is wrong!')
      }
      const token = signToken(user);
      return { token, user };
    },
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email: email });
      if (!user) {
        throw new AuthenticationError("Can't find this user");
      }
  
      const correctPw = await user.isCorrectPassword(password);
  
      if (!correctPw) {
        throw new AuthenticationError("Wrong password");
      }
      const token = signToken(user);
      return { token, user };
    },
    saveBook: async (parent, input, context) => {
      console.log(context.user);
      if(context.user) {
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $addToSet: { savedBooks: { ...input } } },
          { new: true, runValidators: true }
          );
        return updatedUser;
      }
      throw new AuthenticationError('You must be logged in!');
    },
    removeBook: async (parent, { bookId }, context) => {
      console.log(bookId);
      if(context.user) {
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: { bookId: bookId } } },
          { new: true }
        );
        return updatedUser;
      }
      throw new AuthenticationError('You must be logged in!');
    }
  },
};

module.exports = resolvers;
