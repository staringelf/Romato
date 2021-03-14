const mongoose = require('mongoose');

require('dotenv').config({ path: 'variables.env' });

mongoose.connect(process.env.DATABASE, { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;
db.on('error', (err) => {
  console.log('----MongoDB is Erred-----', err.message);
});

//Deprecation Warnings
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);

require('./models/Review');
require('./models/Store');
require('./models/User');

const app = require('./app');

app.set('port', process.env.PORT || 7777);

const server = app.listen(app.get('port'), () => {
  console.log(`Server running → PORT ${server.address().port}`);
})