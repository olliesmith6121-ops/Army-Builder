
const savedLists = [
    { id: "123", name: "List A", updatedAt: 1000 },
    { id: "456", name: "List B", updatedAt: 2000 }
];

const localLists = [
    { id: "123", name: "List A", updatedAt: 1000 }, // Should be skipped (same ID, same time)
    { id: "789", name: "List C", updatedAt: 3000 }, // Should be imported
    { id: "456", name: "List B", updatedAt: 1000 }  // Local is OLDER than cloud. Should be skipped?
    // My code says: if (existing && existing.updatedAt >= local.updatedAt) -> Skip.
    // 2000 >= 1000 -> True. Skip. Correct.
];

const currentMap = new Map(savedLists.map(l => [l.id, l]));
const imported = [];

localLists.forEach(l => {
    const existing = currentMap.get(l.id);
    if (existing && (existing.updatedAt || 0) >= (l.updatedAt || 0)) {
        console.log('Skipping:', l.name);
        return;
    }
    imported.push({ ...l, name: l.name + ' (Imported)' });
});

console.log('Imported:', JSON.stringify(imported, null, 2));

if (imported.length === 1 && imported[0].name === "List C (Imported)") {
    console.log("TEST PASSED");
} else {
    console.log("TEST FAILED");
}
