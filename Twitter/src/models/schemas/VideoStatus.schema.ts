import { ObjectId } from 'mongodb'
import { EncodingStatus } from '~/constants/enum'
interface VideoStatusType {
  _id?: ObjectId
  name: string
  status: EncodingStatus
  message?: string
  created_at?: Date
  updated_at?: Date
}
export class VideoStatus {
  _id?: ObjectId
  name: string
  status: EncodingStatus
  message: string
  created_at: Date
  updated_at: Date
  constructor({ _id, name, status, message, created_at, updated_at }: VideoStatusType) {
    const date = new Date()
    this._id = _id
    this.name = name
    this.status = EncodingStatus.Pending
    this.message = message || ''
    this.created_at = created_at || date
    this.updated_at = updated_at || date
  }
}