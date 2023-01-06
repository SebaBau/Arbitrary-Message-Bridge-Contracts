// SPDX-License-Identifier: MIT

import "./helpers/Ownable.sol";

pragma solidity 0.8.17;

/**
 * @dev This is custom contract which is responsible for receive message which will be send by
 *      the 'CounterSender' contract on the other chain.
 */
contract CounterReceiver is Ownable {
    // -----------------------------------------------------------------------
    //                                Errors
    // -----------------------------------------------------------------------

    error CounterReceiver_OnlyAMB();

    // -----------------------------------------------------------------------
    //                            State Variables
    // -----------------------------------------------------------------------

    /// @dev Simple counter value incremented by 1 on the every 'increment' function execution.
    uint256 public counter;
    /// @dev Last sent boolean value by the 'CounterSender' on the other chain.
    bool public boolValue;
    /// @dev Last sent uint256 value by the 'CounterSender' on the other chain.
    uint256 public uint256Value;
    /// @dev Address of the Arbitrary Message Bridge which will be send messages to this contract.
    address public ambAddress;

    // -----------------------------------------------------------------------
    //                                Events
    // -----------------------------------------------------------------------

    /**
     * @dev Emitted when 'amdAddress' is updated.
     * @param ambAddress_ Address of the new Arbitrary Message Bridge
     */
    event AMBAddressUpdated(address ambAddress_);

    /**
     * @dev Emitted when 'increment' function was executed successfully.
     * @param boolValue_ Boolean value sent by the 'CounterSender' on the other chain.
     * @param uint256Value_ Uint256 value sent by the 'CounterSender' on the other chain.
     * @param counterValue Actual 'counter' value after function execution.
     */
    event IncrementExecuted(bool boolValue_, uint256 uint256Value_, uint256 counterValue);

    // -----------------------------------------------------------------------
    //                               Modifiers
    // -----------------------------------------------------------------------

    /**
     * @dev This modifiers protects function from being executed by someone other
     *      than the 'relayer'.
     */
    modifier onlyAMB() {
        if (msg.sender != ambAddress) revert CounterReceiver_OnlyAMB();
        _;
    }

    // -----------------------------------------------------------------------
    //                           External Functions
    // -----------------------------------------------------------------------

    /**
     * @dev External function which allows to update 'ambAddress' address.
     *
     * @dev Validations :
     * - Can be called only by the contract owner.
     *
     * @dev Parameters :
     * @param ambAddress_ New Arbitrary Message Bridge address.
     *
     * @dev Events :
     * - {AMBAddressUpdated}
     */
    function updateAMBAddress(address ambAddress_) external onlyOwner {
        ambAddress = ambAddress_;

        emit AMBAddressUpdated(ambAddress_);
    }

    /**
     * @dev This function allows to increment 'counter' state variable and set other custom
     *      bool and uint256 state variables. This function can be performed by everyone, but
     *      main goal is to be performed by the Arbitrary Message Bridge contract.
     *
     * @dev Parameters :
     * @param boolValue_ Boolean value sent by the 'CounterSender' on the other chain.
     * @param uint256Value_ Uint256 value sent by the 'CounterSender' on the other chain.
     *
     * @dev Events :
     * - {IncrementExecuted}
     */
    function increment(bool boolValue_, uint256 uint256Value_) external onlyAMB {
        boolValue = boolValue_;
        uint256Value = uint256Value_;

        uint256 counterValue = ++counter;

        emit IncrementExecuted(boolValue_, uint256Value_, counterValue);
    }
}
