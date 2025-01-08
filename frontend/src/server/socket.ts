// import { WebSocketServer } from 'ws';
// import { redis } from '@/client/upstash';

// // WebSocketサーバーのセットアップ
// const wss = new WebSocketServer({ port: 4000 });

// wss.on('connection', (ws) => {
//   console.log('クライアントが接続しました。');

//   // RedisのPub/Subを購読
//   redis.subscribe('vote_updates', (message) => {
//     console.log('Redisからのメッセージ:', message);

//     // クライアントにリアルタイム更新を送信
//     ws.send(message);
//   });

//   ws.on('close', () => {
//     console.log('クライアントが切断されました。');
//   });
// });

// console.log('WebSocketサーバーがポート4000で稼働中。');
