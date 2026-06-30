const app = require('./app');
//const { connectDatabase } = require('./services/database');
const port = process.env.PORT || 3001;

/*
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
})
*/

// error handling
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});