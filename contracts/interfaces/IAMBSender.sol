// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

interface IAMBSender {
    function send(address recipient, bytes calldata data) external;
}
