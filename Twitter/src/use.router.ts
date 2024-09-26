import express from 'express';
const userRouter = express.Router() 
userRouter.use((req, res, next) => {
  console.log('Time: ', Date.now())
  next()
})
userRouter.get('/tweets', (req, res) => {
  res.json({
    data : [{
      id : 1,
      name : 'Văn Trọng'
    }]
  });
});

export default userRouter;