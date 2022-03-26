export default {
  apiPrefix: 'api',
  mongoConnection: `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@${process.env.MONGO_URL}/${process.env.MONGO_DB_NAME}?retryWrites=true&w=majority`,
};
