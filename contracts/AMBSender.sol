// SPDX-License-Identifier: MIT

import "./interfaces/IAMBSender.sol";

pragma solidity 0.8.17;

/**
 * @dev This is Arbitrary Message Bridge Sender contract. This contract is responsible for
 *      sending (emitting) messages which are intercepted by the trusted layer and then are
 *      forwarded / executed on the other chain.
 */
contract AMBSender is IAMBSender {
    // -----------------------------------------------------------------------
    //                                Events
    // -----------------------------------------------------------------------

    /**
     * @dev Emitted in the 'send' function. This event is intercepted by the trusted layer
     * @param recipient Address on which given data should be executed on the other chain.
     * @param data Hashed function (signature + parameters) which should be executed on
     *             other chain on the given 'recipient' contract.
     */
    event Sent(address recipient, bytes data);

    // -----------------------------------------------------------------------
    //                           External Functions
    // -----------------------------------------------------------------------

    /**
     * @dev This function emits event which is intercepted by the trusted relayer software.
     *
     * @dev Parameters :
     * @param recipient Address on which given data should be executed on the other chain.
     * @param data Hashed function (signature + parameters) which should be executed on
     *             other chain on the given 'recipient' contract.
     *
     * @dev Events :
     * - {SendEvent}
     */
    function send(address recipient, bytes calldata data) external override {
        emit Sent(recipient, data);
    }
}
