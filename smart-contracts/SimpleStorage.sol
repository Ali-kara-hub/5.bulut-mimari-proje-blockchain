// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SimpleStorage {
    // Blockchain üzerinde saklanacak veri
    string private data;
    
    // Veriyi kimin güncellediğini takip etmek için adres tutuyoruz
    address public lastUpdater;

    // Veri her güncellendiğinde backend'e haber uçuracak bir olay (Event)
    event DataChanged(string newValue, address updater);

    // Blockchain'e yeni veri yazma fonksiyonu (Yazma işlemleri GAS ücreti harcar)
    function setData(string memory _newData) public {
        data = _newData;
        lastUpdater = msg.sender; // İşlemi yapan kişinin cüzdan adresi
        
        // Olayı tetikle (Node.js backend bu olayı dinleyecek)
        emit DataChanged(_newData, msg.sender);
    }

    // Blockchain'den veri okuma fonksiyonu (Okuma işlemleri BEDAVADIR, gas harcamaz)
    function getData() public view returns (string memory) {
        return data;
    }
}