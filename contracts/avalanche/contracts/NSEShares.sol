// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

// Import OpenZeppelin's ERC-1155 and access control utilities
import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NSEShares is ERC1155, Ownable {
    uint256 public constant TOTAL_SHARES = 58;

    mapping(uint256 => string) public shareSymbols;

    event SharePurchased(address indexed buyer, uint256 indexed tokenId, uint256 amount);
    event ShareSold(address indexed seller, uint256 indexed tokenId, uint256 amount, uint256 totalPrice);
    event Withdrawal(address indexed owner, uint256 amount);


    constructor() ERC1155("https://https://nse-seven.vercel.app/api/shares/{id}.json") Ownable(msg.sender) {
        string[58] memory symbols = [
            "SCOM", "EQTY", "EABL", "KCB", "SCBK", "ABSA", "COOP", "NCBA", "SBIC", "IMH",
            "BAT", "KEGN", "BKG", "KQ", "UMME", "DTK", "BAMB", "BRIT", "JUB", "TOTL",
            "KPLC", "KNRE", "KUKZ", "CIC", "CTUM", "LBTY", "CARB", "CRWN", "TPSE", "WTK",
            "SASN", "PORT", "NBV", "HFCK", "NMG", "NSE", "UNGA", "KAPC", "CGEN", "BOC",
            "TCL", "SLAM", "SCAN", "SMER", "LIMT", "LKL", "AMAC", "CABL", "SGL", "EGAD",
            "HAFR", "EVRD", "FTGH", "XPRS", "UCHM", "OCH", "KURV", "GLD"
        ];

        for (uint256 i = 0; i < TOTAL_SHARES; i++) {
            _mint(msg.sender, i, 1_000_000_000, "");
            shareSymbols[i] = symbols[i];
        }
    }

    //buy function to transfer shares to buyer when payment is confirmed
    function buyShare(uint256 tokenId, uint256 amount, address recipient) external onlyOwner {
        require(tokenId < TOTAL_SHARES, "Invalid token ID");
        require(balanceOf(msg.sender, tokenId) >= amount, "Not enough shares available");

        safeTransferFrom(msg.sender, recipient, tokenId, amount, "");

        emit SharePurchased(recipient, tokenId, amount);
    }

    //function to sell shares back to the contract
    function sellShares(uint256 tokenId, uint256 amount, uint256 pricePerShare) external {
        require(balanceOf(msg.sender, tokenId) >= amount, "Not enough shares to sell");

        uint256 totalPrice = pricePerShare * amount; // Calculate how much AVAX to pay back
        require(address(this).balance >= totalPrice, "Contract does not have enough AVAX");

        // Transfer shares from user to contract
        safeTransferFrom(msg.sender, address(this), tokenId, amount, "");

        // Send AVAX to the user
        payable(msg.sender).transfer(totalPrice);

        emit ShareSold(msg.sender, tokenId, amount, totalPrice);
    }

    //function to check how many shares of a specific nse stock a user owns
    function checkShareBalance(address user, uint256 tokenId) external view returns (uint256) {
        return balanceOf(user, tokenId);
    }

    // Only owner can withdraw AVAX accumulated in the contract
    function withdraw(uint256 amount) external onlyOwner {
        require(address(this).balance >= amount, "Not enough balance to withdraw");

        // Send the specified amount of AVAX to the owner
        payable(owner()).transfer(amount);
        emit Withdrawal(owner(), amount);
    }

    receive() external payable {}
    fallback() external payable {}

}
