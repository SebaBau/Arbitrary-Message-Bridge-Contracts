// SPDX-License-Identifier: MIT

import "./interfaces/IAMBSender.sol";
import "./helpers/Ownable.sol";

pragma solidity 0.8.17;

/**
 * @dev This is custom contract which is responsible for send predefined message which will be executed
 *      on the other chain.
 */
contract CounterSender is Ownable {
    // -----------------------------------------------------------------------
    //                            State Variables
    // -----------------------------------------------------------------------

    /// @dev Address of the Arbitrary Message Bridge
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
     * @dev Emitted when 'send' function is executed successfully and message was send correctly to the
     *      AMB address.
     * @param recipient Address on which given data should be executed on the other chain.
     * @param boolValue Boolean value included in the transaction.
     * @param uint256Value Uint256 value included in the transaction.
     */
    event MessageSent(address recipient, bool boolValue, uint256 uint256Value);

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
     * @dev This function is responsible for sending message to the Arbitrary Message Bridge which should
     *      be executed on the other chain.
     *
     * @dev Parameters :
     * @param recipient Address on which given data should be executed on the other chain.
     * @param boolValue Boolean value included in the transaction.
     * @param uint256Value Uint256 value included in the transaction.
     *
     * @dev Events :
     * - {MessageSent}
     */
    function send(
        address recipient,
        bool boolValue,
        uint256 uint256Value
    ) external {
        // Values ('boolValue' and 'uint256Value') are encoded with signature which allows to execute them on the
        // other place by the 'call'.
        IAMBSender(ambAddress).send(recipient, abi.encodeWithSignature("increment(bool,uint256)", boolValue, uint256Value));

        emit MessageSent(recipient, boolValue, uint256Value);
    }
}
