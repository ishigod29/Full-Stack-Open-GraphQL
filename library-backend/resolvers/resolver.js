const { UserInputError, AuthenticationError } = require('apollo-server')
const Book = require('../models/Book')
const Author = require('../models/Author')
const User = require('../models/User')
const jwt = require('jsonwebtoken')
const { PubSub } = require('graphql-subscriptions')
const pubsub = new PubSub()

const JWT_SECRET = 'NEED_HERE_A_SECRET_KEY'

const resolvers = {
  Query: {
    me: (root, args, context) => {
      return context.currentUser
    },
    bookCount: () => Book.collection.countDocuments(),
    authorCount: () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      if (args.author) {
        const foundAuthor = await Author.findOne({ name: args.author })
        if (foundAuthor) {
          if (args.genre) {
            const filterBooks = await Book.find({
              author: foundAuthor.id,
              genres: { $in: [args.genre] },
            }).populate('author')
            return filterBooks
          }
          const authorBooks = await Book.find({
            author: foundAuthor.id,
          }).populate('author')
          return authorBooks
        }

        return null
      }

      if (args.genre) {
        const genreBooks = await Book.find({
          genres: { $in: [args.genre] },
        }).populate('author')
        return genreBooks
      }

      const allBooks = await Book.find({}).populate('author')
      return allBooks
    },
    allAuthors: async () => await Author.find({}),
  },
  Book: {
    author: async (root) => {
      if (root.author) {
        const author = await Author.findById(root.author)
        return {
          id: author.id,
          name: author.name,
          born: author.born,
        }
      }

      console.log(root)
    },
  },
  Author: {
    bookCount: async (root) => {
      const books = await Book.find({ author: root.id })
      return books.length
    },
  },
  Mutation: {
    addBook: async (root, args, context) => {
      const currentUser = context.currentUser

      if (!currentUser) {
        throw new AuthenticationError('not authenticated')
      }

      let author = await Author.findOne({ name: args.author })

      if (!author) {
        author = await new Author({ name: args.author })
        author.save()
      }

      const book = new Book({
        title: args.title,
        published: args.published,
        author,
        genres: args.genres,
      })

      try {
        await book.save()
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }
      pubsub.publish('BOOK_ADDED', { bookAdded: book })

      return book
    },
    editAuthor: async (root, args, context) => {
      const currentUser = context.currentUser

      if (!currentUser) {
        throw new AuthenticationError('not authenticated')
      }

      const author = await Author.findOne({ name: args.name })
      author.born = args.setBornTo

      try {
        await author.save()
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }

      return author
    },
    createUser: async (root, args) => {
      try {
        newUser = await new User({ ...args }).save()
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }

      return newUser
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })

      if (!user || args.password !== 'library') {
        throw new UserInputError('wrong credentials')
      }

      const userForToken = {
        username: user.username,
        id: user._id,
      }

      return { value: jwt.sign(userForToken, JWT_SECRET) }
    },
  },
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator(['BOOK_ADDED']),
    },
  },
}

module.exports = resolvers
