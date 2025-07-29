// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract xineedu {

    uint public taskCount;

    struct Task {
        uint id;
        string content;
        bool completed;
    }

    mapping(uint => Task) public tasks;

    event TaskCreated(uint id, string content, bool completed);
    event TaskCompleted(uint id, bool completed);

    function createTask(string memory _content) public {
        taskCount++;
        tasks[taskCount] = Task(taskCount, _content, false);
        emit TaskCreated(taskCount, _content, false);
    }

    function toggleCompleted(uint _id) public {
        Task storage task = tasks[_id];
        task.completed = !task.completed;
        emit TaskCompleted(_id, task.completed);
    }

    function getTask(uint _id) public view returns (uint, string memory, bool) {
        Task memory task = tasks[_id];
        return (task.id, task.content, task.completed);
    }
}
