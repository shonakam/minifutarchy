import { useEffect } from 'react';
import { Option } from '../types/vote';

const useWebSocket = (url: string, onUpdate: (updatedOptions: Option[]) => void) => {
  useEffect(() => {
    const socket = new WebSocket(url);

    socket.onopen = () => {
      console.log('WebSocketに接続しました');
    };

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'update') {
        onUpdate(message.options);
      }
    };

    socket.onerror = (error) => {
      console.error('WebSocketエラー:', error);
    };

    socket.onclose = () => {
      console.log('WebSocketが切断されました');
    };

    return () => {
      socket.close();
    };
  }, [url, onUpdate]);
};

export default useWebSocket;
