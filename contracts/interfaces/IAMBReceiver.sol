// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

interface IAMBReceiver {
    function execute(address recipient, bytes calldata data) external;
}
