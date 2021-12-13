const express = require('express');
const path = require('path');
const db = require('./config/connection');
const { ApolloServer } = require('apollo-server-express');
const routes = require('./routes');
const { typeDefs, resolvers } = require('./schemas');
const { authMiddleware } = require('./utils/auth');
const cors = require('cors');


const app = express();
const PORT = process.env.PORT || 3001;

const startServer = async () => {
  var corsOptions = {
    origin: '*',
    credentials: true
  };
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: authMiddleware,
    cors: cors(corsOptions),
  });


  await server.start();

  server.applyMiddleware({ app });

  app.use(cors(corsOptions))
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  
  // if we're in production, serve client/build as static assets
  if (process.env.NODE_ENV === 'production') {
    console.log(path.join(__dirname, '../client/build'));
    app.use(express.static(path.join(__dirname, '../client/build')));
  }
    
  app.use(routes);



  db.once('open', () => {
    app.listen(PORT, () => console.log(`🌍 Now listening on localhost:${PORT}`));
    console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
  });
}

startServer();