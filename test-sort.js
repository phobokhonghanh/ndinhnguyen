const bookmarks = [
  { id: 3, createdAt: '2024-01-03T00:00:00.000Z', title: 'C' },
  { id: 2, createdAt: '2024-01-02T00:00:00.000Z', title: 'B' },
  { id: 1, createdAt: '2024-01-01T00:00:00.000Z', title: 'A' },
];

let localSortBy = 'createdAt';
let localSortOrder = 'desc';

// Mô phỏng lần click đầu tiên vào cột 'createdAt'
function clickCreatedAt() {
  if (localSortBy === 'createdAt') {
    localSortOrder = localSortOrder === 'asc' ? 'desc' : 'asc';
  } else {
    localSortBy = 'createdAt';
    localSortOrder = 'desc';
  }
}

clickCreatedAt(); // Kích hoạt click lần đầu -> localSortOrder sẽ thành 'asc'

const sortedBookmarks = [...bookmarks].sort((a, b) => {
  let valA = a[localSortBy] ?? '';
  let valB = b[localSortBy] ?? '';

  if (localSortBy === 'createdAt') {
    valA = new Date(a.createdAt).getTime();
    valB = new Date(b.createdAt).getTime();
  } else {
    valA = valA.toString().toLowerCase();
    valB = valB.toString().toLowerCase();
  }

  if (valA < valB) return localSortOrder === 'asc' ? -1 : 1;
  if (valA > valB) return localSortOrder === 'asc' ? 1 : -1;
  return 0;
});

console.log("Chiều sắp xếp sau khi click:", localSortOrder);
console.log("Kết quả mảng ban đầu:", bookmarks.map(b => b.id).join(", "));
console.log("Kết quả mảng sau khi sort:", sortedBookmarks.map(b => b.id).join(", "));
