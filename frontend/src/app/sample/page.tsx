'use client';

import React, {useState, useEffect} from 'react';
import Chart from '../../components/chart/ChartWithVotePressure';

const VotePage: React.FC = () => {
	const [yesVotes, setYesVotes] = useState(25500); // YESの初期値
	const [noVotes, setNoVotes] = useState(22500); // NOの初期値
  
	// データを定期的に更新
	useEffect(() => {
	  const updateVotes = () => {
		// 仮想API呼び出しのモック
		const newYesVotes = Math.max(20000, yesVotes + Math.floor(Math.random() * 100 - 50));
		const newNoVotes = Math.max(20000, noVotes + Math.floor(Math.random() * 100 - 50));
		setYesVotes(newYesVotes);
		setNoVotes(newNoVotes);
	  };
	  const interval = setInterval(updateVotes, 700);
	  return () => clearInterval(interval); // クリーンアップ
	}, [yesVotes, noVotes]);

  return (
    <div className="min-h-screen flex items-center justify-center">
        <Chart proposal={null} yes={yesVotes} no={noVotes} />
    </div>
  );
};

export default VotePage;
