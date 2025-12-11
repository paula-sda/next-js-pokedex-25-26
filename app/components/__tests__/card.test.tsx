import { screen, render } from "@testing-library/react";
import Card from "../home/card";

describe('CardComponent', () => {
    it('debería renderizar la imagen y el nombre del pokémon', () => {
        const mockProps = {
            pokemonIndex: 25,
            pokemonName: 'Pikachu',
        };

        render(<Card {...mockProps} />);

        expect(screen.getByText('Pikachu')).toBeInTheDocument();

        const image = screen.getByRole('img', {name: 'Pikachu'});
        
        expect(image).toBeInTheDocument();
        expect(image).toHaveAttribute('src');
        expect(image.getAttribute('src')).toContain('25.png');

        const link = screen.getByRole('link');
        expect(link).toHaveAttribute('href', '/pokemon/25');
    })
});