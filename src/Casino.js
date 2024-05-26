import { useAccount, useDisconnect } from 'wagmi';
import { writeContract, waitForTransactionReceipt, readContract, getBlockNumber } from '@wagmi/core';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useEffect, useState } from 'react';
import { abi } from './abi.js';
import { config } from './config.ts';
import { fromHex, parseUnits } from 'viem';

import './Casino.css';


export default function Casino() {
  const { address, isConnected } = useAccount();
  const { open } = useWeb3Modal();
  const { disconnect } = useDisconnect();
  const [isLoading, setIsLoading] = useState(false);
  
  const [betAmount, setBetAmount] = useState('');
  const [lucky, setLucky] = useState("");

  async function sendRequest() {
    try {
      const result = await writeContract(config, {
        address: '0xc08Ae8Fc94c1F8F83B99072f7c6424948357EdCb',
        abi,
        functionName: 'requestRandomWords',
        args: [true],
      });
      return result
    } catch (error) {
      console.error('Error in sendRequest:', error);
    }
  }

  async function handleBet() {
      console.log('bet start');

      const result = await sendRequest();

      const transactionReceipt = await waitForTransactionReceipt(config, {
        hash: result,
      });
      setIsLoading(true)

      const requestId = transactionReceipt.logs[1].data;
      const requestIdDec = fromHex(requestId.slice(0, 66), 'bigint');
      console.log(requestIdDec);

      const finalBlock = transactionReceipt.blockNumber + parseUnits("6",0)
      console.log(`Waiting until block: ${finalBlock}`);

      const intervalId = setInterval(async () => {
        const currentBlockNumber = await getBlockNumber(config);
        console.log(`Current Block: ${currentBlockNumber}`);

        if (currentBlockNumber >= finalBlock) {
          console.log('Reached final block:', currentBlockNumber);
          clearInterval(intervalId);
          const numbersArray = await readContract(config, {
            address: '0xc08Ae8Fc94c1F8F83B99072f7c6424948357EdCb',
            abi,
            functionName: 'getRequestStatus',
            args: [requestIdDec],
          });
          console.log(numbersArray[1]);
          
          const results = numbersArray[1].map(num => num % parseUnits("13",0) === 0);
          const unluckyCount = results.filter(result => result === true).length;
          console.log(unluckyCount)
          setIsLoading(false)
          if (unluckyCount === 3) {
            setLucky("Uh-oh! You've hit the jackpot of misfortune. Better luck next time!")
          } else if (unluckyCount === 2) {
            setLucky("Oops! You're in the danger zone. Fortune might favor you soon!")
          } else if (unluckyCount === 1) {
            setLucky("A bit of bad luck, but don't worry, brighter days are ahead!")
          } else {
            setLucky("Congratulations! Luck is on your side this time!")
          }
           console.log('bet end');
        }
      }, 5000);
  }



  return (
    <div>
      {isConnected ? (
        <div  className="address">
          address is : {address ? address : ''}
          <button onClick={disconnect}>Disconnect</button>
          <div>
            <h1>Test your luck Machine</h1>
            <button onClick={handleBet} disabled={isLoading}>Spin</button>
            <div id="luckyMessage">{isLoading ? <span className="loading">Loading...</span> : lucky }</div>
          </div>
        </div>
      ) : (
        <button onClick={open}>Connect</button>
      )}
    </div>
  );
}