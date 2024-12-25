import express from 'express';
import userRouter from './routes/users.router';
import databaseService from './services/database.services';
import { defaultErrorHandler } from '~/middlewares/error.middleware';
import mediasRouter from '~/routes/medias.router';
import { config } from 'dotenv';
import { UPLOAD_IMAGE_DIR, UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_DIR, UPLOAD_VIDEO_TEMP_DIR } from '~/constants/dir';
import staticRoutes from '~/routes/statics.router';
import { initFolder } from '~/utils/file';
import TweetRouter from '~/routes/tweets.router';
import bookmarkRouter from '~/routes/bookmarks.router';
import likeRouter from '~/routes/likes.router';
import searchRouter from '~/routes/searchs.router';
import { createServer } from "http";
import { Server } from "socket.io";
import cors from 'cors'
// import '~/utils/faker'

config()
initFolder([UPLOAD_IMAGE_DIR, UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_DIR, UPLOAD_VIDEO_TEMP_DIR])
databaseService.connect()
  .then(() => {
    databaseService.indexeUser()
    databaseService.indexRefreshToken()
    databaseService.indexFollowers()
    databaseService.indexVideoStatus()
    databaseService.indexFollowers()
    databaseService.indexTweet()
  })
const app = express();
const httpsServer = createServer(app);

const port = process.env.PORT || 4000
app.use(cors());
app.use(express.json());// convert json -> data
app.use('/users', userRouter)
app.use('/medias', mediasRouter)
app.use('/static', staticRoutes)
app.use('/static/video', express.static(UPLOAD_VIDEO_DIR)) // tự động phục vụ cho các tệp chứa trong UPLOAD_VIDEO_DIR. nếu name video có trong folder này
app.use('/tweet', TweetRouter)
app.use('/bookmarks', bookmarkRouter)
app.use('/likes', likeRouter)
app.use('/searchs', searchRouter)
// default error handler
app.use(defaultErrorHandler)

const io = new Server(httpsServer, {
  cors: {
    origin: 'http://localhost:3000',
  }
});


const users: {
  [key: string]: {
    socket_id: string
  }
} = {}

io.on("connection", (socket) => {
  console.log(`user ${socket.id} connected`);
  const user_id = socket.handshake.auth._id
  // users là 1 object
  users[user_id] = { // lấy key cha là : user_id
    socket_id: socket.id
  }
  console.log("🚀 ~ io.on ~ users:", users)
  socket.on('receive private message', (data) => {
    const receiver_socket_id = users[data.to].socket_id // tìm trong users là ra socket_id người nhận (data này là do có người gửi lên)
    console.log("🚀 ~ socket.on ~ receiver_socket_id:", users[data.to])
    socket.to(receiver_socket_id).emit('receive private message', { // gửi tin nhắn đến người nhận
      content: data.content,
      from: user_id // người gửi là user_id
    })
  })
  socket.on("disconnect", () => {
    delete users[user_id] // xóa key của user_id trong users khi user disconnect
    console.log(`user ${socket.id} disconnected`);
    console.log("🚀 ~ io.on ~ users:", users)
  })

})

httpsServer.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});


// const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@twitter.hmuyl.mongodb.net/?retryWrites=true&w=majority&appName=Twitter`;
// const mgclient = new MongoClient(uri)
// const db = mgclient.db('earth')
// const users = db.collection('users')
// const usersData = []

// for (let i = 0; i < 1000; i++) {
//   usersData.push({
//     name: 'user' + (i + 1),
//     age: Math.floor(Math.random() * 100) + 1,
//     sex: i % 2 ? 'Male' : 'Female'
//   })
// }

// users.insertMany(usersData) => create data in mongodb