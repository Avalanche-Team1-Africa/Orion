// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

// Import OpenZeppelin's ERC-1155 and access control utilities
import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NSEShares is ERC1155, Ownable {
    uint256 public constant TOTAL_SHARES = 58;
    address public constant holdingWallet = 0x245A972B2df724a443E64B5948DEb5a89102641e;

    mapping(uint256 => string) public shareSymbols;

    event SharePurchased(address indexed buyer, uint256 indexed tokenId, uint256 amount);
    event ShareSellRequest(address indexed seller, uint256 indexed tokenId, uint256 amount, uint256 requestedPrice);

    constructor() ERC1155("https://nse-seven.vercel.app/api/shares/{id}.json") Ownable(msg.sender) {
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

    //backend calls this after receiving payment to transfer shares to buyer
    function buyShare(uint256 tokenId, uint256 amount, address recipient) external onlyOwner {
        require(tokenId < TOTAL_SHARES, "Invalid token ID");
        require(balanceOf(msg.sender, tokenId) >= amount, "Not enough shares available");

        safeTransferFrom(msg.sender, recipient, tokenId, amount, "");

        emit SharePurchased(recipient, tokenId, amount);
    }

    //user calls this to sell their shares back to holdingWallet
    function sellShares(uint256 tokenId, uint256 amount, uint256 requestedPrice) external {
        require(balanceOf(msg.sender, tokenId) >= amount, "Not enough shares to sell");

        // Transfer shares from user to holding address
        safeTransferFrom(msg.sender, holdingWallet, tokenId, amount, "");

        emit ShareSellRequest(msg.sender, tokenId, amount, requestedPrice);
    }

    //function to check how many shares of a specific nse stock a user owns
    function checkShareBalance(address user, uint256 tokenId) external view returns (uint256) {
        return balanceOf(user, tokenId);
    }
}
