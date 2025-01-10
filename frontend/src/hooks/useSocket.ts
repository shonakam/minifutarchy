// import { useEffect, useState } from 'react';
// import { io, Socket } from 'socket.io-client';

// type ServerToClientEvents = {
//   updateProposal: (data: { support: number; oppose: number }) => void;
// };

// type ClientToServerEvents = {
//   joinProposal: (proposalId: string) => void;
//   vote: (data: { proposalId: string; type: 'support' | 'oppose' }) => void;
// };

// const useSocket = (proposalId: string) => {
//   const [socket, setSocket] = useState<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);

//   useEffect(() => {
//     const socketInstance: Socket<ServerToClientEvents, ClientToServerEvents> = io('http://localhost:3000', {
//       path: '/socket.io', // サーバー側の設定に一致する必要があります
//     });

//     setSocket(socketInstance);

//     socketInstance.emit('joinProposal', proposalId);

//     return () => {
//       socketInstance.disconnect();
//     };
//   }, [proposalId]);

//   return { socket };
// };

// export default useSocket;
