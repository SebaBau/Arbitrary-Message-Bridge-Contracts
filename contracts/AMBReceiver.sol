// SPDX-License-Identifier: MIT

import "./helpers/Ownable.sol";

pragma solidity 0.8.17;

/**
 * @dev This is Arbitrary Message Bridge Receiver contract. This contract is responsible for
 *      receiving messages from trusted relayer ('relayer' state variable address) and
 *      then forwarding them / executing on the given 'recipient' contract.
 */
contract AMBReceiver is Ownable {
    // -----------------------------------------------------------------------
    //                                Errors
    // -----------------------------------------------------------------------

    error AMBReceiver_OnlyRelayer();
    error AMBReceiver_ExecuteFailed();
    error AMBReceiver_OnlyForContracts();

    // -----------------------------------------------------------------------
    //                            State Variables
    // -----------------------------------------------------------------------

    /// @dev Address of trusted relayer
    address public relayer;

    // -----------------------------------------------------------------------
    //                                Events
    // -----------------------------------------------------------------------

    /**
     * @dev Emitted when 'relayer' address is updated.
     * @param relayer_ Address of the new trusted relayer.
     */
    event RelayerUpdated(address relayer_);

    /**
     * @dev Emitted when entire 'execute' function is completed.
     * @param recipient Address on which given data is called.
     * @param data Hashed function (signature + parameters) which is called
     *             in the 'recipient' contract address.
     */
    event TransactionExecuted(address recipient, bytes data);

    // -----------------------------------------------------------------------
    //                               Modifiers
    // -----------------------------------------------------------------------

    /**
     * @dev This modifiers protects function from being executed by someone other
     *      than the 'relayer'.
     */
    modifier onlyRelayer() {
        if (msg.sender != relayer) revert AMBReceiver_OnlyRelayer();
        _;
    }

    // -----------------------------------------------------------------------
    //                           External Functions
    // -----------------------------------------------------------------------

    /**
     * @dev External function which allows to update 'relayer' address.
     *
     * @dev Validations :
     * - Can be called only by the contract owner.
     *
     * @dev Parameters :
     * @param relayer_ New trusted relayer address.
     *
     * @dev Events :
     * - {RelayerUpdated}
     */
    function updateRelayer(address relayer_) external onlyOwner {
        relayer = relayer_;

        emit RelayerUpdated(relayer_);
    }

    /**
     * @dev External function which allows to get message from relayer and then forward
     *      and execute it on the 'recipient' address.
     *
     * @dev Validations :
     * - Can be called only by the 'relayer' address.
     * - Given 'recipient' must be contract - cannot be EOA.
     * - Function on the 'recipient' contract must executed successfully.
     *
     * @dev Parameters :
     * @param recipient Address on which given (data) will be executed.
     * @param data Hashed function (signature + parameters) which will be executed.
     *
     * @dev Events :
     * - {TransactionExecuted}
     */
    function execute(address recipient, bytes calldata data) external onlyRelayer {
        // Validation if 'recipient' is contract
        if (recipient.code.length == 0) revert AMBReceiver_OnlyForContracts();

        // Calling given 'data' on the 'recipient' contract.
        (bool success, ) = recipient.call(data);

        // Validation if given data was executed successfully.
        if (!success) revert AMBReceiver_ExecuteFailed();

        emit TransactionExecuted(recipient, data);
    }
}
