export interface ChatUsers {
  approved_status:number
  email: string
  firstname: string
  id: number
  keycloak_id: string
  lastname: string
  member_id:number
  username: string

}

export interface UserMessages{
  created_at: string
  id: number
  message: string
  msg: Msgs
  receiver_id: number
  room_id:number
  sender_id:number
}

export interface Msgs{
  message: string
  messageType:  string
  read: boolean
  senderUid: number
  timestamp: number
}
