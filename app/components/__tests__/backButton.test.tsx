import { useRouter } from "next/navigation";
import { fireEvent, render, screen } from '@testing-library/react'
import BackButton from "../backButton";

// Mockear el hook useRouter
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));

describe('BackButton', () => {
    it('debería renderizar el componente y navegar atrás al hacer click', () => {
        const backMock = jest.fn();
        (useRouter as jest.Mock).mockReturnValue({
            back: backMock,
        });

        render(<BackButton />);

        const button = screen.getByRole('button', {name: /Volver atrás/i});

        expect(button).toBeInTheDocument();

        fireEvent.click(button);

        expect(backMock).toHaveBeenCalledTimes(1);
    })
});