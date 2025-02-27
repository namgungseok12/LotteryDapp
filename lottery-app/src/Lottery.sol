// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Lottery {
    address public manager;
    address payable[] public players;
    address payable winner;
    bool public isComplete;
    bool public claimed;
    
    constructor() {
        manager = msg.sender;
        isComplete = false;
        claimed = false;
    }

    modifier restricted() {
        require(msg.sender == manager);
        _;
    }

    function getManager() public view returns (address) {
        return manager;
    }

    function getWinner() public view returns (address) {
        return winner;
    }

    function status() public view returns (bool) {
        return isComplete;
    }
    
    function enter() public payable {
        require(msg.value >= 0.001 ether);
        require(!isComplete);
        players.push(payable(msg.sender));
    }
    
    function pickWinner() public restricted {
        require(players.length > 0);
        require(!isComplete);
        winner = players[randomNumber() % players.length];
        isComplete = true;
    }
    
    function claimPrize() public {
        require(msg.sender == winner);
        require(isComplete);
        winner.transfer(address(this).balance);
        claimed = true;
    }
    
    function getPlayers() public view returns (address payable[] memory) {
        return players;
    }
    
    
    
    function randomNumber() private view returns (uint) {
        return uint(keccak256(abi.encodePacked(block.prevrandao, block.timestamp, players.length)));
    }

     // 새 라운드를 위한 초기화 함수
    function resetLottery() public restricted {
        require(isComplete, "The current lottery round is not complete");
        require(claimed, "Prize has not been claimed yet");

        // 초기화 작업
        delete players; // 참가자 목록 초기화
        winner = payable(address(0)); // 당첨자 초기화
        isComplete = false; // 라운드 완료 상태 초기화
        claimed = false; // 상금 청구 상태 초기화
    }

}