function getTransaksi() {
  return JSON.parse(localStorage.getItem("transaksi")) || [];
}

function saveTransaksi(data) {
  localStorage.setItem("transaksi", JSON.stringify(data));
}
