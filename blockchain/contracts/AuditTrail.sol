// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract AuditTrail {
    enum AuditAction { APPROVED, REJECTED, REVIEWED }

    struct AuditEntry {
        string auditId;
        string transactionId;
        AuditAction action;
        string notes;
        address auditor;
        uint256 timestamp;
        bool exists;
    }

    mapping(string => AuditEntry) public auditEntries;
    string[] public auditIds;

    mapping(string => string[]) public transactionAudits;

    uint256 public totalApproved;
    uint256 public totalRejected;
    uint256 public totalReviewed;

    event AuditRecorded(
        string indexed auditId,
        string indexed transactionId,
        AuditAction action,
        string notes,
        address indexed auditor,
        uint256 timestamp
    );

    event AuditSummaryUpdated(
        uint256 totalApproved,
        uint256 totalRejected,
        uint256 totalReviewed,
        uint256 timestamp
    );

    modifier auditNotExists(string memory _auditId) {
        require(!auditEntries[_auditId].exists, "Audit entry already exists");
        _;
    }

    function recordAudit(
        string memory _auditId,
        string memory _transactionId,
        AuditAction _action,
        string memory _notes
    ) external auditNotExists(_auditId) {
        require(bytes(_auditId).length > 0, "Audit ID cannot be empty");
        require(bytes(_transactionId).length > 0, "Transaction ID cannot be empty");

        auditEntries[_auditId] = AuditEntry({
            auditId: _auditId,
            transactionId: _transactionId,
            action: _action,
            notes: _notes,
            auditor: msg.sender,
            timestamp: block.timestamp,
            exists: true
        });

        auditIds.push(_auditId);
        transactionAudits[_transactionId].push(_auditId);

        if (_action == AuditAction.APPROVED) {
            totalApproved++;
        } else if (_action == AuditAction.REJECTED) {
            totalRejected++;
        } else {
            totalReviewed++;
        }

        emit AuditRecorded(
            _auditId,
            _transactionId,
            _action,
            _notes,
            msg.sender,
            block.timestamp
        );

        emit AuditSummaryUpdated(
            totalApproved,
            totalRejected,
            totalReviewed,
            block.timestamp
        );
    }

    function getAuditEntry(string memory _auditId)
        external
        view
        returns (
            string memory transactionId,
            AuditAction action,
            string memory notes,
            address auditor,
            uint256 timestamp
        )
    {
        require(auditEntries[_auditId].exists, "Audit entry does not exist");
        AuditEntry memory a = auditEntries[_auditId];
        return (a.transactionId, a.action, a.notes, a.auditor, a.timestamp);
    }

    function getTransactionAuditCount(string memory _transactionId) external view returns (uint256) {
        return transactionAudits[_transactionId].length;
    }

    function getTransactionAuditByIndex(string memory _transactionId, uint256 _index)
        external
        view
        returns (string memory)
    {
        require(_index < transactionAudits[_transactionId].length, "Index out of bounds");
        return transactionAudits[_transactionId][_index];
    }

    function getTotalAudits() external view returns (uint256) {
        return auditIds.length;
    }

    function getAuditSummary()
        external
        view
        returns (
            uint256 approved,
            uint256 rejected,
            uint256 reviewed,
            uint256 total
        )
    {
        return (totalApproved, totalRejected, totalReviewed, auditIds.length);
    }
}
