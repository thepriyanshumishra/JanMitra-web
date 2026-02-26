// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title EventAnchor
 * @dev Stores cryptographic hashes of governance events for JanMitra.
 */
contract EventAnchor {
    struct EventRecord {
        string grievanceId;
        string eventType;
        bytes32 dataHash;
        uint256 timestamp;
        address anchoredBy;
    }

    // Mapping from grievanceId to its anchored events
    mapping(string => EventRecord[]) private _grievanceHistory;

    event EventAnchored(
        string indexed grievanceId,
        string eventType,
        bytes32 dataHash,
        uint256 timestamp
    );

    /**
     * @dev Anchors a new event hash to the blockchain.
     * @param grievanceId Unique ID of the grievance.
     * @param eventType Type of event (SUBMITTED, RESOLVED, etc.)
     * @param dataHash SHA-256 hash of the event data.
     */
    function anchorEvent(
        string calldata grievanceId,
        string calldata eventType,
        bytes32 dataHash
    ) external {
        EventRecord memory newRecord = EventRecord({
            grievanceId: grievanceId,
            eventType: eventType,
            dataHash: dataHash,
            timestamp: block.timestamp,
            anchoredBy: msg.sender
        });

        _grievanceHistory[grievanceId].push(newRecord);

        emit EventAnchored(grievanceId, eventType, dataHash, block.timestamp);
    }

    /**
     * @dev Retrieves the history of anchored events for a grievance.
     */
    function getHistory(string calldata grievanceId) 
        external 
        view 
        returns (EventRecord[] memory) 
    {
        return _grievanceHistory[grievanceId];
    }
}
