// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

// Import OpenZeppelin's ERC-1155 and access control utilities
import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NSEShares is ERC1155, Ownable {
    uint256 public constant TOTAL_SHARES = 58;

    mapping(uint256 => string) public shareSymbols;

    constructor() ERC1155("https://yourdomain.com/api/shares/{id}.json") {
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
}
