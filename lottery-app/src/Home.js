import React, { useState, useEffect } from "react";
import { ethers } from 'ethers';
import constants from './constants';

function Home() {
    const [currentAccount, setCurrentAccount] = useState("");
    const [contractInstance, setcontractInstance] = useState('');
    const [status, setStatus] = useState(false);
    const [isWinner, setIsWinner] = useState(false);
    const [isOwner, setIsOwner] = useState(false);
    const [prizeClaimed, setPrizeClaimed] = useState(false); // 상금 청구 상태

    useEffect(() => {
        const loadBlockchainData = async () => {
            if (typeof window.ethereum !== 'undefined') {
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                try {
                    const signer = provider.getSigner();
                    const address = await signer.getAddress();
                    setCurrentAccount(address);
                    window.ethereum.on('accountsChanged', (accounts) => {
                        setCurrentAccount(accounts[0]);
                    });
                } catch (err) {
                    console.error(err);
                }
            } else {
                alert('Please install Metamask to use this application');
            }
        };

        const contract = async () => {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contractIns = new ethers.Contract(constants.contractAddress, constants.contractAbi, signer);
            setcontractInstance(contractIns);

            const status = await contractIns.status();
            setStatus(status);

            const winner = await contractIns.getWinner();
            setIsWinner(winner === currentAccount);

            const owner = await contractIns.getManager();
            setIsOwner(owner === currentAccount);
        };

        loadBlockchainData();
        contract();
    }, [currentAccount, status]);

    const enterLottery = async () => {
        const amountToSend = ethers.utils.parseEther('0.001');
        const tx = await contractInstance.enter({ value: amountToSend });
        await tx.wait();
    };

    const claimPrize = async () => {
        try {
            const tx = await contractInstance.claimPrize();
            await tx.wait();

            setPrizeClaimed(true); // 상금 청구 상태를 true로 설정하여 다음 단계 준비
            alert("Prize claimed successfully.");
        } catch (error) {
            console.error("Error in claiming prize:", error);
            alert("An error occurred while claiming the prize.");
        }
    };

    const resetLottery = async () => {
        try {
            if (!prizeClaimed) {
                alert("Please claim the prize before resetting the lottery.");
                return;
            }

            const tx = await contractInstance.resetLottery();
            await tx.wait();

            setStatus(false); // 새 라운드를 위한 상태 초기화
            setIsWinner(false); // 당첨자 초기화
            setPrizeClaimed(false); // 상금 청구 상태 초기화

            alert("New round started successfully.");
        } catch (error) {
            console.error("Error in resetting lottery:", error);
            alert("An error occurred while resetting the lottery.");
        }
    };

    return (
        <div className="container">
            <h1>Lottery Page</h1>
            <div className="button-container">
                {status && isWinner ? (
                    <div>
                        {/* 당첨자는 상금 청구와 새 라운드 시작 버튼을 별도로 클릭할 수 있음 */}
                        <button className="enter-button" onClick={claimPrize}>Claim Prize</button>
                        {prizeClaimed && (
                            <button className="enter-button" onClick={resetLottery}>Start New Round</button>
                        )}
                    </div>
                ) : status ? (
                    <p>You are not the winner</p>
                ) : (
                    <button className="enter-button" onClick={enterLottery}>Enter Lottery</button>
                )}
            </div>
        </div>
    );
}

export default Home;
