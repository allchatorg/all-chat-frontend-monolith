import React, {ChangeEvent, KeyboardEvent, useState} from 'react';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious
} from '@/components/ui/pagination';

interface PaginationFooterProps {
    totalPages: number;
    currentPage: number;
    onPageChange: (page: number) => void;
    className?: string;
}

const PaginationFooter: React.FC<PaginationFooterProps> = ({
                                                               totalPages,
                                                               currentPage,
                                                               onPageChange,
                                                               className = ''
                                                           }) => {
    const [activeInputIndex, setActiveInputIndex] = useState<number | null>(null);
    const [pageInput, setPageInput] = useState<string>('');

    const handlePageInputSubmit = (): void => {
        const pageNum: number = parseInt(pageInput, 10);
        if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
            onPageChange(pageNum);
        }
        setPageInput('');
        setActiveInputIndex(null);
    };

    const onPageInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
        setPageInput(e.target.value);
    };

    const onPageInputKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
        if (e.key === 'Enter') handlePageInputSubmit();
        if (e.key === 'Escape') {
            setActiveInputIndex(null);
            setPageInput('');
        }
    };

    const getPaginationRange = (): Array<number | 'ellipsis'> => {
        const range: Array<number | 'ellipsis'> = [];
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) range.push(i);
        } else {
            range.push(1);
            if (currentPage <= 2) {
                range.push(2, 3, 'ellipsis', totalPages);
            } else if (currentPage >= totalPages - 1) {
                range.push('ellipsis', totalPages - 2, totalPages - 1, totalPages);
            } else {
                range.push('ellipsis', currentPage, 'ellipsis', totalPages);
            }
        }
        return range;
    };

    if (totalPages <= 1) {
        return null;
    }

    const paginationRange = getPaginationRange();

    return (
        <div className={`glass-surface p-4 border-t mt-auto ${className}`}>
            <Pagination>
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            href="#"
                            className="glass-control"
                            onClick={(e) => {
                                e.preventDefault();
                                if (currentPage > 1) {
                                    onPageChange(currentPage - 1);
                                }
                            }}
                        />
                    </PaginationItem>

                    {paginationRange.map((item, idx) => (
                        <PaginationItem key={idx}>
                            {item === 'ellipsis' ? (
                                activeInputIndex === idx ? (
                                    <input
                                        type="number"
                                        className="glass-input w-12 rounded px-1 text-center text-sm py-0.5"
                                        placeholder="pg"
                                        autoFocus
                                        value={pageInput}
                                        onChange={onPageInputChange}
                                        onKeyDown={onPageInputKeyDown}
                                        onBlur={handlePageInputSubmit}
                                        min={1}
                                        max={totalPages}
                                    />
                                ) : (
                                    <button
                                        onClick={() => {
                                            setActiveInputIndex(idx);
                                            setPageInput('');
                                        }}
                                        className="glass-control rounded px-2 py-1 text-sm text-muted-foreground"
                                    >
                                        ...
                                    </button>
                                )
                            ) : (
                                <PaginationLink
                                    href="#"
                                    isActive={item === currentPage}
                                    className={item === currentPage ? "glass-surface-strong" : "glass-control"}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        onPageChange(item as number);
                                    }}
                                >
                                    {item}
                                </PaginationLink>
                            )}
                        </PaginationItem>
                    ))}

                    <PaginationItem>
                        <PaginationNext
                            href="#"
                            className="glass-control"
                            onClick={(e) => {
                                e.preventDefault();
                                if (currentPage < totalPages) {
                                    onPageChange(currentPage + 1);
                                }
                            }}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    );
};

export default PaginationFooter;
