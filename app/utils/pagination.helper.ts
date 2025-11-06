export function getPaginationWindow(currentPage: number, totalPages: number, windowSize = 5) {
    const actualWindowSize = Math.min(windowSize, totalPages);

    let startPage = Math.max(1, currentPage - Math.floor(actualWindowSize / 2));
    let endPage = Math.min(totalPages, startPage + actualWindowSize - 1);

    if (endPage === totalPages) {
        startPage = Math.max(1, totalPages - actualWindowSize + 1);
    }

    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
    }

    return pages;
}