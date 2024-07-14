import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class VideoGateway {
  @WebSocketServer() server: Server;

  @SubscribeMessage('videoShared')
  notifyVideoShared(videoTitle: string, userName: string) {
    // const message = `${userName} shared a new video: ${videoTitle}`;
    this.server.emit('videoShared', { userName, videoTitle });
  }
}
