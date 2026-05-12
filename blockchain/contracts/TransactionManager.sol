// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract TransactionManager {
    enum TransactionStatus { PENDING, APPROVED, REJECTED }

    struct Transaction {
        string transactionId;
        string budgetId;
        string description;
        uint256 amount;
        string recipientName;
        TransactionStatus status;
        address createdBy;
        uint256 createdAt;
        bool exists;
    }

    mapping(string => Transaction) public transactions;
    string[] public transactionIds;

    mapping(string => string[]) public budgetTransactions;

    event TransactionCreated(
        string indexed transactionId,
        string indexed budgetId,
        string description,
        uint256 amount,
        string recipientName,
        address indexed createdBy,
        uint256 timestamp
    );

    event TransactionStatusChanged(
        string indexed transactionId,
        TransactionStatus oldStatus,
        TransactionStatus newStatus,
        address indexed changedBy,
        uint256 timestamp
    );

    modifier txExists(string memory _txId) {
        require(transactions[_txId].exists, "Transaction does not exist");
        _;
    }

    modifier txNotExists(string memory _txId) {
        require(!transactions[_txId].exists, "Transaction already exists");
        _;
    }

    function createTransaction(
        string memory _transactionId,
        string memory _budgetId,
        string memory _description,
        uint256 _amount,
        string memory _recipientName
    ) external txNotExists(_transactionId) {
        require(bytes(_transactionId).length > 0, "Transaction ID cannot be empty");
        require(bytes(_budgetId).length > 0, "Budget ID cannot be empty");
        require(_amount > 0, "Amount must be greater than 0");
        require(bytes(_recipientName).length > 0, "Recipient name cannot be empty");

        transactions[_transactionId] = Transaction({
            transactionId: _transactionId,
            budgetId: _budgetId,
            description: _description,
            amount: _amount,
            recipientName: _recipientName,
            status: TransactionStatus.PENDING,
            createdBy: msg.sender,
            createdAt: block.timestamp,
            exists: true
        });

        transactionIds.push(_transactionId);
        budgetTransactions[_budgetId].push(_transactionId);

        emit TransactionCreated(
            _transactionId,
            _budgetId,
            _description,
            _amount,
            _recipientName,
            msg.sender,
            block.timestamp
        );
    }

    function approveTransaction(string memory _txId) external txExists(_txId) {
        Transaction storage tx_ = transactions[_txId];
        require(tx_.status == TransactionStatus.PENDING, "Transaction is not pending");

        TransactionStatus oldStatus = tx_.status;
        tx_.status = TransactionStatus.APPROVED;

        emit TransactionStatusChanged(
            _txId,
            oldStatus,
            TransactionStatus.APPROVED,
            msg.sender,
            block.timestamp
        );
    }

    function rejectTransaction(string memory _txId) external txExists(_txId) {
        Transaction storage tx_ = transactions[_txId];
        require(tx_.status == TransactionStatus.PENDING, "Transaction is not pending");

        TransactionStatus oldStatus = tx_.status;
        tx_.status = TransactionStatus.REJECTED;

        emit TransactionStatusChanged(
            _txId,
            oldStatus,
            TransactionStatus.REJECTED,
            msg.sender,
            block.timestamp
        );
    }

    function getTransaction(string memory _txId)
        external
        view
        txExists(_txId)
        returns (
            string memory budgetId,
            string memory description,
            uint256 amount,
            string memory recipientName,
            TransactionStatus status,
            address createdBy,
            uint256 createdAt
        )
    {
        Transaction memory t = transactions[_txId];
        return (t.budgetId, t.description, t.amount, t.recipientName, t.status, t.createdBy, t.createdAt);
    }

    function getTransactionStatus(string memory _txId)
        external
        view
        txExists(_txId)
        returns (TransactionStatus)
    {
        return transactions[_txId].status;
    }

    function getTotalTransactions() external view returns (uint256) {
        return transactionIds.length;
    }

    function getBudgetTransactionCount(string memory _budgetId) external view returns (uint256) {
        return budgetTransactions[_budgetId].length;
    }

    function getBudgetTransactionByIndex(string memory _budgetId, uint256 _index)
        external
        view
        returns (string memory)
    {
        require(_index < budgetTransactions[_budgetId].length, "Index out of bounds");
        return budgetTransactions[_budgetId][_index];
    }
}
