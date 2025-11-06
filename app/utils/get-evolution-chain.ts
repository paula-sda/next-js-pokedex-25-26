// app/utils/get-evolution-chain.ts
export async function getEvolutionChain(speciesUrl: string) {
    try {
      // First, get the species data
      const speciesResponse = await fetch(speciesUrl);
      const speciesData = await speciesResponse.json();
      
      // Then, get the evolution chain
      const evolutionResponse = await fetch(speciesData.evolution_chain.url);
      const evolutionData = await evolutionResponse.json();
      
      return evolutionData;
    } catch (error) {
      console.error('Error fetching evolution chain:', error);
      return null;
    }
  }
  
  // Helper function to extract all pokemon from the evolution chain
  export function parseEvolutionChain(chain: any): Array<{ name: string; id: number }> {
    const evolutions: Array<{ name: string; id: number }> = [];
    
    function traverseChain(chainLink: any) {
      if (chainLink.species) {
        // Extract ID from the species URL
        const urlParts = chainLink.species.url.split('/');
        const id = parseInt(urlParts[urlParts.length - 2]);
        
        evolutions.push({
          name: chainLink.species.name,
          id: id
        });
      }
      
      // Recursively traverse evolutions
      if (chainLink.evolves_to && chainLink.evolves_to.length > 0) {
        chainLink.evolves_to.forEach((evolution: any) => {
          traverseChain(evolution);
        });
      }
    }
    
    traverseChain(chain);
    return evolutions;
  }