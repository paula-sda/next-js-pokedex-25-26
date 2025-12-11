import { screen, render } from "@testing-library/react";
import Pagination from "../home/pagination";

describe('PaginationComponent', () => {
    it('debería renderizar la página actual como activa', () => {
        render(<Pagination currentPage={1} totalPages={10} />);
        const pageOneLink = screen.getByRole('link', {name: '1'});

        expect(pageOneLink).toBeInTheDocument();
        expect(pageOneLink).toHaveClass('bg-blue-600');
    });

    it('debería mostrar puntos suspensivos si hay muchas páginas', () => {
        render(<Pagination currentPage={10} totalPages={20} />);
        const ellipsis = screen.getAllByText('...');
        expect(ellipsis.length).toBeGreaterThanOrEqual(1);
    })
});