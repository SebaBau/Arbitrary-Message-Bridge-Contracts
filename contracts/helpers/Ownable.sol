// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

/**
 * @title Ownable
 * @dev Helper contract which provides a basic access control mechanism, where
 * there is an account (an owner) that can be granted exclusive access to
 * specific functions.
 */
contract Ownable {
    // -----------------------------------------------------------------------
    //                                Errors
    // -----------------------------------------------------------------------

    error Ownable_NotOwner();
    error Ownable_NotPendingOwner();
    error Ownable_ZeroOwner();

    // -----------------------------------------------------------------------
    //                            State Variables
    // -----------------------------------------------------------------------

    /// @dev Address of the current owner.
    address public owner;
    /// @dev Address of the pending owner.
    address public pendingOwner;

    // -----------------------------------------------------------------------
    //                                Events
    // -----------------------------------------------------------------------

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    // -----------------------------------------------------------------------
    //                              Constructor
    // -----------------------------------------------------------------------

    constructor() {
        _transferOwnership(msg.sender);
    }

    // -----------------------------------------------------------------------
    //                               Modifiers
    // -----------------------------------------------------------------------

    /**
     * @dev Throws if called by any account other than the Owner.
     */
    modifier onlyOwner() {
        if (owner != msg.sender) {
            revert Ownable_NotOwner();
        }
        _;
    }

    // -----------------------------------------------------------------------
    //                           External Functions
    // -----------------------------------------------------------------------

    /**
     * @dev Transfers ownership to newOwner. Either directly or claimable by the pendingOwner.
     * Can only be invoked by the current owner.
     */
    function transferOwnership(address newOwner, bool direct) external onlyOwner {
        if (newOwner == address(0)) {
            revert Ownable_ZeroOwner();
        }

        if (direct) {
            _transferOwnership(newOwner);
        } else {
            pendingOwner = newOwner;
        }
    }

    /**
     * @dev Leaves the contract without owner. It will not be possible to call
     * `onlyOwner` functions anymore. Can only be called by the current owner.
     */
    function renounceOwnership() external onlyOwner {
        _transferOwnership(address(0));
    }

    /**
     * @dev Needs to be called by `pendingOwner` to claim ownership.
     */
    function claimOwnership() external {
        if (pendingOwner != msg.sender) {
            revert Ownable_NotPendingOwner();
        }

        _transferOwnership(pendingOwner);
    }

    // -----------------------------------------------------------------------
    //                           Internal Functions
    // -----------------------------------------------------------------------

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Sets pendingOwner to address(0). Internal function without access
     * restriction.
     */
    function _transferOwnership(address newOwner) internal {
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
        pendingOwner = address(0);
    }
}
