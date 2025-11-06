'use client';
import Link from "next/link";
import { PaginationComponentProps } from "../interfaces/pokemon";
import { getPaginationWindow } from "../utils/pagination.helper";
import { activeClass, baseClass, ellipsisClass, normalClass, paginationWindowSize } from "../constants/listing.constants";

export default function Pagination({ currentPage, totalPages }: PaginationComponentProps) {
    const pageNumbers = getPaginationWindow(currentPage, totalPages, paginationWindowSize);
    const showFirstEllipsis = pageNumbers[0] > 1;
    const showLastEllipsis = pageNumbers[pageNumbers.length - 1] < totalPages;
    const showFirstButton = currentPage > 1 && showFirstEllipsis;
    const showLastButton = currentPage < totalPages && showLastEllipsis;

    return (
        <nav className="flex gap-4 justify-center items-center mt-3">
            {
                showFirstButton && (
                    <Link
                        href={`/`}
                        className={`${baseClass} ${normalClass}`}>
                        1
                    </Link>
                )
            }

            {/* Puntos suspensivos al inicio */}
            {showFirstEllipsis && (
                <span className={ellipsisClass}>...</span>
            )}

            {
                pageNumbers.map((page) => (
                    <Link
                        key={page}
                        href={`/?page=${page}`}
                        className={`${baseClass} ${currentPage === page ? activeClass : normalClass}`}>
                        {page}
                    </Link>
                ))
            }

            {showLastEllipsis && (
                <span className={ellipsisClass}>...</span>
            )}

            {
                showLastButton && (
                    <Link
                        href={`/?page=${totalPages}`}
                        className={`${baseClass} ${normalClass}`}>
                        {totalPages}
                    </Link>
                )
            }
        </nav>
    )
}