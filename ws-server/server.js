const WebSocket = require('ws');
const statusData = require('./proposal.json');

// WebSocketサーバーのセットアップ
const PORT = 8080;
const wss = new WebSocket.Server({ port: PORT });

console.log(`WebSocketサーバーがポート ${PORT} で稼働中`);

const jsonData = {
  message: 'Hello, WebSocket!',
  timestamp: new Date().toISOString(),
};

const statusData = [
	"proposal:1",
	{ "support": 10, "oppose": 5 },
	"proposal:2",
	{ "support": 7, "oppose": 8 },
	"proposal:3",
	{ "support": 255, "oppose": 42 }
]

wss.on('connection', (ws) => {
  console.log('クライアントが接続しました');

  ws.send(JSON.stringify(jsonData));

  ws.on('message', (message) => {
    console.log('クライアントからのメッセージ:', message);

    ws.send(JSON.stringify({ message: 'メッセージを受信しました', data: message }));
  });

  ws.on('close', () => {
    console.log('クライアントが切断しました');
  });
});
