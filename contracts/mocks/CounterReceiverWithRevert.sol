// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

/**
 * @dev This is contract needed in tests to simulate reverting transaction on the 'CounterReceiver'.
 */
contract CounterReceiverWithRevert {
    // -----------------------------------------------------------------------
    //                           External Functions
    // -----------------------------------------------------------------------

    /**
     * @dev This function revert on every execution.
     *
     * @dev Parameters :
     * @param boolValue_ Boolean value sent by the 'CounterSender' on the other chain.
     * @param uint256Value_ Uint256 value sent by the 'CounterSender' on the other chain.
     *
     * @dev Events :
     * - {IncrementExecuted}
     */
    function increment(bool boolValue_, uint256 uint256Value_) external pure {
        revert();
    }
}
