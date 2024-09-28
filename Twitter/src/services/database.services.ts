
import { Collection, Db, MongoClient } from 'mongodb' 
import dotenv from 'dotenv'
import User from '~/models/schemas/User.schema';
dotenv.config()
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@twitter.hmuyl.mongodb.net/?retryWrites=true&w=majority&appName=Twitter`;


class DatabaseService {
  private client : MongoClient
  private db : Db
  constructor() {
    this.client = new MongoClient(uri)
    this.db = this.client.db(`${process.env.DB_NAME}`);
  }

  async connect() {
    try {
      await this.db.command({ ping: 1 });
      console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } catch(error) {
      console.log(error);
    }
  }

  get users() : Collection<User>{
    return this.db.collection(process.env.DB_USER_COLLECTION as string)
  }
}


const databaseService = new DatabaseService()
export default databaseService