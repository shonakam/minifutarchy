// import { Server as HttpServer } from 'http';
// import { Server as IOServer } from 'socket.io';
// import { redis } from './upstash';

// let io: IOServer | null = null;

// export const setupSocketServer = (server: HttpServer) => {
//   if (!io) {
//     io = new IOServer(server, {
//       cors: { origin: '*' }, // 必要に応じて制限
//     });

// 	io.on('connection', (socket) => {
// 		console.log('Client connected:', socket.id);

// 	// ルームに参加し、現在のデータを送信
// 	socket.on('joinProposal', async (proposalId: string) => {
// 		const data = await redis.hgetall(`proposal:${proposalId}`);
// 		socket.join(proposalId);
// 		if (io) {
// 			io.to(proposalId).emit('updateProposal', data);
// 		}
// 	});

// 	socket.on('disconnect', () => {
// 		console.log('Client disconnected:', socket.id);
// 	});
// });
//   }
//   return io;
// };

// export const getSocketServer = () => {
//   if (!io) {
//     throw new Error('Socket.IO server is not initialized');
//   }
//   return io;
// };
