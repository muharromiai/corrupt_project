// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract BudgetManager {
    struct Budget {
        string budgetId;
        string name;
        string category;
        uint256 totalAmount;
        uint256 fiscalYear;
        address createdBy;
        uint256 createdAt;
        bool exists;
    }

    mapping(string => Budget) public budgets;
    string[] public budgetIds;

    event BudgetCreated(
        string indexed budgetId,
        string name,
        string category,
        uint256 totalAmount,
        uint256 fiscalYear,
        address indexed createdBy,
        uint256 timestamp
    );

    event BudgetUpdated(
        string indexed budgetId,
        string name,
        uint256 totalAmount,
        address indexed updatedBy,
        uint256 timestamp
    );

    modifier budgetExists(string memory _budgetId) {
        require(budgets[_budgetId].exists, "Budget does not exist");
        _;
    }

    modifier budgetNotExists(string memory _budgetId) {
        require(!budgets[_budgetId].exists, "Budget already exists");
        _;
    }

    function createBudget(
        string memory _budgetId,
        string memory _name,
        string memory _category,
        uint256 _totalAmount,
        uint256 _fiscalYear
    ) external budgetNotExists(_budgetId) {
        require(bytes(_budgetId).length > 0, "Budget ID cannot be empty");
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(_totalAmount > 0, "Total amount must be greater than 0");
        require(_fiscalYear > 2000, "Invalid fiscal year");

        budgets[_budgetId] = Budget({
            budgetId: _budgetId,
            name: _name,
            category: _category,
            totalAmount: _totalAmount,
            fiscalYear: _fiscalYear,
            createdBy: msg.sender,
            createdAt: block.timestamp,
            exists: true
        });

        budgetIds.push(_budgetId);

        emit BudgetCreated(
            _budgetId,
            _name,
            _category,
            _totalAmount,
            _fiscalYear,
            msg.sender,
            block.timestamp
        );
    }

    function updateBudget(
        string memory _budgetId,
        string memory _name,
        uint256 _totalAmount
    ) external budgetExists(_budgetId) {
        Budget storage budget = budgets[_budgetId];
        budget.name = _name;
        budget.totalAmount = _totalAmount;

        emit BudgetUpdated(
            _budgetId,
            _name,
            _totalAmount,
            msg.sender,
            block.timestamp
        );
    }

    function getBudget(string memory _budgetId)
        external
        view
        budgetExists(_budgetId)
        returns (
            string memory name,
            string memory category,
            uint256 totalAmount,
            uint256 fiscalYear,
            address createdBy,
            uint256 createdAt
        )
    {
        Budget memory b = budgets[_budgetId];
        return (b.name, b.category, b.totalAmount, b.fiscalYear, b.createdBy, b.createdAt);
    }

    function getTotalBudgets() external view returns (uint256) {
        return budgetIds.length;
    }

    function getBudgetIdByIndex(uint256 _index) external view returns (string memory) {
        require(_index < budgetIds.length, "Index out of bounds");
        return budgetIds[_index];
    }
}
