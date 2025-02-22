// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

interface IadaptAIPolicyAVS {
    event NewTaskCreated(uint32 indexed taskIndex, Task task, address agentAddress, address userAddress);

    event TaskResponded(uint32 indexed taskIndex, Task task, address operator);

    struct Task {
        string name;
        address to;
        uint32 taskCreatedBlock;
    }

    function latestTaskNum() external view returns (uint32);

    function allTaskHashes(uint32 taskIndex) external view returns (bytes32);

    function allTaskResponses(
        address operator,
        uint32 taskIndex
    ) external view returns (bytes memory);

    function createNewTask(string memory name, address agentAddress, address userAddress) external returns (Task memory);

    function respondToTask(
        Task calldata task,
        uint32 referenceTaskIndex,
        bytes calldata signature
    ) external;
}
