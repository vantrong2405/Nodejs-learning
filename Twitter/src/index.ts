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
import { ObjectId } from 'mongodb';
import Conversation from '~/models/schemas/Conversation.schema';
import conversationRouter from '~/routes/conversation.router';
import { verifyAccessToken } from '~/middlewares/common.middleware';
import { ErrorWithStatus } from '~/models/Errors';
import { UserVerifyStatus } from '~/constants/enum';
import { TokenPayload } from '~/models/requests/User.requests';
import { USERS_MESSAGES } from '~/constants/message';
import HTTP_STATUS from '~/constants/httpStatus';
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
app.use('/conversations', conversationRouter)
// default error handler
app.use(defaultErrorHandler)

const io = new Server(httpsServer, {
  cors: {
    origin: 'http://localhost:3000'
  }
})

const users: {
  [key: string]: {
    socket_id: string
  }
} = {}

// middleware 
io.use(async (socket, next) => {
  const { Authorization } = socket.handshake.auth
  const access_token = Authorization?.split(' ')[1]
  try {
    const decoded_authorization = await verifyAccessToken(access_token)
    const { verify } = decoded_authorization as TokenPayload
    if (verify !== UserVerifyStatus.Verified) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.USER_NOT_VERIFIED,
        status: HTTP_STATUS.FORBIDDEN
      })
    }
    socket.handshake.auth.decoded_authorization = decoded_authorization as TokenPayload
    socket.handshake.auth.access_token = access_token
    next()
  } catch (error) {
    next({
      message: 'Unauthorized',
      name: 'UnauthorizedError',
      data: error
    })
  }
})
io.on('connection', (socket) => {
  // console.log(`${socket.id} connected`)
  const { user_id } = socket.handshake.auth.decoded_authorization as TokenPayload
  users[user_id] = {
    socket_id: socket.id
  }
  socket.use(async (packet, next) => {
    const { access_token } = socket.handshake.auth
    try {
      await verifyAccessToken(access_token)
      next()
    } catch (error) {
      next(new Error('Unauthorized'))
    }
  })
  socket.on('disconnect', () => {
    delete users[user_id]
    // console.log(`${socket.id} disconnected`)
  })
  socket.on('error', (error) => {
    if (error.message === 'Unauthorized') {
      socket.disconnect()
    }
  })
  socket.on('send_message', async (data) => {
    const { receiver_id, sender_id, content } = data.payload
    const receive_socket_id = users[receiver_id]?.socket_id
    const conversation = new Conversation({
      sender_id: new ObjectId(sender_id),
      receiver_id: new ObjectId(receiver_id),
      content: content
    })
    const result = await databaseService.conversation.insertOne(conversation)
    conversation._id = result.insertedId
    socket.to(receive_socket_id).emit('receive_message', {
      payload: conversation
    })
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