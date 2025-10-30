export function calculatePokemonNumber (currentPage: number, index: number) {
    return (currentPage - 1) * 20 + index + 1;
}