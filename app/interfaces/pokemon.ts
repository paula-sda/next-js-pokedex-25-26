export interface Pokemon {
    name: string;
    url: string;
}

export interface PokemonData {
    count: number;
    next: string | null;
    previous: string | null;
    results: Pokemon[];
}

export interface PokemonListPageProps {
    searchParams: Promise<{ page?: string }>;
}

export interface PokemonDetailPageProps {
    params: Promise<{
        id: string;
    }>;
}
export interface PokemonDetail {
    name: string;
    id: number;
    sprites: {
        back_default?: string;
        back_shiny?: string;
        front_default: string;
        front_shiny: string;
    }
}